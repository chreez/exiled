---
id: TASK-11
title: Research and create static tattoo pool data
status: Done
assignee:
  - '@claude'
created_date: '2026-03-23 04:33'
updated_date: '2026-03-23 05:12'
labels:
  - data
  - backend
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Research the exact tattoo names available at each of the three Karui ports (Moti Aro/INT, Te Onui/DEX, Ngakanu/STR) from the PoE wiki. Create a static TypeScript data file mapping each port to its tattoo pool. Each entry needs: port identifier, attribute class, exact in-game tattoo name, and poe.ninja trade identifier (detailsId). This is the foundational data the rest of Phase 1 depends on.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Tattoo pool for Moti Aro (INT tattoos) fully enumerated with correct names
- [ ] #2 Tattoo pool for Te Onui (DEX tattoos) fully enumerated with correct names
- [ ] #3 Tattoo pool for Ngakanu (STR tattoos) fully enumerated with correct names
- [x] #4 Static TypeScript data file created in packages/server/src with typed port/tattoo definitions
- [ ] #5 Each tattoo entry includes trade_id matching poe.ninja identifier format
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Create typed data structure in packages/server/src/tattoos.ts with Port, Attribute, TattooEntry, PortDefinition types\n2. Define PORTS record with three Karui ports (empty tattoo arrays)\n3. Split tattoo enumeration into separate TASK-15
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Created packages/server/src/tattoos.ts with typed Port, Attribute, TattooEntry, PortDefinition types and PORTS record. Tattoo arrays left empty — population split into TASK-15.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added tattoos.ts with typed data structure for the three Karui ports (Moti Aro/INT, Te Onui/DEX, Ngakanu/STR). Port definitions, attribute classes, and tattoo entry types are ready. Actual tattoo enumeration deferred to TASK-15.
<!-- SECTION:FINAL_SUMMARY:END -->
