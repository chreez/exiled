---
id: TASK-9
title: Add server-side retry and partial results
status: To Do
assignee: []
created_date: '2026-03-23 03:47'
labels:
  - data-quality
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add resilience to poe.ninja API calls so transient failures dont break the entire load.

Implementation:
- Retry failed fetches up to 3 times with exponential backoff (1s, 2s, 4s)
- Use Promise.allSettled instead of Promise.all for the 3 item type fetches
- Return partial results if 1-2 types fail (with warning in response)
- Only return 502 if ALL fetches fail
- Add stale-while-revalidate: if fresh fetch fails but stale cache exists, return stale data with warning flag
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Transient failures retried up to 3 times
- [ ] #2 Partial results returned if some item types fail
- [ ] #3 Stale cache served as fallback with warning flag
<!-- AC:END -->
