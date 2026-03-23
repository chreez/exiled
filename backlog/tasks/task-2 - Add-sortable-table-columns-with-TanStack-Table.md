---
id: TASK-2
title: Add sortable table columns with TanStack Table
status: Done
assignee:
  - '@claude'
created_date: '2026-03-23 03:46'
updated_date: '2026-03-23 04:07'
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
- [x] #1 All columns except Icon are sortable by clicking header
- [x] #2 Sort indicators (chevrons) show current sort direction
- [x] #3 Keyboard users can sort with Enter/Space
- [x] #4 Numeric columns use tabular-nums for alignment
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Install @tanstack/svelte-table in packages/web
2. Rewrite +page.svelte to use TanStack table with column defs
3. Add sortable headers with chevron indicators and keyboard support
4. Add tabular-nums to numeric columns
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Replaced plain #each table with @tanstack/svelte-table v9 (Svelte 5 compatible).

Changes:
- Installed @tanstack/svelte-table@9.0.0-alpha.10
- Defined column helpers with sorting enabled on all columns except Icon
- Added sort direction indicators (triangle up/down/neutral) on sortable headers
- Clickable headers cycle through asc/desc/neutral
- Keyboard accessible with native button elements
- aria-sort attribute on sorted columns
- tabular-nums class on numeric columns (Chaos, Divine, Listings)
<!-- SECTION:FINAL_SUMMARY:END -->
