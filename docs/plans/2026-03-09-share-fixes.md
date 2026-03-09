# Share Feature Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix two share feature issues: enterprise-aware fallback route on tampered URLs, and preserve URL search params when sharing.

**Architecture:** The share button captures the current route and encodes it into a base64 blob. The share page decodes it and navigates. We pass `pathname + search` instead of just `pathname` to preserve page state (pagination, sort, etc.), and use `useFeatureFlags()` to pick the correct fallback route.

**Tech Stack:** React, react-router-dom, Zod, Redux, vitest, react-testing-library

---

### Task 1: Update SharePage to use enterprise-aware fallback

**Files:**
- Modify: `src/pages/share/index.tsx`

**Step 1: Write the failing test**

Add to `src/pages/share/share.test.tsx`:

```tsx
test('navigates to operational center on missing s param in enterprise mode', () => {
  renderSharePage('', { preloadedState: { ...initialState, settings: { enterprise: true } } });
  expect(mockNavigate).toHaveBeenCalledWith('/operational-center', { replace: true });
});

test('navigates to explorer on missing s param in community mode', () => {
  renderSharePage('', { preloadedState: { ...initialState, settings: { enterprise: false } } });
  expect(mockNavigate).toHaveBeenCalledWith('/explorer', { replace: true });
});
```

Update `renderSharePage` to accept optional render options:

```tsx
const renderSharePage = (search: string, options?: { preloadedState?: typeof initialState }) =>
  renderWithProviders(
    <MemoryRouter initialEntries={[`/share${search}`]}>
      <SharePage />
    </MemoryRouter>,
    { preloadedState: options?.preloadedState ?? initialState },
  );
```

**Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/pages/share/share.test.tsx`
Expected: FAIL — navigates to `/explorer` regardless of enterprise flag

**Step 3: Implement enterprise-aware fallback in SharePage**

In `src/pages/share/index.tsx`:
- Import `useFeatureFlags` from `@/common/lib/use-feature-flags`
- Call `const { enterprise } = useFeatureFlags()` inside the component
- Replace `navigate(routes.explorer, { replace: true })` with `navigate(enterprise ? routes.operational_center : routes.explorer, { replace: true })`

**Step 4: Run tests to verify they pass**

Run: `pnpm vitest run src/pages/share/share.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/pages/share/index.tsx src/pages/share/share.test.tsx
git commit -m "fix: use enterprise-aware fallback route on invalid share links"
```

---

### Task 2: Preserve URL search params in shared links

**Files:**
- Modify: `src/common/design-system/layouts/components/header/share-button.tsx`
- Modify: `src/features/ui/share/shareable-state.test.ts`

**Step 1: Write the failing test**

Add to `src/features/ui/share/shareable-state.test.ts`:

```ts
test('roundtrips a route with search params', () => {
  const state: ShareableState = {
    ...FULL_STATE,
    route: '/hosts/42/incidents?page=3&sort=desc',
  };
  expect(decodeShareableState(encodeShareableState(state))).toEqual(state);
});
```

Add to `buildShareableState` describe block:

```ts
test('includes search params in route', () => {
  const result = buildShareableState(
    '/hosts/42/incidents?page=3&sort=desc',
    DATES_FROM,
    QUERY_FILTERS,
    TAG_FILTERS,
    4,
  );
  expect(result.route).toBe('/hosts/42/incidents?page=3&sort=desc');
});
```

**Step 2: Run tests to verify they pass**

Run: `pnpm vitest run src/features/ui/share/shareable-state.test.ts`
Expected: PASS (the encoding/decoding already handles any string starting with `/`)

**Step 3: Update ShareButton to pass search params**

In `src/common/design-system/layouts/components/header/share-button.tsx`, change:

```tsx
const state = buildShareableState(
  location.pathname,
  ...
);
```

to:

```tsx
const state = buildShareableState(
  location.pathname + location.search,
  ...
);
```

**Step 4: Update SharePage test to verify search params are preserved**

Add to `src/pages/share/share.test.tsx`:

```tsx
test('preserves URL search params from shared route', async () => {
  const sharedState: ShareableState = {
    ...SHARED_STATE,
    route: '/hosts/42/incidents?page=3&sort=desc',
  };
  const encoded = encodeShareableState(sharedState);
  renderSharePage(`?s=${encoded}`);
  expect(mockNavigate).toHaveBeenCalledWith('/hosts/42/incidents?page=3&sort=desc', {
    replace: true,
  });
});
```

**Step 5: Run all share-related tests**

Run: `pnpm vitest run src/pages/share/ src/features/ui/share/`
Expected: PASS

**Step 6: Commit**

```bash
git add src/common/design-system/layouts/components/header/share-button.tsx src/features/ui/share/shareable-state.test.ts src/pages/share/share.test.tsx
git commit -m "feat: preserve URL search params in shared links"
```

---

### Task 3: Run lint and type checks

**Step 1: Run quality checks**

```bash
pnpm run lint --fix
pnpm run check
```

Expected: No errors

**Step 2: Fix any issues if needed**

**Step 3: Commit fixes if any**

```bash
git commit -m "chore: fix lint issues"
```
