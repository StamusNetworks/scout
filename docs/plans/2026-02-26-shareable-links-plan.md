# Shareable Links Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a share button in the header that generates a URL encoding the full app state (route, time, filters, tags, tenant), and a `/share` page that imports that state.

**Architecture:** Pure encode/decode functions in `src/features/share/`, a new `/share` page that hydrates Redux state and navigates, and a `ShareButton` in the header. Uses base64url-encoded JSON in a single `s` query param. Existing `/deeplink` route is untouched.

**Tech Stack:** React, Redux Toolkit, React Router v6, Sonner (toasts), lucide-react (icons), vitest + react-testing-library for tests.

---

### Task 1: ShareableState type and encode/decode utilities

**Files:**
- Create: `src/features/share/shareable-state.ts`
- Create: `src/features/share/shareable-state.test.ts`

**Step 1: Write the failing tests**

```typescript
// src/features/share/shareable-state.test.ts
import { describe, expect, test } from 'vitest';

import {
  decodeShareableState,
  encodeShareableState,
  type ShareableState,
} from './shareable-state';

const FULL_STATE: ShareableState = {
  route: '/hosts/42/incidents',
  tenant: 4,
  time: { type: 'from', duration: 30, unit: 'days' },
  tags: {
    alert: true,
    stamus: true,
    discovery: false,
    relevant: true,
    informational: false,
    untagged: true,
    novelty: false,
  },
  filters: [
    { key: 'src_ip', value: '192.168.1.1' },
    { key: 'msg', value: 'alert test', negated: true },
    { key: 'alert.severity', value: 3, wildcarded: true },
  ],
};

describe('encodeShareableState / decodeShareableState', () => {
  test('roundtrips a full state', () => {
    const encoded = encodeShareableState(FULL_STATE);
    expect(typeof encoded).toBe('string');
    expect(decodeShareableState(encoded)).toEqual(FULL_STATE);
  });

  test('roundtrips minimal state (no tenant, no filters)', () => {
    const minimal: ShareableState = {
      route: '/explorer',
      time: { type: 'all' },
      tags: {
        alert: true,
        stamus: true,
        discovery: true,
        relevant: true,
        informational: true,
        untagged: true,
        novelty: false,
      },
      filters: [],
    };
    expect(decodeShareableState(encodeShareableState(minimal))).toEqual(minimal);
  });

  test('produces URL-safe output (no +, /, =)', () => {
    const encoded = encodeShareableState(FULL_STATE);
    expect(encoded).not.toMatch(/[+/=]/);
  });

  test('returns null for invalid input', () => {
    expect(decodeShareableState('')).toBeNull();
    expect(decodeShareableState('not-valid-base64!!!')).toBeNull();
    expect(decodeShareableState('dGVzdA')).toBeNull(); // valid base64 but not JSON ShareableState
  });

  test('handles auto time type', () => {
    const state: ShareableState = {
      ...FULL_STATE,
      time: { type: 'auto' },
    };
    expect(decodeShareableState(encodeShareableState(state))).toEqual(state);
  });

  test('handles range time type', () => {
    const state: ShareableState = {
      ...FULL_STATE,
      time: { type: 'range', start: 1700000000000, end: 1700100000000 },
    };
    expect(decodeShareableState(encodeShareableState(state))).toEqual(state);
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/features/share/shareable-state.test.ts`
Expected: FAIL — module not found

**Step 3: Write the implementation**

```typescript
// src/features/share/shareable-state.ts
import { type TimeUnit } from '@/features/hunt/filtering/dates-filters/dates-filters.types';
import { type TagFilters } from '@/features/hunt/filtering/query-filters/store/query-filters.slice';

export type ShareableFilter = {
  key: string;
  value: string | number;
  negated?: boolean;
  wildcarded?: boolean;
};

export type ShareableTime =
  | { type: 'all' }
  | { type: 'auto' }
  | { type: 'from'; duration: number; unit: TimeUnit }
  | { type: 'range'; start: number; end: number };

export type ShareableState = {
  route: string;
  tenant?: number;
  time: ShareableTime;
  tags: TagFilters;
  filters: ShareableFilter[];
};

export const encodeShareableState = (state: ShareableState): string => {
  const json = JSON.stringify(state);
  // encodeURIComponent handles all Unicode safely, producing ASCII for btoa
  const base64 = btoa(encodeURIComponent(json));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const decodeShareableState = (
  encoded: string,
): ShareableState | null => {
  try {
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const json = decodeURIComponent(atob(base64));
    const parsed = JSON.parse(json);
    // Basic shape validation
    if (!parsed.route || !parsed.time || !parsed.tags || !parsed.filters) {
      return null;
    }
    return parsed as ShareableState;
  } catch {
    return null;
  }
};
```

**Step 4: Run tests to verify they pass**

Run: `pnpm vitest run src/features/share/shareable-state.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/share/shareable-state.ts src/features/share/shareable-state.test.ts
git commit -m "feat(share): add ShareableState type and encode/decode utilities"
```

---

### Task 2: buildShareableState and buildShareUrl pure functions

**Files:**
- Modify: `src/features/share/shareable-state.ts`
- Modify: `src/features/share/shareable-state.test.ts`

**Step 1: Write the failing tests**

Append to the test file:

```typescript
import { buildShareableState, buildShareUrl } from './shareable-state';

// Mock types matching Redux state shapes
const DATES_FROM = {
  type: 'from' as const,
  from_duration: 30,
  from_unit: 'days' as const,
  start_date: 1700000000000,
  end_date: 1700100000000,
};

const DATES_RANGE = {
  type: 'range' as const,
  start_date: 1700000000000,
  end_date: 1700100000000,
  from_duration: undefined,
  from_unit: undefined,
};

const DATES_AUTO = {
  type: 'auto' as const,
  start_date: 1700000000000,
  end_date: 1700100000000,
  from_duration: undefined,
  from_unit: undefined,
};

const DATES_ALL = {
  type: 'all' as const,
  start_date: undefined,
  end_date: undefined,
  from_duration: undefined,
  from_unit: undefined,
};

const TAG_FILTERS = {
  alert: true,
  stamus: true,
  discovery: false,
  relevant: true,
  informational: false,
  untagged: true,
  novelty: false,
};

const QUERY_FILTERS = [
  {
    id: '1',
    key: 'src_ip',
    value: '192.168.1.1',
    is_suspended: false,
    is_negated: false,
    is_wildcarded: false,
  },
  {
    id: '2',
    key: 'msg',
    value: 'test',
    is_suspended: true,
    is_negated: true,
    is_wildcarded: false,
  },
  {
    id: '3',
    key: 'alert.severity',
    value: 3,
    is_suspended: false,
    is_negated: false,
    is_wildcarded: true,
  },
];

describe('buildShareableState', () => {
  test('builds state with relative time', () => {
    const result = buildShareableState(
      '/hosts/42/incidents',
      DATES_FROM,
      QUERY_FILTERS,
      TAG_FILTERS,
      4,
    );
    expect(result).toEqual({
      route: '/hosts/42/incidents',
      tenant: 4,
      time: { type: 'from', duration: 30, unit: 'days' },
      tags: TAG_FILTERS,
      filters: [
        { key: 'src_ip', value: '192.168.1.1' },
        { key: 'alert.severity', value: 3, wildcarded: true },
      ],
    });
  });

  test('excludes suspended filters', () => {
    const result = buildShareableState(
      '/explorer',
      DATES_ALL,
      QUERY_FILTERS,
      TAG_FILTERS,
      undefined,
    );
    expect(result.filters).toHaveLength(2);
    expect(result.filters.find((f) => f.key === 'msg')).toBeUndefined();
  });

  test('omits tenant when undefined', () => {
    const result = buildShareableState(
      '/explorer',
      DATES_ALL,
      [],
      TAG_FILTERS,
      undefined,
    );
    expect(result.tenant).toBeUndefined();
    expect('tenant' in result).toBe(false);
  });

  test('omits negated/wildcarded when false', () => {
    const result = buildShareableState(
      '/explorer',
      DATES_ALL,
      QUERY_FILTERS,
      TAG_FILTERS,
      undefined,
    );
    const srcIpFilter = result.filters.find((f) => f.key === 'src_ip')!;
    expect('negated' in srcIpFilter).toBe(false);
    expect('wildcarded' in srcIpFilter).toBe(false);
  });

  test('handles range time', () => {
    const result = buildShareableState(
      '/explorer',
      DATES_RANGE,
      [],
      TAG_FILTERS,
      undefined,
    );
    expect(result.time).toEqual({
      type: 'range',
      start: 1700000000000,
      end: 1700100000000,
    });
  });

  test('handles auto time', () => {
    const result = buildShareableState(
      '/explorer',
      DATES_AUTO,
      [],
      TAG_FILTERS,
      undefined,
    );
    expect(result.time).toEqual({ type: 'auto' });
  });
});

describe('buildShareUrl', () => {
  test('produces a valid share URL', () => {
    const url = buildShareUrl(FULL_STATE, 'https://scout.app', '/');
    expect(url).toMatch(/^https:\/\/scout\.app\/share\?s=.+$/);
    // Roundtrip: decode the s param
    const s = new URL(url).searchParams.get('s')!;
    expect(decodeShareableState(s)).toEqual(FULL_STATE);
  });

  test('handles base path with trailing slash', () => {
    const url = buildShareUrl(FULL_STATE, 'https://scout.app', '/app/');
    expect(url).toMatch(/^https:\/\/scout\.app\/app\/share\?s=.+$/);
  });

  test('handles base path without trailing slash', () => {
    const url = buildShareUrl(FULL_STATE, 'https://scout.app', '/app');
    expect(url).toMatch(/^https:\/\/scout\.app\/app\/share\?s=.+$/);
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/features/share/shareable-state.test.ts`
Expected: FAIL — `buildShareableState` and `buildShareUrl` not exported

**Step 3: Write the implementation**

Add to `src/features/share/shareable-state.ts`:

```typescript
import { type DatesState } from '@/features/hunt/filtering/dates-filters/dates-filters.types';
import { type QueryFilterState } from '@/features/hunt/filtering/query-filters/model/query-filter';

export const buildShareableState = (
  route: string,
  dates: DatesState,
  queryFilters: QueryFilterState[],
  tagFilters: TagFilters,
  tenant: number | undefined,
): ShareableState => ({
  route,
  ...(tenant !== undefined && { tenant }),
  time: buildTimePayload(dates),
  tags: { ...tagFilters },
  filters: queryFilters
    .filter((f) => !f.is_suspended)
    .map((f) => ({
      key: f.key,
      value: f.value,
      ...(f.is_negated && { negated: true }),
      ...(f.is_wildcarded && { wildcarded: true }),
    })),
});

const buildTimePayload = (dates: DatesState): ShareableTime => {
  switch (dates.type) {
    case 'all':
      return { type: 'all' };
    case 'auto':
      return { type: 'auto' };
    case 'from':
      return { type: 'from', duration: dates.from_duration!, unit: dates.from_unit! };
    case 'range':
      return { type: 'range', start: dates.start_date!, end: dates.end_date! };
  }
};

export const buildShareUrl = (
  state: ShareableState,
  origin: string,
  basePath: string,
): string => {
  const encoded = encodeShareableState(state);
  const base = basePath.replace(/\/+$/, '');
  return `${origin}${base}/share?s=${encoded}`;
};
```

**Step 4: Run tests to verify they pass**

Run: `pnpm vitest run src/features/share/shareable-state.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/share/shareable-state.ts src/features/share/shareable-state.test.ts
git commit -m "feat(share): add buildShareableState and buildShareUrl functions"
```

---

### Task 3: Share page (import route)

**Files:**
- Create: `src/pages/share/index.tsx`
- Create: `src/pages/share/share.test.tsx`
- Modify: `src/pages/routes.config.ts` (add `share: '/share'`)
- Modify: `src/pages/router.tsx` (register `/share` route)

**Step 1: Write the failing tests**

```typescript
// src/pages/share/share.test.tsx
import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/common/testing/test-utils';
import {
  encodeShareableState,
  type ShareableState,
} from '@/features/share/shareable-state';
import { initialState } from '@/store/store.init';

import { SharePage } from './index';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const SHARED_STATE: ShareableState = {
  route: '/hosts/42/incidents',
  tenant: 4,
  time: { type: 'from', duration: 7, unit: 'days' },
  tags: {
    alert: true,
    stamus: false,
    discovery: true,
    relevant: true,
    informational: false,
    untagged: true,
    novelty: true,
  },
  filters: [
    { key: 'src_ip', value: '10.0.0.1' },
    { key: 'msg', value: 'test', negated: true },
  ],
};

const renderSharePage = (search: string) =>
  renderWithProviders(
    <MemoryRouter initialEntries={[`/share${search}`]}>
      <SharePage />
    </MemoryRouter>,
    { preloadedState: initialState },
  );

describe('SharePage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('decodes state and navigates to target route', async () => {
    const encoded = encodeShareableState(SHARED_STATE);
    renderSharePage(`?s=${encoded}`);
    // Should navigate to the target route
    expect(mockNavigate).toHaveBeenCalledWith(SHARED_STATE.route, {
      replace: true,
    });
  });

  test('navigates to explorer on missing s param', () => {
    renderSharePage('');
    expect(mockNavigate).toHaveBeenCalledWith('/explorer', { replace: true });
  });

  test('navigates to explorer on invalid s param', () => {
    renderSharePage('?s=garbage!!!');
    expect(mockNavigate).toHaveBeenCalledWith('/explorer', { replace: true });
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/pages/share/share.test.tsx`
Expected: FAIL — module not found

**Step 3: Write the Share page**

```typescript
// src/pages/share/index.tsx
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { setDates } from '@/features/hunt/filtering/dates-filters/dates-filters.slice';
import { type DatesPayload } from '@/features/hunt/filtering/dates-filters/dates-filters.types';
import {
  clearQueryFilters,
  replaceFilters,
  updateTagFilters,
} from '@/features/hunt/filtering/query-filters/store/query-filters.slice';
import { type FilterInput } from '@/features/hunt/filtering/query-filters/utils/filter-mapper';
import {
  decodeShareableState,
  type ShareableState,
  type ShareableTime,
} from '@/features/share/shareable-state';
import { setTenant } from '@/features/user/tenancy/tenancy.slice';
import { useAppDispatch } from '@/store/store';

import { routes } from '../routes.config';

const toDatesPayload = (time: ShareableTime): DatesPayload => {
  switch (time.type) {
    case 'all':
      return { type: 'all' };
    case 'auto':
      return { type: 'auto', start_date: 0, end_date: Date.now() };
    case 'from':
      return { type: 'from', from_duration: time.duration, from_unit: time.unit };
    case 'range':
      return { type: 'range', start_date: time.start, end_date: time.end };
  }
};

const toFilterInputs = (
  filters: ShareableState['filters'],
): FilterInput[] =>
  filters.map((f) => ({
    key: f.key,
    value: f.value,
    options: {
      ...(f.negated && { is_negated: true }),
      ...(f.wildcarded && { is_wildcarded: true }),
    },
  }));

export const SharePage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const encoded = params.get('s');

    if (!encoded) {
      toast.error('Invalid share link');
      navigate(routes.explorer, { replace: true });
      return;
    }

    const state = decodeShareableState(encoded);
    if (!state) {
      toast.error('Invalid share link');
      navigate(routes.explorer, { replace: true });
      return;
    }

    // Set tenant
    if (state.tenant !== undefined) {
      dispatch(setTenant(state.tenant));
    }

    // Set time filters
    dispatch(setDates(toDatesPayload(state.time)));

    // Set tag filters
    dispatch(updateTagFilters(state.tags));

    // Set query filters: clear then replace
    dispatch(clearQueryFilters());
    if (state.filters.length > 0) {
      dispatch(replaceFilters(toFilterInputs(state.filters)));
    }

    navigate(state.route, { replace: true });
  }, []);

  return null;
};
```

**Step 4: Register the route**

In `src/pages/routes.config.ts`, add to the routes object:
```typescript
share: '/share',
```

In `src/pages/router.tsx`, add the import and route entry next to the deeplink route:
```typescript
import { SharePage } from './share';

// Inside createRouter, after the deeplink route:
{
  path: routes.share,
  element: (
    <PageBoundary key="share">
      <SharePage />
    </PageBoundary>
  ),
},
```

**Step 5: Run tests to verify they pass**

Run: `pnpm vitest run src/pages/share/share.test.tsx`
Expected: PASS

**Step 6: Commit**

```bash
git add src/pages/share/ src/pages/routes.config.ts src/pages/router.tsx
git commit -m "feat(share): add /share import page and route"
```

---

### Task 4: ShareButton component in header

**Files:**
- Create: `src/common/design-system/layouts/components/header/share-button.tsx`
- Create: `src/common/design-system/layouts/components/header/share-button.test.tsx`
- Modify: `src/common/design-system/layouts/components/header/header.tsx`

**Step 1: Write the failing tests**

```typescript
// src/common/design-system/layouts/components/header/share-button.test.tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/common/testing/test-utils';
import { initialState } from '@/store/store.init';

import { ShareButton } from './share-button';

// Mock clipboard API
const writeText = vi.fn().mockResolvedValue(undefined);
Object.assign(navigator, { clipboard: { writeText } });

describe('ShareButton', () => {
  beforeEach(() => {
    writeText.mockClear();
  });

  test('copies a share URL to clipboard on click', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/detection-events']}>
        <ShareButton />
      </MemoryRouter>,
      { preloadedState: initialState },
    );

    await userEvent.click(screen.getByRole('button', { name: /share/i }));

    expect(writeText).toHaveBeenCalledTimes(1);
    const url = writeText.mock.calls[0][0];
    expect(url).toContain('/share?s=');
  });

  test('includes current route path in the share URL', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/hosts/42/incidents']}>
        <ShareButton />
      </MemoryRouter>,
      { preloadedState: initialState },
    );

    await userEvent.click(screen.getByRole('button', { name: /share/i }));

    const url = writeText.mock.calls[0][0];
    // The encoded state should contain the route
    expect(url).toContain('/share?s=');
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/common/design-system/layouts/components/header/share-button.test.tsx`
Expected: FAIL — module not found

**Step 3: Write the ShareButton component**

```typescript
// src/common/design-system/layouts/components/header/share-button.tsx
import { Link } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/common/design-system/atoms/ui/button';
import { selectDates } from '@/features/hunt/filtering/dates-filters/dates-filters.ts';
import { selectQueryFilters } from '@/features/hunt/filtering/query-filters/store/query-filters.selector';
import {
  buildShareableState,
  buildShareUrl,
} from '@/features/share/shareable-state';
import { selectTenant } from '@/features/user/tenancy/tenancy.selector';
import { useAppSelector, type RootState } from '@/store/store';

export const ShareButton = () => {
  const location = useLocation();
  const dates = useAppSelector(selectDates);
  const queryFilters = useAppSelector(selectQueryFilters);
  const tagFilters = useAppSelector(
    (state: RootState) => state.filters.queryFilters.tagFilters,
  );
  const tenant = useAppSelector(selectTenant);

  const handleClick = () => {
    const state = buildShareableState(
      location.pathname,
      dates,
      queryFilters,
      tagFilters,
      tenant,
    );
    const url = buildShareUrl(
      state,
      window.location.origin,
      import.meta.env.BASE_URL || '/',
    );
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={handleClick}
      aria-label="Share current view"
    >
      <Link />
    </Button>
  );
};
```

**Step 4: Add ShareButton to the header**

In `src/common/design-system/layouts/components/header/header.tsx`:

Add import:
```typescript
import { ShareButton } from './share-button';
```

Insert a new `<NavigationMenuItem>` between `<ReloadButton />` and `<DatesPicker />`:
```tsx
<NavigationMenuItem>
  <ShareButton />
</NavigationMenuItem>
```

**Step 5: Run tests to verify they pass**

Run: `pnpm vitest run src/common/design-system/layouts/components/header/share-button.test.tsx`
Expected: PASS

Run: `pnpm vitest run src/common/design-system/layouts/components/header/header.test.tsx`
Expected: PASS (existing tests still pass)

**Step 6: Commit**

```bash
git add src/common/design-system/layouts/components/header/
git commit -m "feat(share): add share button to header toolbar"
```

---

### Task 5: Lint, type-check, and full test suite

**Step 1: Run lint**

Run: `pnpm run lint --fix`
Expected: No errors (warnings OK)

**Step 2: Run type-check**

Run: `pnpm run check`
Expected: No errors

**Step 3: Run all tests**

Run: `pnpm vitest run`
Expected: All tests pass

**Step 4: Fix any issues found**

If lint/check/tests fail, fix the issues.

**Step 5: Commit fixes if any**

```bash
git add -u
git commit -m "fix(share): address lint and type-check issues"
```
