---
id: TASK-4
title: Add item type filter
status: Done
assignee:
  - '@claude'
created_date: '2026-03-23 03:46'
updated_date: '2026-03-23 04:12'
labels:
  - filters
dependencies:
  - TASK-2
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add a segmented control / tab bar to filter by item type: All | Weapons | Armour | Accessories. Show count per type.

The reference app fetches types separately but our implementation loads all types at once, making this filter valuable for narrowing results.

Implementation:
- Segmented control below search input
- Options: All (default), Weapons, Armour, Accessories
- Show count per type in the label: "Weapons (487)"
- Integrate with TanStack Table column filter on type field
- Combinable with text search
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Segmented control filters by item type
- [x] #2 Shows count per type
- [x] #3 Combinable with text search filter
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add column filter state for type column
2. Add segmented button group below search
3. Show per-type counts from raw items array
4. Integrate with TanStack column filtering
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added item type segmented control filter.

Changes:
- Segmented button group: All / Weapons / Armour / Accessories
- Per-type counts shown in labels
- Integrates with TanStack column filters on type field
- Combinable with text search (both filters apply simultaneously)
- Item count display reflects both filters
<!-- SECTION:FINAL_SUMMARY:END -->
