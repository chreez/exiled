---
id: TASK-5
title: Sticky header and data freshness indicator
status: To Do
assignee: []
created_date: '2026-03-23 03:46'
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
- [ ] #1 Header stays visible when scrolling
- [ ] #2 Shows relative time since last data fetch
- [ ] #3 Manual refresh button fetches fresh data
<!-- AC:END -->
