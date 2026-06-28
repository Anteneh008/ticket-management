---
name: project-config
description: Playwright config and test infrastructure setup for this project
metadata:
  type: project
---

## playwright.config.ts location
Project root: `C:\Users\MSI\Desktop\Learning\mosh\playground\ticket-management\playwright.config.ts`

## Key config choices
- `workers: 1` — serial execution. Required because Better Auth rate limiter is per-IP and parallel login calls will collide.
- `fullyParallel: false` — same reason.
- `projects: ["setup", "chromium"]` — setup project runs auth.setup.ts first; chromium depends on it.
- `reuseExistingServer: !process.env.CI` — dev server must already be running locally; CI starts its own.
- `testDir: "./tests"` — flat tests/ dir (not tests/e2e/).

## Auth state files
- `tests/.auth/agent.json`
- `tests/.auth/admin.json`
- Both produced by `tests/auth.setup.ts`, consumed by `tests/auth.spec.ts` via `test.use({ storageState: FILE })`.
- Gitignored via `.gitignore` entry `/tests/.auth`.

## Seeded accounts
- Admin: admin@ticketapp.com / Admin@123456 (role: admin)
- Agent: agent@ticketapp.com / Agent@123456 (role: agent)
- Passwords come from SEED_ADMIN_PASSWORD / SEED_AGENT_PASSWORD in .env

## Next.js 16 note
Edge guard file is `src/proxy.ts` (not middleware.ts). Confirmed by docs at `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`.
