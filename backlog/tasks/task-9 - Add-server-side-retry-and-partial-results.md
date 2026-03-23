---
id: TASK-9
title: Add server-side retry and partial results
status: Done
assignee:
  - '@claude'
created_date: '2026-03-23 03:47'
updated_date: '2026-03-23 04:17'
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
- [x] #1 Transient failures retried up to 3 times
- [x] #2 Partial results returned if some item types fail
- [x] #3 Stale cache served as fallback with warning flag
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add retry utility with exponential backoff
2. Switch Promise.all to Promise.allSettled in prices route
3. Return partial results with warnings array
4. Add stale-while-revalidate: serve expired cache with stale flag on failure
5. Update frontend to show warnings
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added server-side retry with exponential backoff, partial results, and stale cache fallback.

Changes:
- withRetry() utility: up to 3 retries with 1s/2s/4s exponential backoff
- Promise.allSettled replaces Promise.all for resilient per-type fetching
- Partial results: returns available items with warnings array if some types fail
- Stale-while-revalidate: serves expired cache with stale flag if all fetches fail
- Cache.getStale() method for accessing expired entries
- Frontend displays warning banner for partial/stale data
<!-- SECTION:FINAL_SUMMARY:END -->
