---
id: TASK-15
title: Populate static tattoo pool data per port
status: Done
assignee:
  - '@claude'
created_date: '2026-03-23 05:12'
updated_date: '2026-03-23 07:59'
labels:
  - data
  - backend
dependencies:
  - TASK-11
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Determine the full list of tattoos available at each Karui port (Moti Aro/INT, Te Onui/DEX, Ngakanu/STR) and populate the empty tattoo arrays in packages/server/src/tattoos.ts. Use poe.ninja Tattoo item type API to discover available tattoos and cross-reference with wiki data to assign each to its correct port. Each entry needs tattoo_name (exact in-game name) and trade_id (poe.ninja detailsId).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Moti Aro tattoo pool fully populated with correct INT tattoo names and trade_ids
- [x] #2 Te Onui tattoo pool fully populated with correct DEX tattoo names and trade_ids
- [x] #3 Ngakanu tattoo pool fully populated with correct STR tattoo names and trade_ids
- [x] #4 All trade_ids verified against poe.ninja identifier format
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Fetch poe.ninja Tattoo item type for Mirage league to get all tattoo names and detailsIds\n2. Cross-reference with wiki to determine which tattoos belong to which port (INT/DEX/STR)\n3. Populate tattoo arrays in tattoos.ts\n4. Verify all trade_ids match poe.ninja format
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Populated 50 tattoos from poe.ninja Tattoo type + wiki port mapping. Excluded 3 Journey Tattoos (not Kingsmarch rewards). All trade_ids match poe.ninja detailsId format.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Populated tattoos.ts with 50 tattoos across 3 Karui ports:
- Moti Aro (INT): 16 tattoos
- Te Onui (DEX): 14 tattoos
- Ngakanu (STR): 20 tattoos

Data sourced from poe.ninja Tattoo item type + PoE wiki port-to-attribute mapping. Journey Tattoos excluded (not port-specific Kingsmarch rewards).
<!-- SECTION:FINAL_SUMMARY:END -->
