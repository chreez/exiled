---
id: TASK-1
title: Deduplicate poe.ninja item variants
status: Done
assignee:
  - '@claude'
created_date: '2026-03-23 03:45'
updated_date: '2026-03-23 04:06'
labels:
  - data-quality
dependencies: []
references:
  - reference/src/lib/prices/prices.ts
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
poe.ninja returns duplicate entries for items with variants (-relic, -5l, -6l) and Foulborn prefixes. Without deduplication, users see 3-4 rows for the same item at wildly different prices (e.g. Starforge at 1k vs 115k chaos for relic variant). This is the most impactful data quality issue.

Port dedupeCheapestVariants() from reference/src/lib/prices/prices.ts. Rules:
- Special suffixes (-relic, -5l, -6l): prefer non-special variant, use cheapest price
- Foulborn prefix: merge with non-Foulborn counterpart, keep non-Foulborn name
- Sum listing counts across merged variants
- Apply deduplication server-side before caching
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 No duplicate item names appear in the table
- [x] #2 Foulborn variants merged with base items
- [x] #3 Listing counts summed across variants
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add detailsId to internal item type (needed for dedup, stripped before API response)
2. Create lib/dedup.ts with dedupeCheapestVariants() ported from reference
3. Apply dedup in prices route before caching
4. Strip detailsId from response items
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Ported dedupeCheapestVariants() from reference project to server.

Changes:
- Added InternalPriceItem type with detailsId field to types.ts
- Created lib/dedup.ts with full dedup logic: special suffix (-relic/-5l/-6l) grouping and Foulborn prefix merging
- Updated prices route to include detailsId in fetch, apply dedup before caching, and strip detailsId from API response
<!-- SECTION:FINAL_SUMMARY:END -->
