---
id: TASK-6
title: Improve table visual design
status: Done
assignee:
  - '@claude'
created_date: '2026-03-23 03:46'
updated_date: '2026-03-23 04:13'
labels:
  - visual
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Enhance the table and overall visual design for a more polished gaming-tool aesthetic.

Changes:
- Alternating row colors (subtle zebra striping) for readability
- Enhanced hover state on rows
- Color-coded type badges: red (Weapon), blue (Armour), purple (Accessory)
- Better item icon presentation: 40px with border/background container
- Tabular-nums on all numeric columns
- Typography hierarchy: semibold item names, muted base type, medium chaos (primary), muted divine (secondary)
- Number formatting with Intl.NumberFormat (thousand separators)
- Consider two-tier background (elevated card bg for table vs page bg)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Type badges are color-coded by item type
- [x] #2 Item icons have border/background treatment
- [x] #3 Numbers formatted with thousand separators
- [x] #4 Alternating row colors improve scan-ability
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add color-coded badge variants for Weapon/Armour/Accessory
2. Style icon cells with border/background container
3. Add zebra striping and enhanced hover
4. Number formatting with Intl.NumberFormat
5. Typography hierarchy improvements
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Improved table visual design with gaming-tool aesthetic.

Changes:
- Color-coded type badges: red (Weapon), blue (Armour), purple (Accessory)
- Item icons in bordered/background container (40px)
- Alternating row colors (zebra striping) with enhanced hover
- Numbers formatted with Intl.NumberFormat (thousand separators)
- Typography: semibold names, muted base type, medium chaos, muted divine
<!-- SECTION:FINAL_SUMMARY:END -->
