export interface TattooPrice {
  tattoo_name: string;
  trade_id: string;
  description: string;
  chaos_value: number | null;
  divine_value: number | null;
}

export interface PortResult {
  port: string;
  label: string;
  attribute: string;
  avg_chaos_per_tattoo: number | null;
  avg_divine_per_tattoo: number | null;
  total_tattoos: number;
  priced_tattoos: number;
  tattoos: TattooPrice[];
}

export interface TattooResponse {
  ports: PortResult[];
  divine_chaos_ratio: number | null;
  cachedAt: string;
  warnings?: string[];
  stale?: boolean;
}

// --- Runegraft types ---

export interface RunegraftPrice {
  runegraft_name: string;
  trade_id: string;
  description: string;
  chaos_value: number | null;
  divine_value: number | null;
}

export interface RunegraftPortResult {
  port: string;
  label: string;
  attribute: string;
  avg_chaos_per_runegraft: number | null;
  avg_divine_per_runegraft: number | null;
  total_runegrafts: number;
  priced_runegrafts: number;
  runegrafts: RunegraftPrice[];
}

export interface RunegraftResponse {
  ports: RunegraftPortResult[];
  divine_chaos_ratio: number | null;
  cachedAt: string;
  warnings?: string[];
  stale?: boolean;
}

// --- Snapshot metadata ---

export interface SnapshotInfo {
  isSnapshot: boolean;
  snapshotDate: string | null;
  snapshotLeague: string | null;
}

interface SnapshotWrapper<T> {
  snapshotDate: string;
  league: string;
  data: T;
}

let _snapshotInfo: SnapshotInfo = {
  isSnapshot: false,
  snapshotDate: null,
  snapshotLeague: null,
};

export function getSnapshotInfo(): SnapshotInfo {
  return _snapshotInfo;
}

function setSnapshotMode(date: string, league: string) {
  _snapshotInfo = { isSnapshot: true, snapshotDate: date, snapshotLeague: league };
}

function clearSnapshotMode() {
  _snapshotInfo = { isSnapshot: false, snapshotDate: null, snapshotLeague: null };
}

async function fetchWithFallback<T>(
  apiUrl: string,
  staticPath: string,
): Promise<T> {
  // Try live API first
  try {
    const res = await fetch(apiUrl);
    if (res.ok) {
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("Not JSON");
      }
      clearSnapshotMode();
      return res.json();
    }
  } catch {
    // API unavailable or returned non-JSON, fall through to snapshot
  }

  // Fall back to static snapshot
  const res = await fetch(staticPath);
  if (!res.ok) {
    throw new Error("No live API or snapshot data available");
  }
  const wrapper: SnapshotWrapper<T> = await res.json();
  setSnapshotMode(wrapper.snapshotDate, wrapper.league);
  return wrapper.data;
}

export async function fetchTattoos(
  league: string,
  force = false,
): Promise<TattooResponse> {
  return fetchWithFallback<TattooResponse>(
    `/api/tattoos/${league}${force ? "?force=1" : ""}`,
    "/data/tattoos.json",
  );
}

export async function fetchRunegrafts(
  league: string,
  force = false,
): Promise<RunegraftResponse> {
  return fetchWithFallback<RunegraftResponse>(
    `/api/runegrafts/${league}${force ? "?force=1" : ""}`,
    "/data/runegrafts.json",
  );
}
