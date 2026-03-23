---
id: TASK-10
title: Add mobile responsive layout
status: Done
assignee:
  - '@claude'
created_date: '2026-03-23 03:47'
updated_date: '2026-03-23 04:18'
labels:
  - layout
  - accessibility
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Make the table and header usable on smaller screens.

Implementation:
- Stack header controls vertically on mobile: flex-col sm:flex-row
- Wrap table in overflow-x-auto for horizontal scroll
- Consider hiding lower-priority columns on mobile (baseType, divine)
- Ensure touch targets are >= 44px on mobile
- Test at 640px, 768px, 1024px breakpoints
- Add back-to-top button (appears after scrolling >500px)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Header controls stack on mobile
- [x] #2 Table scrolls horizontally on small screens
- [x] #3 Touch targets meet 44px minimum
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Make header flex-col on mobile
2. Wrap table in overflow-x-auto
3. Ensure touch targets >= 44px
4. Stack filter controls on mobile
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added mobile responsive layout.

Changes:
- Header controls stack vertically on mobile (flex-col sm:flex-row)
- Table wrapped in overflow-x-auto for horizontal scrolling
- Touch targets: 44px min-height on buttons and filter controls on mobile
- Search, type filter, and pagination controls stack on small screens
- Skeleton loading state also responsive
<!-- SECTION:FINAL_SUMMARY:END -->
