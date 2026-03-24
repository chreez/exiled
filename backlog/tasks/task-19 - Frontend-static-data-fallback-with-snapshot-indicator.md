---
id: TASK-19
title: Frontend static data fallback with snapshot indicator
status: Done
assignee:
  - '@claude'
created_date: '2026-03-24 04:18'
updated_date: '2026-03-24 05:02'
labels:
  - frontend
  - data
dependencies:
  - TASK-18
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Update the frontend API layer to detect when the live backend is unavailable (Netlify deploy) and fall back to reading the static JSON snapshots. Show a visible UI indicator when the user is viewing snapshotted data, including the snapshot date. In local dev mode with the server running, behavior is unchanged.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 API client tries live endpoint first, falls back to static JSON on failure
- [x] #2 UI displays a banner or badge showing snapshot date when using static data
- [x] #3 Banner includes the league name from the snapshot metadata
- [x] #4 Local dev mode with running server behaves identically to current behavior
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Update api.ts to try live API first, fall back to static JSON
2. Return snapshot metadata alongside data so UI knows the source
3. Add snapshot banner component
4. Integrate banner into page layout
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Updated api.ts with fetchWithFallback that tries live API first, falls back to static JSON snapshots. Added snapshot state tracking via getSnapshotInfo(). Page shows an amber banner with snapshot date and league when using static data. Refresh button and league selector hidden in snapshot mode. Local dev with running server works identically.
<!-- SECTION:FINAL_SUMMARY:END -->
