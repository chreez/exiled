---
id: TASK-2
title: Add sortable table columns with TanStack Table
status: To Do
assignee: []
created_date: '2026-03-23 03:46'
labels:
  - table
dependencies: []
references:
  - reference/src/components/data-table.tsx
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Replace the plain {#each} table rendering with @tanstack/svelte-table. This enables column sorting, and lays the foundation for filtering and pagination.

Implementation:
- Install @tanstack/svelte-table
- Define column definitions with sorting enabled for: Name, Base Type, Type, Chaos, Divine, Listings
- Icon column: sorting disabled
- Add sort direction indicators (chevron icons) on column headers
- Headers clickable: ascending -> descending -> neutral cycle
- Keyboard support: Enter/Space to toggle sort on focused header
- Add aria-sort attribute to sorted column
- Use tabular-nums class on numeric columns for proper alignment
- Default sort: none (no default until dust calculations exist)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 All columns except Icon are sortable by clicking header
- [ ] #2 Sort indicators (chevrons) show current sort direction
- [ ] #3 Keyboard users can sort with Enter/Space
- [ ] #4 Numeric columns use tabular-nums for alignment
<!-- AC:END -->
