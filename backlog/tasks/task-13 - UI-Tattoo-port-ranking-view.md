---
id: TASK-13
title: 'UI: Tattoo port ranking view'
status: Done
assignee:
  - '@claude'
created_date: '2026-03-23 04:33'
updated_date: '2026-03-23 08:03'
labels:
  - frontend
  - ui
dependencies:
  - TASK-12
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Replace the existing disenchant table UI with the Phase 1 tattoo port selector interface. Display three port cards ranked by average chaos value per tattoo (highest first). Each card shows: port name, attribute class (INT/DEX/STR), average chaos per tattoo, average divine per tattoo, and the full tattoo list with individual prices. Tattoos with no price data show as 'negligible'. Include the assumption disclosure notice about equal drop weights.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Three port cards displayed, ranked by average chaos per tattoo descending
- [x] #2 Each card shows port name, attribute class, avg chaos/tattoo, avg divine/tattoo
- [x] #3 Each card shows full tattoo list with individual chaos prices
- [x] #4 Null-price tattoos displayed as 'negligible' (not hidden)
- [x] #5 Assumption disclosure visible: drop weights assumed equal, unconfirmed
- [x] #6 League selector and refresh functionality preserved
- [x] #7 Loading and error states handled
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add tattoo response types + fetch function to api.ts
2. Rewrite +page.svelte: remove TanStack table, add 3 port cards ranked by avg chaos
3. Each card: port name, attribute badge, avg chaos/divine, tattoo list with prices
4. Null prices show as "negligible"
5. Assumption disclosure notice
6. Keep: league selector, refresh, theme toggle, loading/error states
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Replaced entire disenchant table UI with 3 port cards. Removed TanStack Table, search, type filters, pagination. Added tattoo-specific types to api.ts. Tattoo names trimmed of 'Tattoo of the ' prefix for readability, sorted by chaos value desc within each card.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Replaced disenchant table UI with tattoo port ranking cards.

Changes:
- Rewrote +page.svelte: 3 port cards ranked by avg chaos/tattoo, each showing port name, attribute badge, avg chaos+divine, full tattoo list with individual prices
- Added TattooResponse/PortResult/TattooPrice types + fetchTattoos() to api.ts
- Null prices shown as "negligible", assumption disclosure at bottom
- Loading skeleton matches card layout, error state preserved
- League selector, refresh button, theme toggle all preserved
- Removed: TanStack Table, search, type filters, pagination (disenchant-specific)
<!-- SECTION:FINAL_SUMMARY:END -->
