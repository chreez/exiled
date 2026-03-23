---
id: TASK-7
title: Improve loading and error states
status: To Do
assignee: []
created_date: '2026-03-23 03:46'
labels:
  - layout
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Replace the plain "Loading prices..." text with skeleton table UI and add retry capability to error states.

Loading state:
- Render ~10 skeleton rows matching table column layout
- Animated shimmer/pulse effect
- Maintains layout stability (no content shift)

Error state:
- Show error icon + message + technical details
- Add "Try Again" button that re-fetches
- Style with destructive color scheme

Also add:
- Disable league selector while loading (prevent race conditions)
- aria-live="polite" on loading/error regions for screen readers
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Loading shows skeleton table rows with animation
- [ ] #2 Error state has retry button
- [ ] #3 League selector disabled during loading
<!-- AC:END -->
