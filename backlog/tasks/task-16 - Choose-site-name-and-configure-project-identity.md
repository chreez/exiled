---
id: TASK-16
title: Choose site name and configure project identity
status: Done
assignee:
  - '@claude'
created_date: '2026-03-24 04:18'
updated_date: '2026-03-24 04:58'
labels:
  - branding
  - setup
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Pick a short, memorable name for the PoE tools site (pattern: vyra, proofed). Configure site title, meta description, and prepare for Netlify deployment. This site will host multiple PoE tools over time (currently: tattoo port rankings, runegrafts). Name should work as a general PoE tools brand by Chris Palmer.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Site name chosen and agreed upon with user
- [x] #2 HTML title, meta description, and OG tags updated in app.html
- [x] #3 Favicon designed or placeholder set (consistent with brand)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Update app.html with site title, meta description, OG tags
2. Create or update favicon for exiled. brand
3. Update any existing references to old site name
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Site name chosen: **exiled.** (with trailing dot, matching proofed. style). Domain: exiled.netlify.app. Branding: personal/casual, clearly PoE, past-tense verb format.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Set site name to 'exiled.' with trailing dot. Updated app.html with title, meta description, and OG tags. Replaced default Svelte favicon with a minimal 'e.' mark. Added title to layout svelte:head.
<!-- SECTION:FINAL_SUMMARY:END -->
