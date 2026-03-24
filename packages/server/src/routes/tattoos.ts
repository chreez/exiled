import { Hono } from "hono";
import { z } from "zod";
import { cache } from "../lib/cache.js";
import { PORTS, type Port, type PortDefinition } from "../tattoos.js";
import { getLeagueApiName } from "../types.js";

const USER_AGENT = "poe-local-tool/1.0";
const TATTOO_TTL = 30 * 60; // 30 minutes
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

// --- poe.ninja exchange API schemas ---

const ExchangeLineSchema = z.object({
  id: z.string(),
  primaryValue: z.number(),
});

const ExchangeResponseSchema = z.object({
  lines: z.array(ExchangeLineSchema).optional(),
  core: z
    .object({
      rates: z.object({ divine: z.number().nonnegative().optional() }),
    })
    .optional(),
});

// --- Types ---

type TattooPrice = {
  tattoo_name: string;
  trade_id: string;
  description: string;
  chaos_value: number | null;
  divine_value: number | null;
};

type PortResult = {
  port: Port;
  label: string;
  attribute: string;
  avg_chaos_per_tattoo: number | null;
  avg_divine_per_tattoo: number | null;
  total_tattoos: number;
  priced_tattoos: number;
  tattoos: TattooPrice[];
};

type TattooResponse = {
  ports: PortResult[];
  divine_chaos_ratio: number | null;
  cachedAt: string;
  warnings?: string[];
  stale?: boolean;
};

// --- Fetch ---

async function fetchTattooExchange(leagueApiName: string) {
  const url = `https://poe.ninja/poe1/api/economy/exchange/current/overview?league=${encodeURIComponent(leagueApiName)}&type=Tattoo`;
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) throw new Error(`poe.ninja tattoo exchange returned ${res.status}`);
  const json = await res.json();
  return ExchangeResponseSchema.parse(json);
}

// --- Calculation ---

function buildPortResult(
  portDef: PortDefinition,
  priceMap: Map<string, number>,
  divineRate: number | null
): PortResult {
  const tattoos: TattooPrice[] = portDef.tattoos.map((t) => {
    const chaosValue = priceMap.get(t.trade_id) ?? null;
    return {
      tattoo_name: t.tattoo_name,
      trade_id: t.trade_id,
      description: t.description,
      chaos_value: chaosValue !== null ? Math.round(chaosValue * 100) / 100 : null,
      divine_value:
        chaosValue !== null && divineRate !== null && divineRate > 0
          ? Math.round(chaosValue * divineRate * 10000) / 10000
          : null,
    };
  });

  const priced = tattoos.filter((t) => t.chaos_value !== null);
  const avgChaos =
    priced.length > 0
      ? priced.reduce((sum, t) => sum + t.chaos_value!, 0) / priced.length
      : null;
  const avgDivine =
    avgChaos !== null && divineRate !== null && divineRate > 0
      ? avgChaos * divineRate
      : null;

  return {
    port: portDef.port,
    label: portDef.label,
    attribute: portDef.attribute,
    avg_chaos_per_tattoo: avgChaos !== null ? Math.round(avgChaos * 100) / 100 : null,
    avg_divine_per_tattoo: avgDivine !== null ? Math.round(avgDivine * 10000) / 10000 : null,
    total_tattoos: tattoos.length,
    priced_tattoos: priced.length,
    tattoos,
  };
}

// --- Router ---

export const tattoosRouter = new Hono();

tattoosRouter.get("/:league", async (c) => {
  const leagueSlug = c.req.param("league");
  const leagueApiName = getLeagueApiName(leagueSlug);

  if (!leagueApiName) {
    return c.json({ error: `Unknown league: ${leagueSlug}` }, 400);
  }

  const force = c.req.query("force") === "1";
  const cacheKey = `tattoos:${leagueSlug}`;

  if (!force) {
    const cached = cache.get<TattooResponse>(cacheKey);
    if (cached) return c.json(cached);
  }

  const warnings: string[] = [];

  let parsed;
  try {
    parsed = await withRetry(() => fetchTattooExchange(leagueApiName));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    warnings.push(`Failed to fetch tattoo prices: ${msg}`);

    const stale = cache.getStale<TattooResponse>(cacheKey);
    if (stale) return c.json({ ...stale, stale: true, warnings });
    return c.json({ error: warnings.join("; ") }, 502);
  }

  const divineRate = parsed.core?.rates.divine ?? null;

  // Build price lookup by id (exchange API uses `id` not `detailsId`)
  const priceMap = new Map<string, number>();
  for (const line of parsed.lines ?? []) {
    priceMap.set(line.id, line.primaryValue);
  }

  // Build per-port results and rank by avg chaos descending
  const ports = Object.values(PORTS)
    .map((portDef) => buildPortResult(portDef, priceMap, divineRate))
    .sort((a, b) => (b.avg_chaos_per_tattoo ?? 0) - (a.avg_chaos_per_tattoo ?? 0));

  const data: TattooResponse = {
    ports,
    divine_chaos_ratio: divineRate,
    cachedAt: new Date().toISOString(),
    ...(warnings.length > 0 ? { warnings } : {}),
  };

  cache.set(cacheKey, data, TATTOO_TTL);
  return c.json(data);
});
