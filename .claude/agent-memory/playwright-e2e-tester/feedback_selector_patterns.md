---
name: feedback-selector-patterns
description: Known selector pitfalls and reliable patterns for this codebase's shadcn/ui components
metadata:
  type: feedback
---

## Password field selector

`page.getByLabel("Password")` resolves to TWO elements in the login page:
1. The `<input id="password">` element
2. The `<button aria-label="Show password">` toggle button

Playwright strict mode rejects this. Always use `page.locator("#password")` to target the input specifically.

**Why:** The eye-toggle button uses `aria-label="Show password"` / `aria-label="Hide password"`. Playwright's `getByLabel` matches both the `<label for="...">` association AND `aria-label` attributes.

**How to apply:** Any time you need to fill the password input, use `page.locator("#password")`. For the toggle button, use `page.getByRole("button", { name: "Show password" })` or `{ name: "Hide password" }`.

## Email field selector

`page.getByLabel("Email")` works fine — no ambiguity here.

## Sign-out button

`page.getByRole("button", { name: "Sign out" })` — works reliably (from SignOutButton component).

## Heading assertions

`page.getByRole("heading", { name: "Users" })` — reliable for h1 elements rendered by server components.
