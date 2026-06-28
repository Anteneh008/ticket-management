---
name: security-auth-findings
description: Auth security findings from June 2026 audit — Better Auth config gaps, session guard bypass, missing middleware, hardcoded seed credentials, role escalation risk
metadata:
  type: project
---

# Auth Security Audit Findings (2026-06-28)

## Critical / High Issues Found

### No Edge Middleware — Session Guard Bypass
- Dashboard layout (`src/app/(dashboard)/layout.tsx`) calls `auth.api.getSession()` as a Server Component but there is NO `middleware.ts` file.
- Next.js route handlers and direct API fetches to `/api/*` endpoints do not pass through layout guards.
- An attacker who knows the URL can fetch `/api/auth/*` or future API routes directly without the layout running.
- **Fix needed:** Create `src/middleware.ts` using `betterAuth`'s `getSession` to enforce auth at the edge on all `/dashboard` and `/api` (non-auth) routes.

### Role Stored in User Table — Escalation via Sign-Up
- `role` field is on the `User` table (schema.prisma line 19) with `defaultValue: "agent"`.
- `input: false` in Better Auth config (`src/lib/auth.ts` line 18) prevents direct sign-up role injection via Better Auth's own API.
- BUT: any future raw POST to `/api/auth/sign-up/email` with a crafted body should be verified not to bypass this.
- Role is not a separate RBAC table — it's a plain string with no enforcement layer beyond page-level checks.

### Hardcoded Credentials in Committed Seed Script
- `prisma/seed.ts` has been committed in at least two commits (d1f0867, 462962e) with plaintext `Admin@123456` and `Agent@123456`.
- `console.log` at line 21 prints `email / password` to stdout on every seed run.
- Credentials are in git history permanently unless history is rewritten.

### Missing Rate Limiting on Auth Endpoints
- `src/lib/auth.ts` has no `rateLimit` plugin configured.
- `/api/auth/sign-in/email` is open to unlimited brute-force attempts.

### No CSRF Explicit Configuration
- Better Auth handles CSRF internally for same-origin by default, but no explicit `trustedOrigins` list is configured.
- When deployed to Vercel (different subdomain from local), `BETTER_AUTH_URL` must match or CSRF checks may either fail or be bypassed.

### Missing Security Headers
- `next.config.ts` has no `headers()` export — no CSP, X-Frame-Options, HSTS, or X-Content-Type-Options.

### Login Error Message May Leak User Existence
- `src/app/(auth)/login/page.tsx` line 46 passes `error.message` from Better Auth directly to the user.
- If Better Auth returns distinct messages for "user not found" vs "wrong password", this enables user enumeration.

## Controls That Are Working
- `input: false` on role field prevents client-supplied role during sign-up.
- Dashboard layout correctly redirects unauthenticated users (session === null → redirect /login).
- `/users` page calls `auth.api.getSession()` independently (not relying solely on layout).
- Password field uses `autoComplete="current-password"` and show/hide toggle is accessibility-correct.
- `.env` is gitignored (`.env*` pattern in .gitignore) and was never committed.
- `BETTER_AUTH_SECRET` is a proper 64-char hex value (not the placeholder from .env.example).
- Prisma adapter used (no raw SQL in auth layer).

## High-Risk Files for Future Review
- `src/lib/auth.ts` — add rateLimit plugin, trustedOrigins, session expiry tuning
- `prisma/seed.ts` — never log or hardcode prod credentials; use env vars
- `src/middleware.ts` — MUST be created before any API routes are added (Phases 3–6)
- Future: any Server Action must call `auth.api.getSession()` independently, not rely on layout

## Pending Phase Security Requirements
- Phase 3 (User CRUD): all mutations must be Server Actions with admin role check; no API route without auth
- Phase 4 (Tickets): IDOR risk — every ticket query must scope to session.user.id or verify assignment
- Phase 5 (Email): SMTP creds in env only; inbound email body must be sanitized before DB insert
- Phase 6 (AI): system prompt must not include session data; user content must be sandboxed from instructions; rate limit AI endpoints
