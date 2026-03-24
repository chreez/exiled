---
id: TASK-14
title: Clean up legacy disenchant code
status: Done
assignee:
  - '@claude'
created_date: '2026-03-23 04:33'
updated_date: '2026-03-23 08:04'
labels:
  - cleanup
dependencies:
  - TASK-13
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Remove the old disenchant-specific code that is no longer relevant after the pivot to the tattoo port selector. This includes the old prices endpoint (if fully replaced), disenchant-specific types, deduplication logic for unique item variants, and any unused frontend components. Keep shared infrastructure (cache, Hono setup, SvelteKit shell, shadcn components).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Old disenchant-specific server routes removed or replaced
- [x] #2 Unused type definitions cleaned up
- [x] #3 Unused dedup logic removed
- [x] #4 Frontend components/imports for old table cleaned up
- [x] #5 Shared infrastructure (cache, app shell, UI components) preserved
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Removed: routes/prices.ts, lib/dedup.ts, old types from types.ts, old api.ts exports, TanStack Table dep. Kept: cache.ts, Hono setup, leagues, shadcn components, SvelteKit shell.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Removed all disenchant-era code after tattoo port selector pivot.

Removed:
- packages/server/src/routes/prices.ts (old price + currency endpoints)
- packages/server/src/lib/dedup.ts (Foulborn/relic variant dedup)
- Old Zod schemas and types from types.ts (kept league definitions only)
- Old PriceItem/CurrencyData/fetchPrices/fetchCurrency from web api.ts
- @tanstack/svelte-table dependency (no longer used)

Preserved:
- TTLCache, Hono app shell, league config
- SvelteKit shell, shadcn-svelte components, theme toggle
<!-- SECTION:FINAL_SUMMARY:END -->
