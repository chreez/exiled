---
id: TASK-10
title: Add mobile responsive layout
status: To Do
assignee: []
created_date: '2026-03-23 03:47'
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
- [ ] #1 Header controls stack on mobile
- [ ] #2 Table scrolls horizontally on small screens
- [ ] #3 Touch targets meet 44px minimum
<!-- AC:END -->
