---
id: TASK-12
title: 'Server: tattoo price API endpoint'
status: Done
assignee:
  - '@claude'
created_date: '2026-03-23 04:33'
updated_date: '2026-03-23 08:01'
labels:
  - backend
  - api
dependencies:
  - TASK-15
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add a new Hono API route that fetches tattoo prices from poe.ninja, matches them against the static tattoo pool data, and returns per-port pricing with calculated averages. Reuse existing patterns (cache, retry, User-Agent). The response should include: per-port average chaos/divine per tattoo, individual tattoo prices, divine:chaos ratio, null handling for unpriced tattoos, and port ranking by average chaos value.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 New API route (e.g. /api/tattoos/:league) returns tattoo prices per port
- [x] #2 Prices fetched from correct poe.ninja endpoint for tattoo items
- [x] #3 Null prices handled: excluded from average, flagged in response
- [x] #4 Per-port average chaos and divine value calculated correctly
- [x] #5 Ports ranked by average chaos value descending in response
- [x] #6 Response includes divine:chaos ratio
- [x] #7 Caching follows existing patterns (30min items, 1day currency)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Create routes/tattoos.ts with new Hono router
2. Fetch tattoo prices from poe.ninja (type=Tattoo) + currency for divine rate
3. Match prices to static PORTS data by trade_id
4. Calculate per-port averages (null excluded), rank by avg chaos desc
5. Return structured response with ports, divine ratio, cache metadata
6. Register route in index.ts
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Created routes/tattoos.ts. Fetches poe.ninja Tattoo type + currency rate in parallel. Matches by detailsId to static PORTS data. Fixed divine calc (poe.ninja rate is chaos->divine multiplier, not divisor). Registered at /api/tattoos/:league.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added /api/tattoos/:league endpoint returning per-port tattoo pricing.

Changes:
- New routes/tattoos.ts: fetches tattoo prices + divine rate from poe.ninja in parallel, matches to static port data, calculates averages, ranks ports by avg chaos desc
- Registered route in index.ts
- Null prices excluded from averages, flagged in response
- 30min cache for tattoo prices, 1day for currency (reuses existing TTLCache)
- Stale cache fallback on fetch failure
<!-- SECTION:FINAL_SUMMARY:END -->
