---
id: TASK-3
title: Add text search filter
status: Done
assignee:
  - '@claude'
created_date: '2026-03-23 03:46'
updated_date: '2026-03-23 04:09'
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
- [x] #1 Search input filters items by name and base type
- [x] #2 250ms debounce on input
- [x] #3 / keyboard shortcut focuses search
- [x] #4 Escape clears search and blurs input
- [x] #5 Shows filtered vs total count
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add globalFilter state and getFilteredRowModel to TanStack table
2. Add debounced search input with clear button
3. Add / shortcut to focus, Escape to clear+blur
4. Show "Showing X of Y items" count
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added debounced text search filter above the table.

Changes:
- Search input filters by name and baseType (case-insensitive)
- 250ms debounce on keystroke
- / shortcut focuses search, Escape clears and blurs
- X button to clear search text
- Shows "Showing X of Y items" when filtered
- Integrated with TanStack globalFilter + getFilteredRowModel
<!-- SECTION:FINAL_SUMMARY:END -->
