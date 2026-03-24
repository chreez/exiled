---
id: TASK-18
title: Data snapshot mechanism for static deployment
status: Done
assignee:
  - '@claude'
created_date: '2026-03-24 04:18'
updated_date: '2026-03-24 05:01'
labels:
  - infrastructure
  - data
dependencies:
  - TASK-17
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add a way to dump the running dev server API responses to static JSON files that the frontend can read when deployed on Netlify. The dev server already works — this just captures its output. A script or endpoint hits the local API (tattoos, runegrafts, etc.) and writes timestamped JSON to packages/web/static/data/. Files include metadata (snapshot date, league) and are version-controlled.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Script or endpoint captures all current API responses (tattoos, runegrafts) to static JSON
- [x] #2 Snapshot JSON includes metadata: date, league, and data version
- [x] #3 Output location is packages/web/static/data/ so SvelteKit serves them
- [x] #4 Snapshot files are gitignored or committed per user choice (default: committed)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Read current server API routes to understand response shapes
2. Create a snapshot script that fetches from running dev server
3. Write responses to packages/web/static/data/ with metadata
4. Add pnpm snapshot convenience command
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Created scripts/snapshot.sh that fetches from running dev server and writes tattoos.json + runegrafts.json to packages/web/static/data/. Each file has metadata wrapper (snapshotDate, league). Added pnpm snapshot command to root package.json.
<!-- SECTION:FINAL_SUMMARY:END -->
