import { Hono } from "hono";
import { z } from "zod";
import { cache } from "../lib/cache.js";
import { RUNEGRAFT_PORTS, type RunegraftPort, type RunegraftPortDefinition } from "../runegrafts.js";
import { getLeagueApiName } from "../types.js";

const USER_AGENT = "poe-local-tool/1.0";
const RUNEGRAFT_TTL = 30 * 60; // 30 minutes
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

type RunegraftPrice = {
  runegraft_name: string;
  trade_id: string;
  description: string;
  chaos_value: number | null;
  divine_value: number | null;
};

type RunegraftPortResult = {
  port: RunegraftPort;
  label: string;
  attribute: string;
  avg_chaos_per_runegraft: number | null;
  avg_divine_per_runegraft: number | null;
  total_runegrafts: number;
  priced_runegrafts: number;
  runegrafts: RunegraftPrice[];
};

type RunegraftResponse = {
  ports: RunegraftPortResult[];
  divine_chaos_ratio: number | null;
  cachedAt: string;
  warnings?: string[];
  stale?: boolean;
};

// --- Fetch ---

async function fetchRunegraftExchange(leagueApiName: string) {
  const url = `https://poe.ninja/poe1/api/economy/exchange/current/overview?league=${encodeURIComponent(leagueApiName)}&type=Runegraft`;
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) throw new Error(`poe.ninja runegraft exchange returned ${res.status}`);
  const json = await res.json();
  return ExchangeResponseSchema.parse(json);
}

// --- Calculation ---

function buildPortResult(
  portDef: RunegraftPortDefinition,
  priceMap: Map<string, number>,
  divineRate: number | null
): RunegraftPortResult {
  const runegrafts: RunegraftPrice[] = portDef.runegrafts.map((r) => {
    const chaosValue = priceMap.get(r.trade_id) ?? null;
    return {
      runegraft_name: r.runegraft_name,
      trade_id: r.trade_id,
      description: r.description,
      chaos_value: chaosValue !== null ? Math.round(chaosValue * 100) / 100 : null,
      divine_value:
        chaosValue !== null && divineRate !== null && divineRate > 0
          ? Math.round(chaosValue * divineRate * 10000) / 10000
          : null,
    };
  });

  const priced = runegrafts.filter((r) => r.chaos_value !== null);
  const avgChaos =
    priced.length > 0
      ? priced.reduce((sum, r) => sum + r.chaos_value!, 0) / priced.length
      : null;
  const avgDivine =
    avgChaos !== null && divineRate !== null && divineRate > 0
      ? avgChaos * divineRate
      : null;

  return {
    port: portDef.port,
    label: portDef.label,
    attribute: portDef.attribute,
    avg_chaos_per_runegraft: avgChaos !== null ? Math.round(avgChaos * 100) / 100 : null,
    avg_divine_per_runegraft: avgDivine !== null ? Math.round(avgDivine * 10000) / 10000 : null,
    total_runegrafts: runegrafts.length,
    priced_runegrafts: priced.length,
    runegrafts,
  };
}

// --- Router ---

export const runegraftsRouter = new Hono();

runegraftsRouter.get("/:league", async (c) => {
  const leagueSlug = c.req.param("league");
  const leagueApiName = getLeagueApiName(leagueSlug);

  if (!leagueApiName) {
    return c.json({ error: `Unknown league: ${leagueSlug}` }, 400);
  }

  const force = c.req.query("force") === "1";
  const cacheKey = `runegrafts:${leagueSlug}`;

  if (!force) {
    const cached = cache.get<RunegraftResponse>(cacheKey);
    if (cached) return c.json(cached);
  }

  const warnings: string[] = [];

  let parsed;
  try {
    parsed = await withRetry(() => fetchRunegraftExchange(leagueApiName));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    warnings.push(`Failed to fetch runegraft prices: ${msg}`);

    const stale = cache.getStale<RunegraftResponse>(cacheKey);
    if (stale) return c.json({ ...stale, stale: true, warnings });
    return c.json({ error: warnings.join("; ") }, 502);
  }

  const divineRate = parsed.core?.rates.divine ?? null;

  // Build price lookup by id
  const priceMap = new Map<string, number>();
  for (const line of parsed.lines ?? []) {
    priceMap.set(line.id, line.primaryValue);
  }

  // Build per-port results and rank by avg chaos descending
  const ports = Object.values(RUNEGRAFT_PORTS)
    .map((portDef) => buildPortResult(portDef, priceMap, divineRate))
    .sort((a, b) => (b.avg_chaos_per_runegraft ?? 0) - (a.avg_chaos_per_runegraft ?? 0));

  const data: RunegraftResponse = {
    ports,
    divine_chaos_ratio: divineRate,
    cachedAt: new Date().toISOString(),
    ...(warnings.length > 0 ? { warnings } : {}),
  };

  cache.set(cacheKey, data, RUNEGRAFT_TTL);
  return c.json(data);
});
