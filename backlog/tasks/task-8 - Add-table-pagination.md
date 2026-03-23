---
id: TASK-8
title: Add table pagination
status: To Do
assignee: []
created_date: '2026-03-23 03:46'
labels:
  - table
dependencies:
  - TASK-2
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add pagination to the table to avoid rendering 2000+ DOM nodes at once. The reference app uses TanStack Table pagination.

Implementation:
- Add getPaginationRowModel() to TanStack Table config
- Default page size: 50 items
- Page size selector: 25 / 50 / 100
- Pagination controls: First, Previous, page numbers, Next, Last
- Show "Page X of Y" indicator
- Preserve sort and filter state across page changes
- Place pagination controls below table
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Table shows paginated results (default 50 per page)
- [ ] #2 Page size selector with 25/50/100 options
- [ ] #3 Pagination controls navigate between pages
- [ ] #4 Sort and filter state preserved across pages
<!-- AC:END -->
