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
