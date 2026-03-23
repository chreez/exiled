export interface PriceItem {
  type: "UniqueWeapon" | "UniqueArmour" | "UniqueAccessory";
  name: string;
  chaos: number;
  divine: number;
  baseType: string;
  icon: string;
  listingCount: number;
  itemType: string;
}

export interface CurrencyData {
  catalyst: { id: string; primaryValue: number } | null;
  divineRate: number | null;
}

export interface PriceResponse {
  items: PriceItem[];
  cachedAt: string;
}

export async function fetchPrices(
  league: string,
  force = false
): Promise<PriceResponse> {
  const url = `/api/prices/${league}${force ? "?force=1" : ""}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Failed to fetch prices: ${res.status}`);
  }
  return res.json();
}

export async function fetchCurrency(league: string): Promise<CurrencyData> {
  const res = await fetch(`/api/currency/${league}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Failed to fetch currency: ${res.status}`);
  }
  return res.json();
}
