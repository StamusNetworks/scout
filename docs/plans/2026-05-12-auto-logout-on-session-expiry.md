# Auto-logout on session expiry — Implementation Plan

**Status:** implemented
**Source:** [bugtracker#19, note 240011](https://git.stamus-networks.com/devel/projectorganisation/bugtracker/-/work_items/19#note_240011)
**Bug:** Scout UI does not automatically log out when the ClearNDR session expires; instead it stays on the page and surfaces raw errors on reload.
**Milestone:** Upgrade 42.3
**Base:** `origin/staging` @ `8930ce0` (rebased 2026-05-12)

---

## Goal

When the backend invalidates the session (idle timeout or otherwise), the Scout UI must redirect the user to the backend login page automatically — both proactively (server-driven heartbeat) and reactively (any 401/403 from authenticated traffic) — without requiring a manual reload.

## Architecture

Two independent triggers, both implemented:

| Approach | Trigger | Notes |
| --- | --- | --- |
| **A. Server-driven via `useSessionActivity`** | Backend `disconnect: true` on the existing 30 s heartbeat | Type already exists in `auth.api.ts`; the field is just ignored today. Hook only runs the interval when `VITE_APP_MODE === 'production'`, so this trigger only fires in production — consistent with the existing dev escape hatch. |
| **B. Reactive 401/403 handler in RTK Query base** | Any authenticated request returning 401 or 403 | Covers paths where the heartbeat is stalled (suspended tab, etc.) and runs in all environments except dev (the helper itself short-circuits in dev). |

Approach C (pure client `setTimeout`) is explicitly rejected — two clocks drift and it punishes users while the session is still valid.

**Cross-feature boundary:** `src/features/auth/api/auth.api.ts` already imports `API` from `@/store/api` at module body, so any path that has `@/store/api` import from `@/features/auth` would create a module-init cycle (and is blocked by oxlint's `no-restricted-imports` on `@/features/*/api/**`). To stay both lint-clean and cycle-free:

1. The helper lives at `src/features/auth/api/redirect-to-login.ts` and is **re-exported through the `@/features/auth` public barrel** (it depends only on `@/config`, so transitively pulling it into the barrel is safe).
2. `src/store/api.ts` does NOT import `@/features/auth`. Instead it exposes a registration function `setOnUnauthenticated(handler)` and calls a module-scoped `onUnauthenticated()` callback on 401/403.
3. The bootstrap site (`src/app/app.loader.tsx`) imports `redirectToLogin` through the barrel and wires it: `setOnUnauthenticated(() => redirectToLogin({ variant: 'login' }))`.

This is RTK Query's documented reauth pattern. The handler default is a no-op so the API works in isolation (tests, storybook) without a registered handler.

## Tech Stack

React, RTK Query, vitest, react-testing-library, msw.

---

## Confirmed state @ `8930ce0`

- `src/features/auth/hooks/use-session-activity.ts` — posts the idle counter every 30 s, never reads the response. Interval only runs in `VITE_APP_MODE === 'production'`.
- `src/features/auth/api/auth.api.ts:10` — backend already returns `{ disconnect: boolean }`; the field is ignored.
- `src/store/api.ts` (L24–75) — `baseQuery` has no 401/403 branch; errors fall through to `apiErrorToast`.
- `src/app/app.loader.tsx:40–48` — has a 403 → backend login redirect, but only at app boot for the `system-settings` query.
- `src/common/design-system/layouts/components/navigation/app-sidebar.tsx:315` — manual logout button does `window.location.href = getConfig()?.apiUrl + '/accounts/logout/'`, no client-side state clearing.

---

## TDD task plan

Each cycle is a vertical slice. Tests live next to the code they cover (vitest for hooks/logic, RTL + msw for components).

**Order of execution:** 1 → 5 → 2 → 3 → 4. Each step leaves the codebase in a working, committable state.

### Task 1: Extract `redirectToLogin()` helper

**Complexity:** standard

**Files:**
- Create: `src/features/auth/api/redirect-to-login.ts`
- Create: `src/features/auth/api/redirect-to-login.test.ts`
- Modify: `src/app/app.loader.tsx` (use the helper instead of inline `window.location.href`)

**RED:** `redirect-to-login.test.ts` —
- `redirectToLogin({ variant: 'login' })` sets `window.location.href` to `${apiUrl}/accounts/login${BASE_URL}` in non-dev modes.
- `redirectToLogin({ variant: 'logout' })` sets `window.location.href` to `${apiUrl}/accounts/logout/` in non-dev modes.
- When `import.meta.env.VITE_APP_MODE === 'development'`, the helper logs and does NOT mutate `window.location.href`.

**GREEN:** Implement the helper in `src/features/auth/api/redirect-to-login.ts`. Update `app.loader.tsx` boot-time 403 redirect to call `redirectToLogin({ variant: 'login' })`.

**Notes:** Helper is exported through `src/features/auth/index.ts` (public barrel). `src/store/api.ts` will NOT import the helper directly — see "Cross-feature boundary" above for the inversion-of-control wiring.

---

### Task 5: Suppress generic toast for 401/403

**Complexity:** trivial

**Files:**
- Modify: `src/store/api.error.ts`
- Create: `src/store/api.error.test.ts`

**RED:** `apiErrorToast` does not call `toast.error` when the error status is 401 or 403 (numeric or string forms — match `originalStatus` and `status` like `getTitle` already does). Non-auth statuses still toast.

**GREEN:** Add an `isUnauthenticatedError` predicate and early-return in `apiErrorToast`. Keep existing abort-error behaviour.

**Why early in the order:** Implemented before Task 3 so when the global handler kicks in, there's no stale "Request failed (401)" toast on the redirect.

---

### Task 2: Server-driven logout via heartbeat (Approach A)

**Complexity:** standard

**Files:**
- Modify: `src/features/auth/hooks/use-session-activity.ts`
- Create: `src/features/auth/hooks/use-session-activity.test.ts`

**RED:** When the `updateSessionActivity` mutation resolves with `{ disconnect: true }`, the hook calls `redirectToLogin({ variant: 'login' })` exactly once and stops scheduling further ticks (no double-fire if a stale interval response also returns `disconnect: true`).

**GREEN:** `await` (or `.unwrap()`) the mutation result inside the interval tick; on `disconnect: true`, clear the interval and call the helper. Use a module-scoped or ref guard to keep it idempotent.

---

### Task 3: Reactive 401/403 handler in RTK Query base (Approach B)

**Complexity:** complex

**Files:**
- Modify: `src/store/api.ts`
- Create: `src/store/api.test.ts`

**RED:**
- Any RTK Query response with status 401 or 403 invokes `redirectToLogin` exactly once even when N concurrent in-flight queries fail.
- Subsequent 401/403s after the first redirect are silent (no spam).
- 4xx other than 401/403 and 5xx still flow through `apiErrorToast` as before.

**GREEN:** Wrap `baseQuery` with a `baseQueryWithReauth` that branches on `result.error?.status` ∈ {401, 403}. Use a module-scoped boolean guard (`hasRedirected`) so concurrent failures coalesce into a single call. The wrapper calls a module-scoped `onUnauthenticated()` callback (default: no-op). `src/store/api.ts` exports `setOnUnauthenticated(handler)` for the bootstrap site to register `() => redirectToLogin({ variant: 'login' })`. The wiring lives in `src/app/app.loader.tsx`.

**Concurrency considerations:**
- Use `originalStatus` fallback (RTK Query strips bodies from non-JSON responses and exposes the HTTP code via `originalStatus`).
- The guard must reset on full page reload (module-scope is fine — the page is gone after the redirect anyway).

---

### Task 4: Manual logout button uses the same helper

**Complexity:** standard

**Files:**
- Modify: `src/common/design-system/layouts/components/navigation/app-sidebar.tsx`
- Create or modify: `src/common/design-system/layouts/components/navigation/app-sidebar.test.tsx`

**RED:** Clicking the "Log Out" button in the sidebar user footer calls `redirectToLogin({ variant: 'logout' })`. Manual logout still navigates the user away.

**GREEN:** Replace the inline `window.location.href = getConfig()?.apiUrl + '/accounts/logout/'` with a call to the helper. No behaviour change beyond reuse.

---

### REFACTOR (after Task 4)

- Confirm there is exactly one place that writes to `window.location.href` for auth navigation (the helper).
- Quick `grep` audit to ensure no other code paths still build login/logout URLs inline.

---

## Acceptance criteria

- [ ] **Heartbeat-driven logout (idempotent):** With `VITE_APP_MODE` stubbed to `'production'`, when `useSessionActivity`'s heartbeat mutation resolves with `{ disconnect: true }`, `redirectToLogin` is called exactly once, the heartbeat interval is cleared before the next 30-second tick, and a second `disconnect: true` response does not invoke `redirectToLogin` again. **Test:** vitest spec on `use-session-activity` using `vi.stubEnv` and a mocked mutation.
- [ ] **401/403 redirect, concurrency-safe:** Any RTK Query response with HTTP 401 or 403 — including when surfaced as `originalStatus` — invokes `redirectToLogin` exactly once even when N concurrent requests fail. Subsequent 401/403s after the first redirect are silent. **Test:** vitest spec on the wrapped base query with a stubbed `fetchBaseQuery` and a mocked `redirectToLogin`.
- [ ] **Toast suppressed for 401/403 (numeric and string):** `apiErrorToast` does NOT call `toast.error` when the error status is `401`/`403` (numeric) or `'401'`/`'403'` (string) on either `status` or `originalStatus`. **Test:** vitest spec covering all four combinations.
- [ ] **Manual logout button uses the helper:** Clicking the sidebar "Log Out" button calls `redirectToLogin({ variant: 'logout' })` exactly once. **Test:** RTL spec on `SidebarUserFooter` with `redirectToLogin` module-mocked; assert the mock was called with `{ variant: 'logout' }`.
- [ ] **Dev escape hatch:** When `VITE_APP_MODE === 'development'`, the helper logs and does NOT mutate `window.location`. **Test:** vitest spec on the helper with `vi.stubEnv('VITE_APP_MODE', 'development')`.
- [ ] **Non-auth errors still toast (positive regression cases):** `apiErrorToast` still calls `toast.error` for status 500 and for plain network errors. Abort-like errors continue to be silently dropped. **Test:** explicit positive assertions in `api.error.test.ts` — not left as implied by absence.
- [ ] **AppLoader uses the helper:** The boot-time 403 redirect in `AppLoader` calls `redirectToLogin({ variant: 'login' })` rather than assigning `window.location.href` inline. **Test:** assertion can be a vitest spec on `AppLoader` with a 403 from `useSystemSettings` and the mocked helper, OR a grep-style assertion that `app.loader.tsx` no longer constructs the login URL inline.
- [ ] `pnpm run lint --fix` and `pnpm run check` pass with zero new errors.

## Pre-PR quality gate

```sh
pnpm run lint --fix
pnpm run check
pnpm test
```

Per `CLAUDE.md`: no lint or TypeScript errors before commit.

## Build notes (decisions made during implementation)

1. **Helper location moved to `utils/`.** Plan originally placed the helper at `src/features/auth/api/redirect-to-login.ts`. `api/` is documented in `docs/architecture.md` as the HTTP boundary; the helper does no HTTP work. Moved to `src/features/auth/utils/redirect-to-login.ts` (new sub-folder for the auth feature). Re-exported from the public barrel unchanged.
2. **Inversion-of-control via `setOnUnauthenticated`.** Plan describes this in "Cross-feature boundary"; implementation lives in `src/store/with-reauth.ts` (test-only `resetReauthForTests` exported). `src/store/api.ts` re-exports `setOnUnauthenticated`; `src/app/app.loader.tsx` wires it at module scope.
3. **Latch-on-navigation, not latch-on-call.** Security review surfaced that the original `hasRedirected` design flipped the latch every time the handler was invoked, including dev-mode no-ops. `redirectToLogin` now returns `boolean` ("did navigate"); the wrapper only flips the latch on `true`. Keeps 401/403 handling alive in dev mode if the helper short-circuits.
4. **`SidebarUserFooter` exported.** Was previously a private internal component in `app-sidebar.tsx`. Exporting it added a test seam so the RTL spec can render the footer in isolation without bringing up the full sidebar tree.

## Out of scope

- Server-side configuration of the idle window (lives in ClearNDR backend).
- Building an in-app login screen (the project relies on the backend's login page).
- Cleaning up the dead `auth.slice.ts` `refreshToken` / `setRefreshToken` / always-empty `accessToken` plumbing — separate PR.
- Refresh-token rotation — not currently used.

## Follow-ups surfaced by review (not addressed in this PR)

- **Open-redirect surface via `/config.json`** — `apiUrl` is concatenated raw into `window.location.href`. If `/config.json` is poisoned or MITM'd, every session-expiry would phish credentials on an attacker-controlled origin. Project-wide trust assumption, not introduced here. Mitigation: SRI on `/config.json` or origin-allowlist in `getConfig()`.
- **`Cookies` header echoes `document.cookie`** in `src/store/api.ts:61` — redundant given `credentials: 'include'` and undermines HttpOnly downstream. Pre-existing.
- **Defense-in-depth for `VITE_APP_MODE`** — build-time-injected, so spoofing requires bundle write access; consider gating the dev-mode bypass on hostname additionally if a customer ever runs a dev bundle.
- **ADR for store↔feature IoC pattern** — the registration-function shape introduced here will recur. Worth codifying in `docs/architecture.md` or `docs/adr/` before the second instance lands.
- **`keypress` deprecated** in `use-session-activity.ts` — `keydown` is the modern equivalent. Out of scope for this bug but easy follow-up.
