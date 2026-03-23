import { Hono } from "hono";
import { cache } from "../lib/cache.js";
import {
  type AllowedUnique,
  type PriceItem,
  type InternalPriceItem,
  type CurrencyData,
  ItemOverviewResponseSchema,
  CurrencyOverviewResponseSchema,
  getLeagueApiName,
} from "../types.js";
import { dedupeCheapestVariants } from "../lib/dedup.js";

const ITEM_TYPES: AllowedUnique[] = [
  "UniqueWeapon",
  "UniqueArmour",
  "UniqueAccessory",
];

const USER_AGENT = "poe-local-tool/1.0";
const PRICES_TTL = 30 * 60; // 30 minutes
const CURRENCY_TTL = 24 * 60 * 60; // 1 day
const MAX_RETRIES = 3;

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
    }
  }
  throw new Error("Unreachable");
}

async function fetchItemOverview(
  type: AllowedUnique,
  leagueApiName: string
): Promise<InternalPriceItem[]> {
  const url = `https://poe.ninja/api/data/itemoverview?type=${type}&league=${encodeURIComponent(leagueApiName)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!res.ok) {
    throw new Error(`poe.ninja returned ${res.status} for ${type}`);
  }

  const json = await res.json();
  const parsed = ItemOverviewResponseSchema.parse(json);
  const lines = parsed.lines ?? [];

  return lines
    .filter((line) => line.chaosValue >= 0.01)
    .map((line) => ({
      type,
      name: line.name,
      chaos: line.chaosValue,
      divine: line.divineValue,
      baseType: line.baseType,
      icon: line.icon,
      listingCount: line.listingCount,
      detailsId: line.detailsId,
      itemType: line.itemType,
    }));
}

function stripDetailsId({ detailsId, ...item }: InternalPriceItem): PriceItem {
  return item;
}

export const pricesRouter = new Hono();

type CachedPrices = {
  items: PriceItem[];
  cachedAt: string;
  warnings?: string[];
  stale?: boolean;
};

// GET /api/prices/:league
pricesRouter.get("/:league", async (c) => {
  const leagueSlug = c.req.param("league");
  const leagueApiName = getLeagueApiName(leagueSlug);

  if (!leagueApiName) {
    return c.json({ error: `Unknown league: ${leagueSlug}` }, 400);
  }

  const force = c.req.query("force") === "1";
  const cacheKey = `prices:${leagueSlug}`;

  if (!force) {
    const cached = cache.get<CachedPrices>(cacheKey);
    if (cached) {
      return c.json(cached);
    }
  }

  const results = await Promise.allSettled(
    ITEM_TYPES.map((type) =>
      withRetry(() => fetchItemOverview(type, leagueApiName))
    )
  );

  const allItems: InternalPriceItem[] = [];
  const warnings: string[] = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === "fulfilled") {
      allItems.push(...result.value);
    } else {
      const msg = result.reason instanceof Error ? result.reason.message : "Unknown error";
      warnings.push(`Failed to fetch ${ITEM_TYPES[i]}: ${msg}`);
    }
  }

  // All failed - try stale cache, else 502
  if (allItems.length === 0) {
    const stale = cache.getStale<CachedPrices>(cacheKey);
    if (stale) {
      return c.json({ ...stale, stale: true, warnings });
    }
    return c.json({ error: warnings.join("; ") }, 502);
  }

  const deduped = dedupeCheapestVariants(allItems);
  const data: CachedPrices = {
    items: deduped.map(stripDetailsId),
    cachedAt: new Date().toISOString(),
    ...(warnings.length > 0 ? { warnings } : {}),
  };
  cache.set(cacheKey, data, PRICES_TTL);
  return c.json(data);
});

// GET /api/currency/:league
export const currencyRouter = new Hono();

currencyRouter.get("/:league", async (c) => {
  const leagueSlug = c.req.param("league");
  const leagueApiName = getLeagueApiName(leagueSlug);

  if (!leagueApiName) {
    return c.json({ error: `Unknown league: ${leagueSlug}` }, 400);
  }

  const cacheKey = `currency:${leagueSlug}`;
  const cached = cache.get<CurrencyData>(cacheKey);
  if (cached) {
    return c.json(cached);
  }

  try {
    const url = `https://poe.ninja/poe1/api/economy/exchange/current/overview?league=${encodeURIComponent(leagueApiName)}&type=Currency`;
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
    });

    if (!res.ok) {
      throw new Error(`poe.ninja currency returned ${res.status}`);
    }

    const json = await res.json();
    const parsed = CurrencyOverviewResponseSchema.parse(json);

    // Find cheapest catalyst (excluding tainted)
    const catalysts = (parsed.lines ?? []).filter(
      (line) =>
        line.id.endsWith("-catalyst") &&
        !line.id.includes("tainted") &&
        line.primaryValue != null &&
        line.primaryValue > 0
    );

    const cheapest = catalysts.length
      ? catalysts.reduce((min, item) =>
          (item.primaryValue ?? Infinity) < (min.primaryValue ?? Infinity)
            ? item
            : min
        )
      : null;

    const data: CurrencyData = {
      catalyst: cheapest
        ? { id: cheapest.id, primaryValue: cheapest.primaryValue! }
        : null,
      divineRate: parsed.core?.rates.divine ?? null,
    };

    cache.set(cacheKey, data, CURRENCY_TTL);
    return c.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return c.json({ error: message }, 502);
  }
});
