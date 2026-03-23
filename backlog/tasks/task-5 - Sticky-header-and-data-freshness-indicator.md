---
id: TASK-5
title: Sticky header and data freshness indicator
status: Done
assignee:
  - '@claude'
created_date: '2026-03-23 03:46'
updated_date: '2026-03-23 04:10'
labels:
  - layout
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Make the header sticky so navigation stays accessible while scrolling 2000+ rows. Add data freshness indicator so users know if prices are stale.

Implementation:
- Add sticky top-0 z-50 with backdrop-blur to header
- Add cache metadata to server responses (cachedAt timestamp)
- Display "Updated X min ago" in header
- Add manual refresh button (circular arrow icon)
- Support ?force=1 query param to bypass cache on server
- Disable league selector during loading to prevent race conditions
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Header stays visible when scrolling
- [x] #2 Shows relative time since last data fetch
- [x] #3 Manual refresh button fetches fresh data
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Make header sticky with backdrop-blur
2. Add cachedAt timestamp to server price/currency responses
3. Add ?force=1 param to bypass cache server-side
4. Display relative freshness time + refresh button in header
5. Disable league selector during loading
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added sticky header, data freshness indicator, and manual refresh.

Changes:
- Header is sticky with backdrop-blur
- Server wraps prices response with cachedAt timestamp
- Server supports ?force=1 to bypass cache
- Frontend shows relative freshness ("Updated Xm ago"), refreshes every 15s
- Refresh button with spin animation during load
- League selector disabled during loading
<!-- SECTION:FINAL_SUMMARY:END -->
