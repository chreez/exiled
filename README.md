# exiled.

Path of Exile tools for Kingsmarch shipping optimization. Live price data from poe.ninja, snapshotted for static hosting.

**Live site:** [exiled.netlify.app](https://exiled.netlify.app)

## What it does

- **Tattoo port rankings** — average chaos value per tattoo across all three ports
- **Runegraft port rankings** — same analysis for runegraft pools
- **Shipping cheatsheet** — resource values, dust mechanics, farming strategies

## Tech stack

- **Frontend:** SvelteKit 2, Svelte 5, Tailwind CSS 4, shadcn-svelte
- **Backend (dev only):** Hono, Node.js
- **Data:** poe.ninja public API
- **Hosting:** Netlify (static)

## Quick start

```bash
pnpm install
pnpm dev          # Starts server (:3001) + web (:5173)
```

## Data snapshots

The deployed site is fully static. Price data is captured from the running dev server and committed as JSON:

```bash
pnpm dev          # Start the dev server first
pnpm snapshot     # Dumps API responses to packages/web/static/data/
```

Snapshots include a timestamp and league name. The frontend falls back to snapshot data when the live API is unavailable (i.e., on Netlify). A banner shows the snapshot date.

## Project structure

```
packages/
  server/     Hono API — fetches from poe.ninja, caches, serves to frontend
  web/        SvelteKit SPA — displays data, deployed to Netlify
scripts/
  snapshot.sh Captures running API responses to static JSON
```

## Deployment

Netlify builds from `netlify.toml`:
- Build: `pnpm --filter web build`
- Publish: `packages/web/build`
- SPA redirect: `/* -> /index.html`

---

Built with [Claude Code](https://claude.ai/code). By [Chris Palmer](https://github.com/chreez).
