---
id: TASK-4
title: Add item type filter
status: To Do
assignee: []
created_date: '2026-03-23 03:46'
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
- [ ] #1 Segmented control filters by item type
- [ ] #2 Shows count per type
- [ ] #3 Combinable with text search filter
<!-- AC:END -->
