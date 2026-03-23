import { z } from "zod";

// --- Leagues ---

export const LEAGUES = {
  standard: { name: "Standard", apiName: "Standard" },
  hardcore: { name: "Hardcore", apiName: "Hardcore" },
  mirage: { name: "Mirage", apiName: "Mirage" },
  "hardcore-mirage": {
    name: "Hardcore Mirage",
    apiName: "Hardcore Mirage",
  },
} as const;

export type League = keyof typeof LEAGUES;
export const DEFAULT_LEAGUE: League = "mirage";

export function getLeagueApiName(slug: string): string | null {
  if (slug in LEAGUES) {
    return LEAGUES[slug as League].apiName;
  }
  return null;
}

// --- poe.ninja item prices ---

export const LineSchema = z.object({
  name: z.string(),
  chaosValue: z.number(),
  divineValue: z.number(),
  baseType: z.string(),
  icon: z.string().url(),
  listingCount: z.number().int(),
  detailsId: z.string(),
  itemType: z.string(),
});

export const ItemOverviewResponseSchema = z.object({
  lines: z.array(LineSchema).optional(),
});

export type InternalPriceItem = {
  type: AllowedUnique;
  name: string;
  chaos: number;
  divine: number;
  baseType: string;
  icon: string;
  listingCount: number;
  detailsId: string;
  itemType: string;
};

export type PriceItem = Omit<InternalPriceItem, "detailsId">;

export type AllowedUnique =
  | "UniqueWeapon"
  | "UniqueArmour"
  | "UniqueAccessory";

// --- poe.ninja currency ---

export const CurrencyLineSchema = z.object({
  id: z.string(),
  primaryValue: z.number().nonnegative().nullable().optional(),
});

export const CurrencyCoreRatesSchema = z.object({
  divine: z.number().nonnegative().optional(),
});

export const CurrencyCoreSchema = z.object({
  rates: CurrencyCoreRatesSchema,
});

export const CurrencyOverviewResponseSchema = z.object({
  lines: z.array(CurrencyLineSchema).optional(),
  core: CurrencyCoreSchema.optional(),
});

export type CurrencyData = {
  catalyst: { id: string; primaryValue: number } | null;
  divineRate: number | null;
};
