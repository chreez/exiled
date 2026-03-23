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

// GET /api/prices/:league
pricesRouter.get("/:league", async (c) => {
  const leagueSlug = c.req.param("league");
  const leagueApiName = getLeagueApiName(leagueSlug);

  if (!leagueApiName) {
    return c.json({ error: `Unknown league: ${leagueSlug}` }, 400);
  }

  const cacheKey = `prices:${leagueSlug}`;
  const cached = cache.get<PriceItem[]>(cacheKey);
  if (cached) {
    return c.json(cached);
  }

  try {
    const results = await Promise.all(
      ITEM_TYPES.map((type) => fetchItemOverview(type, leagueApiName))
    );
    const deduped = dedupeCheapestVariants(results.flat());
    const items = deduped.map(stripDetailsId);
    cache.set(cacheKey, items, PRICES_TTL);
    return c.json(items);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return c.json({ error: message }, 502);
  }
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
