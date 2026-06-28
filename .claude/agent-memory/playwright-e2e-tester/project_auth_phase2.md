---
name: project-auth-phase2
description: Auth E2E coverage status and discovered patterns for Phase 2 (Better Auth)
metadata:
  type: project
---

Phase 2 authentication E2E tests are complete. All 15 tests pass.

**Why:** Better Auth with email/password, role-based routing (admin/agent), session cookies, rate limiting.

**How to apply:** When adding more auth tests, reference existing coverage below to avoid duplication and respect the rate-limit pattern.

## Coverage implemented (tests/auth.spec.ts)

- Test 1: Agent login via form → /dashboard welcome message (full form flow)
- Test 2: Admin session → /dashboard shows "Welcome back, Admin." (uses saved storageState)
- Test 3: Invalid email → "Invalid email or password." error
- Test 4: Invalid password → "Invalid email or password." error
- Test 5: Empty email → Zod error "Enter a valid email address"
- Test 6: Empty password → Zod error "Password is required"
- Test 7: Eye toggle → type switches between "password" and "text"
- Test 8: Unauthenticated /dashboard → /login?callbackUrl=...
- Test 9: Unauthenticated /users → /login
- Test 10: Agent visits /users → redirected to /dashboard (requireRole blocks)
- Test 11: Admin visits /users → sees "Users" heading
- Test 12: Sign out → /login, /dashboard no longer accessible
- Test 13: POST /api/auth/sign-up/email → 4xx (disableSignUp: true)

## Session state files
- tests/.auth/agent.json — saved by auth.setup.ts
- tests/.auth/admin.json — saved by auth.setup.ts
- tests/.auth/ is gitignored
