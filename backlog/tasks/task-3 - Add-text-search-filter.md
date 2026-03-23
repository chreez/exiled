---
id: TASK-3
title: Add text search filter
status: To Do
assignee: []
created_date: '2026-03-23 03:46'
labels:
  - filters
dependencies:
  - TASK-2
references:
  - reference/src/components/filters/name-filter.tsx
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add a search input above the table that filters items by name and base type. With 2000+ items, search is the single most impactful UX improvement for finding specific items.

Implementation:
- Search input with placeholder "Filter by name..." above the table
- Case-insensitive substring matching on name and baseType fields
- 250ms debounce to avoid lag on keystroke
- Clear button (X icon) when text is entered
- Keyboard shortcut: / to focus search, Escape to clear and blur
- Integrate with TanStack Table globalFilter
- Show filtered count: "Showing X of Y items"
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Search input filters items by name and base type
- [ ] #2 250ms debounce on input
- [ ] #3 / keyboard shortcut focuses search
- [ ] #4 Escape clears search and blurs input
- [ ] #5 Shows filtered vs total count
<!-- AC:END -->
