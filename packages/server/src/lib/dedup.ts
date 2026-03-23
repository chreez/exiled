import type { InternalPriceItem } from "../types.js";

const isFoulbornItem = (name: string): boolean => name.startsWith("Foulborn ");

const extractBaseName = (name: string): string =>
  isFoulbornItem(name) ? name.substring(9) : name;

const getCheapest = (items: InternalPriceItem[]) =>
  items.reduce((min, curr) => (curr.chaos < min.chaos ? curr : min));

const sumListings = (items: InternalPriceItem[]) =>
  items.reduce((sum, i) => sum + i.listingCount, 0);

const SPECIAL_SUFFIXES = ["-relic", "-5l", "-6l"];
const isSpecialSuffix = (item: InternalPriceItem): boolean =>
  SPECIAL_SUFFIXES.some((suffix) => item.detailsId.endsWith(suffix));

/**
 * Deduplicates poe.ninja item variants:
 * - Groups by name, preferring non-special (non-relic/5l/6l) variants
 * - Merges Foulborn prefix variants with base items
 * - Sums listing counts across merged variants
 */
export function dedupeCheapestVariants(
  items: InternalPriceItem[]
): InternalPriceItem[] {
  if (items.length === 0) return [];

  // Step 1: Group by name, dedupe special suffix variants
  const groupsByName = new Map<string, InternalPriceItem[]>();
  for (const item of items) {
    const group = groupsByName.get(item.name);
    if (group) {
      group.push(item);
    } else {
      groupsByName.set(item.name, [item]);
    }
  }

  const result: InternalPriceItem[] = [];

  for (const group of groupsByName.values()) {
    if (group.length === 1) {
      result.push(group[0]);
      continue;
    }

    const nonSpecial = group.filter((item) => !isSpecialSuffix(item));

    if (nonSpecial.length > 0) {
      result.push({ ...getCheapest(nonSpecial), listingCount: sumListings(nonSpecial) });
    } else {
      const cheapest = getCheapest(group);
      result.push({ ...cheapest, listingCount: cheapest.listingCount });
    }
  }

  // Step 2: Merge Foulborn variants with base items
  const hasFoulborn = result.some((item) => isFoulbornItem(item.name));
  if (!hasFoulborn) return result;

  const foulbornGroups = new Map<string, InternalPriceItem[]>();
  for (const item of result) {
    const baseName = extractBaseName(item.name);
    const group = foulbornGroups.get(baseName);
    if (group) {
      group.push(item);
    } else {
      foulbornGroups.set(baseName, [item]);
    }
  }

  const finalResult: InternalPriceItem[] = [];

  for (const items of foulbornGroups.values()) {
    const regulars = items.filter((i) => !isFoulbornItem(i.name));
    const foulborns = items.filter((i) => isFoulbornItem(i.name));

    if (regulars.length === 0 || foulborns.length === 0) {
      const cheapest = getCheapest(items);
      finalResult.push({
        ...cheapest,
        name: extractBaseName(cheapest.name),
        listingCount: sumListings(items),
      });
      continue;
    }

    // Both exist: use cheaper price, keep non-Foulborn name
    const cheapestRegular = getCheapest(regulars);
    const cheapestFoulborn = getCheapest(foulborns);
    const winner =
      cheapestRegular.chaos <= cheapestFoulborn.chaos
        ? cheapestRegular
        : cheapestFoulborn;

    finalResult.push({
      ...winner,
      name: cheapestRegular.name,
      chaos: winner.chaos,
      divine: winner.divine,
      listingCount: sumListings(items),
    });
  }

  return finalResult;
}
