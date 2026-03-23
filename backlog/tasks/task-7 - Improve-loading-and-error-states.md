---
id: TASK-7
title: Improve loading and error states
status: Done
assignee:
  - '@claude'
created_date: '2026-03-23 03:46'
updated_date: '2026-03-23 04:14'
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
- [x] #1 Loading shows skeleton table rows with animation
- [x] #2 Error state has retry button
- [x] #3 League selector disabled during loading
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add skeleton component (shimmer rows matching table layout)
2. Replace loading text with skeleton table
3. Add retry button to error state
4. League selector already disabled (done in task-5), verify
5. Add aria-live regions
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Replaced plain loading/error states with polished UI.

Changes:
- Loading: 10 skeleton rows matching exact table layout with pulse animation
- Error: styled card with error message, details, and "Try Again" button
- Added aria-live regions for screen readers
- League selector disabled during loading (already from task-5)
<!-- SECTION:FINAL_SUMMARY:END -->
