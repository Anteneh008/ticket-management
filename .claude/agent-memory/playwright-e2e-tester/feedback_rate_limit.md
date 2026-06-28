---
name: feedback-rate-limit
description: Better Auth rate limiter causes login test failures when too many sign-in calls happen in one run
metadata:
  type: feedback
---

Better Auth is configured with `rateLimit: { window: 60, max: 10 }` (10 requests per 60-second IP window).

In a single Playwright run: setup saves 2 sessions (agent + admin), then each unauthenticated login test costs 1 more hit. If multiple "login via form" tests run back-to-back, the rate limiter blocks them and returns "Invalid email or password." — causing the test to stay on /login forever and time out.

**Why:** Discovered when test 2 (admin form login) failed despite valid credentials — the API call itself was being rate-limited.

**How to apply:**
- Limit full form-login tests to the minimum needed to cover the flow (typically 1 per role per run).
- For "admin sees X on dashboard" style tests, reuse `storageState: ADMIN_AUTH_FILE` instead of going through the login form again.
- The setup project (`auth.setup.ts`) already counts against the rate limit — account for its 2 hits when planning how many form-login tests to write.
- Error tests (bad credentials) also count against the limit, but they don't risk timing out — they just show the error message faster if rate limited (which is acceptable).
