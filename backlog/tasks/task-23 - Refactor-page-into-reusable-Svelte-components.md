---
id: TASK-23
title: Refactor page into reusable Svelte components
status: To Do
assignee: []
created_date: '2026-03-24 09:49'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The main +page.svelte file has grown large with hardcoded, repeated patterns for tattoo and runegraft cards. Refactor into a component-based architecture with reusable components (e.g., PortCard, ItemList, ShipmentRules) to reduce duplication and improve maintainability.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Extract PortCard component for tattoo/runegraft port display (header, price, collapsible item list)
- [ ] #2 Extract ItemList component for the scrollable sorted item rows
- [ ] #3 Extract ShipmentRules component for the rules/breakpoints sections
- [ ] #4 Extract CheatsheetSection components for the strategy cards
- [ ] #5 Main +page.svelte uses composed components instead of inline markup
- [ ] #6 No visual or functional regressions
<!-- AC:END -->
