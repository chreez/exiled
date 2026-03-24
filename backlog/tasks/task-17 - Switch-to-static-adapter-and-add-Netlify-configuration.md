---
id: TASK-17
title: Switch to static adapter and add Netlify configuration
status: Done
assignee:
  - '@claude'
created_date: '2026-03-24 04:18'
updated_date: '2026-03-24 04:59'
labels:
  - infrastructure
  - netlify
dependencies:
  - TASK-16
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Convert the SvelteKit app from adapter-auto to adapter-static for Netlify deployment. Add netlify.toml with SPA redirect rules, build command pointing to the web package, and appropriate headers. Ensure the build produces a static dist that Netlify can serve.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 adapter-static installed and configured in svelte.config.js
- [x] #2 netlify.toml created at project root with build command, publish dir, and SPA redirects
- [x] #3 pnpm build succeeds and outputs a deployable static site
- [x] #4 Vite API proxy remains functional for local dev only
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Install @sveltejs/adapter-static in web package
2. Update svelte.config.js to use adapter-static
3. Create netlify.toml at project root
4. Verify build succeeds
5. Ensure vite proxy still works for dev
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Switched from adapter-auto to adapter-static with SPA fallback. Created netlify.toml at project root with build command, publish dir, and SPA redirect. Build produces static output to packages/web/build/. Vite dev proxy unchanged.
<!-- SECTION:FINAL_SUMMARY:END -->
