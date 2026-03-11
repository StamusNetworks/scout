# TanStack Router Migration Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace React Router v6 with TanStack Router file-based routing, refactor hosts table page as proof of concept for route-as-orchestrator pattern.

**Architecture:** File-based routing with auto code splitting via Vite plugin. Routes own search params and data flow for table pages. Redux stays for global state. nuqs replaced by TanStack Router search params on migrated pages.

**Tech Stack:** TanStack Router v1, @tanstack/zod-adapter, zod, Vite, Redux Toolkit, RTK Query

**Spec:** `docs/superpowers/specs/2026-03-11-tanstack-router-migration-design.md`

---

## Chunk 1: Infrastructure Setup

### Task 1: Install dependencies and configure Vite plugin

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`

- [ ] **Step 1: Install @tanstack/zod-adapter**

```bash
pnpm add @tanstack/zod-adapter
```

- [ ] **Step 2: Configure TanStack Router Vite plugin**

In `vite.config.ts`, add the TanStack Router plugin BEFORE the React plugin:

```ts
/// <reference types="vitest" />

import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd(), '') };
  return defineConfig({
    plugins: [
      TanStackRouterVite({
        autoCodeSplitting: true,
        routesDirectory: './src/routes',
        generatedRouteTree: './src/routeTree.gen.ts',
      }),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      proxy: {
        '/rest': {
          target: `https://${process.env.VITE_PROXY}/rest`,
          rewrite: (path) => path.replace(/^\/rest/, ''),
          changeOrigin: true,
          secure: false,
        },
        '/blog': {
          target: `https://${process.env.VITE_PROXY}/blog`,
          rewrite: (path) => path.replace(/^\/blog/, ''),
          changeOrigin: true,
          secure: false,
        },
        '/api': {
          target: `https://${process.env.VITE_PROXY}/api`,
          rewrite: (path) => path.replace(/^\/api/, ''),
          changeOrigin: true,
          secure: false,
        },
      },
    },
  });
};
```

- [ ] **Step 3: Add `routeTree.gen.ts` to `.gitignore`**

Append to `.gitignore`:
```
src/routeTree.gen.ts
```

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml vite.config.ts .gitignore
git commit -m "chore: configure TanStack Router Vite plugin"
```

---

### Task 2: Create root route and router instance

**Files:**
- Create: `src/routes/__root.tsx`
- Create: `src/router.tsx`
- Modify: `src/store/store.ts` (export store singleton)

- [ ] **Step 1: Export store singleton from store module**

In `src/store/store.ts`, uncomment/add the store singleton export. Add after the `setupStore` function:

```ts
// Store singleton — used by router context and App.tsx
export const store = setupStore();
export const persistor = persistStore(store);
```

Also add the import at the top:
```ts
import { persistStore } from 'redux-persist';
```

- [ ] **Step 2: Create the root route**

Create `src/routes/__root.tsx`:

```tsx
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import { useEffect, useMemo } from 'react';

import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  SidebarInset,
  SidebarProvider,
} from '@/common/design-system/atoms/ui/sidebar';
import { NotFound } from '@/common/design-system/layouts/components/404';
import { Header } from '@/common/design-system/layouts/components/header/header';
import { Modals } from '@/common/design-system/layouts/components/modals';
import { AppSidebar } from '@/common/design-system/layouts/components/navigation/app-sidebar';
import { defaultMenu } from '@/common/design-system/layouts/components/navigation/navigation.config';
import { useFeatureFlags } from '@/common/lib/use-feature-flags';
import { BreadcrumbProvider } from '@/common/design-system/molecules/breadcrumbs';
import { FiltersSideBar } from '@/features/hunt/filtering/query-filters/components/filters-side-bar';
import {
  selectIsSidebarOpen,
  setIsSidebarOpen,
  setOpenModal,
} from '@/features/ui/ui-state.slice';
import { useGetSystemSettingsQuery } from '@/features/user/settings/settings.api';
import type { AppStore } from '@/store/store';
import { useAppDispatch, useAppSelector } from '@/store/store';

export interface RouterContext {
  store: AppStore;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: NotFound,
});

function RootComponent() {
  const dispatch = useAppDispatch();
  const { enterprise } = useFeatureFlags();
  const isFiltersOpen = useAppSelector(selectIsSidebarOpen);

  useEffect(() => {
    const keyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'k') {
          e.preventDefault();
          dispatch(setOpenModal('globalCommand'));
        }
        if (e.key === 'l') {
          e.preventDefault();
          dispatch(setOpenModal('addFilterCommand'));
        }
        if (e.key === 'o') {
          e.preventDefault();
          dispatch(setOpenModal('addEsFilter'));
        }
      }
      const activeElement = document.activeElement;
      const isTyping =
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA' ||
        activeElement?.getAttribute('contenteditable') === 'true' ||
        activeElement?.getAttribute('role') === 'textbox';

      if (e.key === '/' && !isTyping) {
        e.preventDefault();
        dispatch(setOpenModal('globalCommand'));
      }
    };
    document.addEventListener('keydown', keyPress);
    return () => {
      document.removeEventListener('keydown', keyPress);
    };
  }, [dispatch]);

  const { data: systemSettings } = useGetSystemSettingsQuery();

  const menu = useMemo(() => {
    return defaultMenu(systemSettings!, enterprise);
  }, [systemSettings, enterprise]);

  return (
    <BreadcrumbProvider>
      <SidebarProvider>
        <Modals />
        <AppSidebar menu={menu} />
        <SidebarInset className="border">
          <div className="relative flex h-full flex-col overflow-hidden">
            <Header />
            <Row className="h-full gap-0 overflow-clip">
              <div
                id="expandable-portal-wrapper"
                className="empty:hidden"
              />
              <div className="relative grow">
                <Button
                  className="absolute top-[6px] right-0 z-50 -translate-x-2"
                  onClick={() => dispatch(setIsSidebarOpen(!isFiltersOpen))}
                  variant="ghost"
                  size="icon"
                >
                  {isFiltersOpen ? <PanelRightClose /> : <PanelRightOpen />}
                </Button>
                <Outlet />
              </div>
              <FiltersSideBar />
            </Row>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </BreadcrumbProvider>
  );
}
```

- [ ] **Step 2b: Update `defaultMenu` to remove `routes` parameter**

The `defaultMenu` function in `src/common/design-system/layouts/components/navigation/navigation.config.tsx` currently takes `(routes: Record<string, string>, systemSettings: SystemSettings, enterprise: boolean)` as its signature. The `routes` object comes from `routes.config.ts` which is being deleted.

Update `navigation.config.tsx`:
1. Remove the `routes` parameter from the `defaultMenu` function signature
2. Hardcode the route path strings directly in the menu items (e.g., `routes.hosts` → `'/hosts'`, `routes.explorer` → `'/explorer'`, etc.)
3. Update the call site in `__root.tsx` to match the new two-argument signature: `defaultMenu(systemSettings!, enterprise)`

This must be done in the same step as creating `__root.tsx` since the root route calls `defaultMenu`.

- [ ] **Step 3: Create the router instance**

Create `src/router.tsx`:

```tsx
import { createRouter } from '@tanstack/react-router';

import { PageErrorFallback } from '@/common/design-system/atoms/error-boundary';
import { NotFound } from '@/common/design-system/layouts/components/404';
import { store } from '@/store/store';

import { routeTree } from './routeTree.gen';

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultErrorComponent: PageErrorFallback,
  defaultNotFoundComponent: NotFound,
  scrollRestoration: true,
  basepath: import.meta.env.BASE_URL || '/',
  context: { store },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/routes/__root.tsx src/router.tsx src/store/store.ts
git commit -m "feat: add TanStack Router root route and router instance"
```

---

### Task 3: Wire up App.tsx entry point

**Files:**
- Modify: `src/app/App.tsx`
- Delete: `src/app/root.tsx` (moved to `__root.tsx`)

- [ ] **Step 0: Migrate existing imports of store/persistor from App.tsx**

Search for any files importing `store` or `persistor` from `@/app/App`:

```bash
grep -r "from.*app/App" src/ --include="*.ts" --include="*.tsx" -l
```

Update any found imports to use `@/store/store` instead. The `store` and `persistor` singletons now live in `src/store/store.ts` (moved in Task 2).

- [ ] **Step 1: Update App.tsx**

Replace the content of `src/app/App.tsx`:

```tsx
import '../global.css';
import '@/common/design-system/molecules/htmlCodeDisplay/pygments.css';

import { RouterProvider } from '@tanstack/react-router';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v6';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { persistor, store } from '@/store/store';
import { router } from '@/router';

import { Toaster } from '../common/design-system/atoms/ui/sonner';
import { AppLoader, SystemSettings } from './app.loader';

function App() {
  return (
    <PersistGate
      loading={null}
      persistor={persistor}
    >
      <Provider store={store}>
        <SystemSettings>
          <AppLoader>
            <NuqsAdapter>
              <RouterProvider router={router} />
            </NuqsAdapter>
            <Toaster />
          </AppLoader>
        </SystemSettings>
      </Provider>
    </PersistGate>
  );
}

export default App;
```

**Important:** `NuqsAdapter` is kept because many non-hosts pages still use nuqs for search params. Remove it only after all pages have been migrated away from nuqs.

**Important:** Do NOT commit this file until after Chunk 2 (Task 9) — the route tree must be generated first. The `routeTree.gen.ts` file is auto-generated by the Vite plugin when route files exist. Committing App.tsx before creating route files will produce a broken build. Create this file but defer the commit.

- [ ] **Step 2: Delete the old root.tsx**

```bash
rm src/app/root.tsx
```

The Root component functionality is now in `src/routes/__root.tsx`.

- [ ] **Step 3: Do NOT commit yet**

Task 3 changes are committed together with Task 9 (after route tree generation is verified). The app cannot compile until `routeTree.gen.ts` exists, which requires the route files from Tasks 4–8.

---

## Chunk 2: File-Based Route Tree

### Task 4: Create enterprise layout and home route

**Files:**
- Create: `src/routes/index.tsx`
- Create: `src/routes/_enterprise.tsx`

- [ ] **Step 1: Create home/index route**

Create `src/routes/index.tsx`:

```tsx
import { createFileRoute } from '@tanstack/react-router';

import { Slash } from '@/common/design-system/layouts/components/slash';

export const Route = createFileRoute('/')({
  component: Slash,
});
```

- [ ] **Step 2: Create enterprise pathless layout**

Create `src/routes/_enterprise.tsx`:

```tsx
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { selectIsEnterprise } from '@/common/lib/use-feature-flags';

export const Route = createFileRoute('/_enterprise')({
  beforeLoad: ({ context }) => {
    const state = context.store.getState();
    const enterprise = selectIsEnterprise(state);
    if (!enterprise) {
      throw redirect({ to: '/explorer' });
    }
  },
  component: () => <Outlet />,
});
```

**Note:** `selectIsEnterprise` is currently inside `use-feature-flags.ts` as a hook. During implementation, check if there's a plain selector that can be used outside React. If not, extract the selector logic from the hook into a standalone selector that takes Redux state.

- [ ] **Step 3: Commit**

```bash
git add src/routes/index.tsx src/routes/_enterprise.tsx
git commit -m "feat: add home route and enterprise layout gate"
```

---

### Task 5: Create enterprise routes — hosts, operational-center, volumetry, attack-surface

**Files:**
- Create: `src/routes/_enterprise/operational-center.tsx`
- Create: `src/routes/_enterprise/volumetry.tsx`
- Create: `src/routes/_enterprise/hosts/index.tsx`
- Create: `src/routes/_enterprise/hosts/$hostId/route.tsx`
- Create: `src/routes/_enterprise/hosts/$hostId/index.tsx`
- Create: `src/routes/_enterprise/hosts/$hostId/incidents.tsx`
- Create: `src/routes/_enterprise/hosts/$hostId/detection-methods.tsx`
- Create: `src/routes/_enterprise/hosts/$hostId/beacons.tsx`
- Create: `src/routes/_enterprise/hosts/$hostId/sightings.tsx`
- Create: `src/routes/_enterprise/hosts/$hostId/timeline.tsx`
- Create: `src/routes/_enterprise/hosts/$hostId/outlier-events.tsx`
- Create: `src/routes/_enterprise/hosts/$hostId/detection-events.tsx`
- Create: `src/routes/_enterprise/attack-surface/route.tsx`
- Create: `src/routes/_enterprise/attack-surface/index.tsx`
- Create: `src/routes/_enterprise/attack-surface/inventory.tsx`

- [ ] **Step 1: Create simple enterprise routes**

Each route file follows the same pattern. Create the directory structure and files:

`src/routes/_enterprise/operational-center.tsx`:
```tsx
import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { OperationalCenter } from '@/pages/operational-center';

export const Route = createFileRoute('/_enterprise/operational-center')({
  component: () => (
    <PageBoundary key="operational-center">
      <OperationalCenter />
    </PageBoundary>
  ),
});
```

`src/routes/_enterprise/volumetry.tsx`:
```tsx
import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { VolumetryPage } from '@/pages/volumetry';

export const Route = createFileRoute('/_enterprise/volumetry')({
  component: () => (
    <PageBoundary key="volumetry">
      <VolumetryPage />
    </PageBoundary>
  ),
});
```

- [ ] **Step 2: Create hosts routes**

`src/routes/_enterprise/hosts/index.tsx` — this will be fully refactored in Chunk 4, for now wrap existing component:

```tsx
import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { HostsPage } from '@/pages/hosts';

export const Route = createFileRoute('/_enterprise/hosts/')({
  component: () => (
    <PageBoundary key="hosts">
      <HostsPage />
    </PageBoundary>
  ),
});
```

`src/routes/_enterprise/hosts/$hostId/route.tsx`:
```tsx
import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { HostDetails } from '@/pages/hosts/[hostId]';

export const Route = createFileRoute('/_enterprise/hosts/$hostId')({
  component: () => (
    <PageBoundary key="host-details">
      <HostDetails />
    </PageBoundary>
  ),
});
```

Create each child route under `$hostId/` following the same pattern — import the existing page component, wrap in PageBoundary. Examples:

`src/routes/_enterprise/hosts/$hostId/index.tsx`:
```tsx
import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { HostInsights } from '@/pages/hosts/[hostId]/insights';

export const Route = createFileRoute('/_enterprise/hosts/$hostId/')({
  component: () => (
    <PageBoundary key="host-insights">
      <HostInsights />
    </PageBoundary>
  ),
});
```

Repeat for: `incidents.tsx`, `detection-methods.tsx`, `beacons.tsx`, `sightings.tsx`, `timeline.tsx`, `outlier-events.tsx`, `detection-events.tsx`. Each imports from the corresponding `@/pages/hosts/[hostId]/...` path.

- [ ] **Step 3: Create attack-surface routes**

`src/routes/_enterprise/attack-surface/route.tsx`:
```tsx
import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { AttackSurface } from '@/pages/attack-surface';

export const Route = createFileRoute('/_enterprise/attack-surface')({
  component: () => (
    <PageBoundary key="attack-surface">
      <AttackSurface />
    </PageBoundary>
  ),
});
```

`src/routes/_enterprise/attack-surface/index.tsx`:
```tsx
import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { AttackSurfaceVisualisation } from '@/pages/attack-surface/visualisation';

export const Route = createFileRoute('/_enterprise/attack-surface/')({
  component: () => (
    <PageBoundary key="attack-surface-visualisation">
      <AttackSurfaceVisualisation />
    </PageBoundary>
  ),
});
```

`src/routes/_enterprise/attack-surface/inventory.tsx`:
```tsx
import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { AttackSurfaceInventory } from '@/pages/attack-surface/inventory';

export const Route = createFileRoute('/_enterprise/attack-surface/inventory')({
  component: () => (
    <PageBoundary key="attack-surface-inventory">
      <AttackSurfaceInventory />
    </PageBoundary>
  ),
});
```

- [ ] **Step 4: Commit**

```bash
git add src/routes/_enterprise/
git commit -m "feat: add enterprise route files (hosts, attack-surface, volumetry, op-center)"
```

---

### Task 6: Create threats and policy-violations route subtrees

**Files:**
- Create: `src/routes/_enterprise/threats/` (full subtree)
- Create: `src/routes/_enterprise/policy-violations/` (full subtree)

- [ ] **Step 1: Create threats routes**

`src/routes/_enterprise/threats/route.tsx` — breadcrumb layout:
```tsx
import { createFileRoute, Outlet } from '@tanstack/react-router';

import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';

export const Route = createFileRoute('/_enterprise/threats')({
  component: () => (
    <>
      <OutletBreadcrumb link="/threats/compromises">Threats</OutletBreadcrumb>
      <Outlet />
    </>
  ),
});
```

`src/routes/_enterprise/threats/index.tsx` — redirect:
```tsx
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_enterprise/threats/')({
  beforeLoad: () => {
    throw redirect({ to: '/threats/compromises/incidents' });
  },
});
```

Create the rest of the threats subtree following the same patterns from `src/pages/router.tsx`:
- `compromises/route.tsx` — tab wrapper layout (imports CompromisesPage)
- `compromises/index.tsx` — redirect to incidents
- `compromises/incidents.tsx`, `compromises/entities.tsx`, `compromises/graph.tsx`, `compromises/attack-flow.tsx`
- `timeline.tsx`
- `coverage/index.tsx` — coverage list page
- `coverage/threat/$threatId/route.tsx` — layout with breadcrumbs
- `coverage/threat/$threatId/index.tsx`, `events.tsx`, `detection-methods.tsx`
- `coverage/family/$familyId/route.tsx` — layout with breadcrumbs
- `coverage/family/$familyId/index.tsx`, `threats.tsx`, `events.tsx`, `detection-methods.tsx`

Each follows the pattern: `createFileRoute` + import existing page component + wrap in `PageBoundary`.

- [ ] **Step 2: Create policy-violations routes**

Mirror the threats structure for policy-violations:
- `route.tsx` — breadcrumb layout ("Compliance")
- `index.tsx` — redirect to violations
- `violations/route.tsx`, `violations/index.tsx`, `violations/graph.tsx`
- `coverage/index.tsx`
- `coverage/threat/$threatId/...` — same pattern as threats
- `coverage/family/$familyId/...` — same pattern as threats

- [ ] **Step 3: Commit**

```bash
git add src/routes/_enterprise/threats/ src/routes/_enterprise/policy-violations/
git commit -m "feat: add threats and policy-violations route subtrees"
```

---

### Task 7: Create analytics route subtree

**Files:**
- Create: `src/routes/_enterprise/analytics/` (full subtree)

- [ ] **Step 1: Create analytics routes**

`src/routes/_enterprise/analytics/route.tsx`:
```tsx
import { createFileRoute, Outlet } from '@tanstack/react-router';

import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';

export const Route = createFileRoute('/_enterprise/analytics')({
  component: () => (
    <>
      <OutletBreadcrumb link="/analytics">Analytics</OutletBreadcrumb>
      <Outlet />
    </>
  ),
});
```

`src/routes/_enterprise/analytics/index.tsx`:
```tsx
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_enterprise/analytics/')({
  beforeLoad: () => {
    throw redirect({ to: '/analytics/beaconing/ips' });
  },
});
```

Create beaconing and sightings subtrees:
- `beaconing/ips/index.tsx` — beaconing IPs list (wrap BeaconingPage + BeaconingIps)
- `beaconing/ips/$ip.tsx` — IP details
- `beaconing/ja3s/index.tsx` — beaconing JA3s list
- `beaconing/ja3s/$ja3s.tsx` — JA3 details
- `sightings/index.tsx` — sightings list
- `sightings/$sightingId.tsx` — sighting details

- [ ] **Step 2: Commit**

```bash
git add src/routes/_enterprise/analytics/
git commit -m "feat: add analytics route subtree"
```

---

### Task 8: Create non-enterprise routes

**Files:**
- Create: `src/routes/explorer.tsx`
- Create: `src/routes/events-flow.tsx`
- Create: `src/routes/detection-events/index.tsx`
- Create: `src/routes/detection-events/event.tsx`
- Create: `src/routes/detection-methods/index.tsx`
- Create: `src/routes/detection-methods/$detectionMethodId.tsx`
- Create: `src/routes/filters-actions.tsx`
- Create: `src/routes/investigations.tsx`
- Create: `src/routes/explore.tsx`
- Create: `src/routes/deeplink.tsx`
- Create: `src/routes/deeplinks.tsx`
- Create: `src/routes/share.tsx`
- Create: `src/routes/session-events.tsx`
- Create: `src/routes/filter-sets.tsx`
- Create: `src/routes/user-settings.tsx`

- [ ] **Step 1: Create all non-enterprise route files**

Each follows the same pattern. Example for `src/routes/explorer.tsx`:
```tsx
import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { Explorer } from '@/pages/explorer';

export const Route = createFileRoute('/explorer')({
  component: () => (
    <PageBoundary key="explorer">
      <Explorer />
    </PageBoundary>
  ),
});
```

For `detection-events/`, create a layout that wraps with breadcrumb + Outlet:

`src/routes/detection-events/index.tsx`:
```tsx
import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { Events } from '@/pages/events';

export const Route = createFileRoute('/detection-events/')({
  component: () => (
    <>
      <OutletBreadcrumb link="/detection-events">Events</OutletBreadcrumb>
      <PageBoundary key="events">
        <Events />
      </PageBoundary>
    </>
  ),
});
```

Repeat for all other non-enterprise routes, importing from existing `@/pages/...` components.

**Non-obvious import paths:**
- `src/routes/session-events.tsx` → import `TransactionsPage` from `@/pages/transactions` (not `@/pages/session-events`)
- `src/routes/filters-actions.tsx` → import `FiltersActionsList` from `@/pages/filter-actions` (not `@/pages/filters-actions`)
- `src/routes/events-flow.tsx` → import `EventsFlowPage` from `@/pages/events-flow`

**For `detection-events/`:** Create a shared layout with `route.tsx` for breadcrumb:

`src/routes/detection-events/route.tsx`:
```tsx
import { createFileRoute, Outlet } from '@tanstack/react-router';

import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';

export const Route = createFileRoute('/detection-events')({
  component: () => (
    <>
      <OutletBreadcrumb link="/detection-events">Events</OutletBreadcrumb>
      <Outlet />
    </>
  ),
});
```

Then `detection-events/index.tsx` renders just the Events page (no breadcrumb — it's in the layout), and `detection-events/event.tsx` also inherits the breadcrumb.

**Backward-compat redirects:** The old router had redirect routes for legacy paths (e.g., `/threats/incidents` → `/threats/compromises/incidents`). These are intentionally NOT ported per the spec. Do not create route files for old paths.

- [ ] **Step 2: Commit**

```bash
git add src/routes/explorer.tsx src/routes/events-flow.tsx src/routes/detection-events/ src/routes/detection-methods/ src/routes/filters-actions.tsx src/routes/investigations.tsx src/routes/explore.tsx src/routes/deeplink.tsx src/routes/deeplinks.tsx src/routes/share.tsx src/routes/session-events.tsx src/routes/filter-sets.tsx src/routes/user-settings.tsx
git commit -m "feat: add non-enterprise route files"
```

---

### Task 9: Verify route tree generates and app boots

- [ ] **Step 1: Start dev server and check for route tree generation**

```bash
pnpm dev
```

Expected: Vite starts, `src/routeTree.gen.ts` is auto-generated, no compilation errors. If there are missing route files or naming issues, the plugin will report them.

- [ ] **Step 2: Fix any route generation issues**

Common issues:
- Route path strings in `createFileRoute()` must exactly match what the plugin expects (based on file location)
- Pathless layouts use `_` prefix
- Dynamic segments use `$` prefix

- [ ] **Step 3: Commit everything (including deferred Task 3 changes)**

Now that the route tree generates correctly, commit the App.tsx wiring and all route files together:

```bash
git add src/app/App.tsx src/routes/ src/router.tsx
git rm src/app/root.tsx
git commit -m "feat: switch to TanStack Router with file-based routing"
```

---

## Chunk 3: Import Migration

### Task 10: Migrate design system components

**Files:**
- Modify: `src/common/design-system/molecules/breadcrumbs.tsx`
- Modify: `src/common/design-system/atoms/error-boundary.tsx`
- Modify: `src/common/design-system/layouts/components/404.tsx`
- Modify: `src/common/design-system/atoms/ui/pillTabs.tsx`
- Modify: `src/common/design-system/atoms/ui/breadcrumb.tsx`
- Modify: `src/common/design-system/atoms/external-link.tsx`
- Modify: `src/common/design-system/atoms/markdown.tsx`
- Modify: `src/common/design-system/layouts/components/navigation/app-sidebar.tsx`
- Modify: `src/common/design-system/layouts/components/header/share-button.tsx`
- Modify: `src/common/design-system/layouts/components/slash.tsx`
- Modify: `src/common/design-system/layouts/components/help-menu.tsx`
- Modify: `src/common/design-system/graphs/world-map/world-map.tsx`
- Modify: `src/common/lib/use-scroll-top.ts`

- [ ] **Step 1: Migrate breadcrumbs.tsx**

Replace:
```ts
import { Link, useResolvedPath } from 'react-router-dom';
```
With:
```ts
import { Link, useLocation } from '@tanstack/react-router';
```

In `OutletBreadcrumb`, replace:
```ts
const match = useResolvedPath('');
const href = link || match.pathname;
```
With:
```ts
const location = useLocation();
const href = link || location.pathname;
```

In the dropdown `Link` usage, TanStack Router's `Link` uses the same `to` prop. No change needed to the JSX.

- [ ] **Step 2: Migrate error-boundary.tsx**

Replace:
```ts
import { useNavigate } from 'react-router-dom';
```
With:
```ts
import { useRouter } from '@tanstack/react-router';
```

In `PageErrorFallback`, replace:
```ts
const navigate = useNavigate();
// ...
<Button onClick={() => navigate(-1)} variant="secondary">
```
With:
```ts
const router = useRouter();
// ...
<Button onClick={() => router.history.back()} variant="secondary">
```

- [ ] **Step 3: Migrate 404.tsx**

Replace:
```ts
import { useNavigate } from 'react-router-dom';
import { routes } from '../../../../pages/routes.config';
```
With:
```ts
import { useNavigate } from '@tanstack/react-router';
```

Replace:
```ts
const navigate = useNavigate();
// ...
<Button className="mt-2" onClick={() => navigate(routes.operational_center)}>
```
With:
```ts
const navigate = useNavigate();
// ...
<Button className="mt-2" onClick={() => navigate({ to: '/operational-center' })}>
```

- [ ] **Step 4: Migrate UI primitives**

For each file (`pillTabs.tsx`, `breadcrumb.tsx`, `external-link.tsx`, `markdown.tsx`):

Replace:
```ts
import { Link } from 'react-router-dom';
```
With:
```ts
import { Link } from '@tanstack/react-router';
```

**For pillTabs.tsx (`TabsTriggerLink`):** Check how the `Link` is used. If it uses `to={value}` where value is a string path, the TanStack Router `Link` works the same way.

- [ ] **Step 5: Migrate navigation and layout components**

For `app-sidebar.tsx`:
```ts
// Replace: import { Link, useLocation, useNavigate } from 'react-router-dom';
// With:
import { Link, useLocation, useNavigate } from '@tanstack/react-router';
```

For `useLocation()` usages that access `pathname`: TanStack Router's `useLocation()` also has `pathname`. No change needed.

For `useNavigate()` usages: TanStack Router's `navigate()` takes `{ to: '/path' }` instead of a bare string. Update all `navigate('/path')` to `navigate({ to: '/path' })`.

Repeat for: `share-button.tsx`, `slash.tsx`, `help-menu.tsx`, `world-map.tsx`, `use-scroll-top.ts`, `filters-side-bar.tsx`.

- [ ] **Step 6: Commit**

```bash
git add src/common/
git commit -m "refactor: migrate design system components from react-router to tanstack-router"
```

---

### Task 11: Migrate feature components

**Files:** ~35 files across `src/features/`

- [ ] **Step 1: Apply import replacements across all feature files**

Pattern for each file:

| Old Import | New Import |
|---|---|
| `import { useNavigate } from 'react-router-dom'` | `import { useNavigate } from '@tanstack/react-router'` |
| `import { useParams } from 'react-router-dom'` | `import { useParams } from '@tanstack/react-router'` |
| `import { Link } from 'react-router-dom'` | `import { Link } from '@tanstack/react-router'` |
| `import { Outlet } from 'react-router-dom'` | `import { Outlet } from '@tanstack/react-router'` |
| `import { useLocation } from 'react-router-dom'` | `import { useLocation } from '@tanstack/react-router'` |

**API changes to apply:**

1. **`navigate(path)`** → **`navigate({ to: path })`**
   - e.g., `navigate('/hosts/123')` → `navigate({ to: '/hosts/$hostId', params: { hostId: '123' } })`
   - For simple string concatenation like `navigate(\`${routes.hosts}/${ip}\`)`, use `navigate({ to: '/hosts/$hostId', params: { hostId: ip } })`

2. **`useParams()`** → **`useParams({ strict: false })`**
   - For feature components that don't know their exact route, use `strict: false` to get all params without type narrowing.
   - Type assertion may be needed: `const { hostId } = useParams({ strict: false }) as { hostId: string }`

3. **`useLocation().pathname`** — works the same, no change needed.

4. **`useLocation().search`** — In react-router-dom this is a raw query string. In TanStack Router, `useLocation().search` is the parsed search object. If raw query string is needed, use `useLocation().searchStr` or `window.location.search`. Most cases should use `Route.useSearch()` instead for type-safe access.

5. **`routes.xxx`** references from `routes.config.ts` → hardcoded string paths (e.g., `routes.hosts` → `'/hosts'`). These will be type-checked by the router's registered types.

Files to migrate (grouped by feature):
- `features/analytics/beaconing/components/` — 2 files (useNavigate)
- `features/analytics/hosts/components/hostsTable/` — 2 files (useNavigate)
- `features/hunt/timeline/` — 1 file (useNavigate)
- `features/hunt/operational-center/` — 2 files (useNavigate)
- `features/hunt/killchain/` — 2 files (useNavigate)
- `features/hunt/threats/` — 8 files (useParams, useNavigate, Outlet, useLocation, Link)
- `features/hunt/entities/` — 1 file (Link, useNavigate)
- `features/hunt/events/` — 1 file (useNavigate)
- `features/hunt/filtering/` — 5 files (useLocation, Link, useNavigate)
- `features/hunt/filter-actions/` — 4 files (useNavigate)
- `features/marketing/` — 1 file (Link)

- [ ] **Step 2: Commit**

```bash
git add src/features/
git commit -m "refactor: migrate feature components from react-router to tanstack-router"
```

---

### Task 12: Migrate page components

**Files:** ~30 files across `src/pages/`

- [ ] **Step 1: Apply import replacements across all page files**

Same patterns as Task 11. Key page files:

- `pages/hosts/[hostId]/index.tsx` — uses Link, Outlet, useLocation, useParams
- `pages/threats/index.tsx` — uses Outlet, useLocation
- `pages/threats/compromises/index.tsx` — uses Outlet, useLocation
- `pages/policy-violations/` — uses Outlet, useLocation
- `pages/attack-surface/index.tsx` — uses Link, Outlet, useLocation
- `pages/analytics/` — uses Link, useLocation, useNavigate, useParams
- `pages/deeplink/index.tsx` — uses Navigate, useLocation
- `pages/share/index.tsx` — uses useLocation, useNavigate
- All `[hostId]` subpages — use useParams

**For `Navigate` component** (used in `deeplink/index.tsx`):
```ts
// Replace: import { Navigate } from 'react-router-dom';
// With: import { Navigate } from '@tanstack/react-router';
```

TanStack Router exports a `Navigate` component. Check its API — it may use `to` as an object rather than a string.

- [ ] **Step 2: Remove references to `routes.config.ts`**

Any file importing from `@/pages/routes.config` needs to be updated. Replace `routes.xxx` with hardcoded path strings. These will be type-checked by TanStack Router's registered type.

- [ ] **Step 3: Commit**

```bash
git add src/pages/
git commit -m "refactor: migrate page components from react-router to tanstack-router"
```

---

### Task 13: Create test utility and migrate test files

**Files:**
- Create: `src/common/test-utils/render-with-router.tsx`
- Modify: 14 test files that use `MemoryRouter`

- [ ] **Step 1: Create test router wrapper**

Create `src/common/test-utils/render-with-router.tsx`:

```tsx
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';

import { setupStore } from '@/store/store';

type RenderWithRouterOptions = {
  initialPath?: string;
  preloadedState?: Parameters<typeof setupStore>[0];
};

export function renderWithRouter(
  ui: React.ReactNode,
  options: RenderWithRouterOptions = {},
) {
  const { initialPath = '/', preloadedState } = options;

  const rootRoute = createRootRoute({
    component: () => <Outlet />,
  });

  const testRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <>{ui}</>,
  });

  const routeTree = rootRoute.addChildren([testRoute]);

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });

  const store = setupStore(preloadedState);

  return render(
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>,
  );
}
```

- [ ] **Step 2: Migrate test files**

For each test file that uses `MemoryRouter`:

Replace patterns like:
```tsx
import { MemoryRouter } from 'react-router-dom';

render(
  <Provider store={store}>
    <MemoryRouter>
      <Component />
    </MemoryRouter>
  </Provider>
);
```

With:
```tsx
import { renderWithRouter } from '@/common/test-utils/render-with-router';

renderWithRouter(<Component />);
```

Test files to migrate (14 files):
- `src/pages/volumetry/index.test.tsx`
- `src/pages/threats/incidents/index.test.tsx`
- `src/pages/filter-sets/index.test.tsx`
- `src/pages/share/share.test.tsx`
- `src/pages/hosts/host-details.test.tsx`
- `src/pages/deeplink/deeplink.test.tsx`
- `src/common/design-system/layouts/components/header/header.test.tsx`
- `src/common/design-system/layouts/components/header/share-button.test.tsx`
- `src/features/analytics/beaconing/components/ips-table/beaconing-ips-table.test.tsx`
- `src/features/analytics/beaconing/components/ips-serving-ja3s-table/ips-serving-ja3s-table.test.tsx`
- `src/features/hunt/killchain/components/killchain-counters/killchain-counters.test.tsx`
- `src/features/hunt/threats/components/coverage-block/coverage-block.test.tsx`
- `src/features/hunt/filtering/query-filters/components/event-value/event-value.test.tsx`

For test files that use `Route` and `Routes` from react-router-dom (e.g., `deeplink.test.tsx`, `host-details.test.tsx`), these need more careful migration — create appropriate test routes using TanStack Router's `createRoute`.

- [ ] **Step 3: Commit**

```bash
git add src/common/test-utils/ src/pages/**/*.test.* src/features/**/*.test.* src/common/**/*.test.*
git commit -m "refactor: migrate test files from MemoryRouter to TanStack Router"
```

---

### Task 14: Remove react-router-dom and old router files

**Files:**
- Delete: `src/pages/router.tsx`
- Delete: `src/pages/routes.config.ts`
- Modify: `package.json` (remove react-router-dom)

- [ ] **Step 1: Delete old router files**

```bash
rm src/pages/router.tsx src/pages/routes.config.ts
```

- [ ] **Step 2: Search for any remaining react-router-dom imports**

```bash
grep -r "react-router-dom" src/ --include="*.ts" --include="*.tsx" -l
```

Expected: no results. If any remain, migrate them.

- [ ] **Step 3: Remove react-router-dom dependency**

```bash
pnpm remove react-router-dom
```

- [ ] **Step 4: Run type check**

```bash
pnpm run check
```

Expected: no TypeScript errors. Fix any that appear.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove react-router-dom and old router files"
```

---

## Chunk 4: Hosts Page Refactoring

### Task 15: Rewrite useServerTableState for TanStack Router

**Files:**
- Modify: `src/common/design-system/molecules/data-table/hooks/use-server-table-state.ts`
- Modify: `src/common/design-system/molecules/data-table/hooks/sorting-parser.ts`

- [ ] **Step 1: Update sorting-parser to remove nuqs dependency**

Rewrite `src/common/design-system/molecules/data-table/hooks/sorting-parser.ts`:

```ts
import type { SortingState } from '@tanstack/react-table';

export const serializeSorting = (sorting: SortingState): string | undefined => {
  if (sorting.length === 0) return undefined;
  return sorting.map(({ id, desc }) => `${desc ? '-' : ''}${id}`).join(',');
};

export const parseSorting = (value: string | undefined): SortingState => {
  if (!value) return [];
  return value.split(',').map((v) => {
    const desc = v[0] === '-';
    const id = desc ? v.slice(1) : v;
    return { id, desc };
  });
};
```

- [ ] **Step 2: Rewrite useServerTableState**

Rewrite `src/common/design-system/molecules/data-table/hooks/use-server-table-state.ts`:

```ts
import type {
  OnChangeFn,
  PaginationState,
  SortingState,
  Updater,
} from '@tanstack/react-table';
import { useCallback, useMemo, useRef } from 'react';

import { parseSorting, serializeSorting } from './sorting-parser';

export type PaginationSearch = {
  page: number;
  page_size: number;
  sort?: string;
};

export type ServerTableState<TParams> = {
  queryParams: TParams & {
    pageIndex: number;
    pageSize: number;
    ordering?: string;
  };
  pagination: PaginationState;
  setPagination: (updater: Updater<PaginationState>) => void;
  sorting: SortingState;
  setSorting: OnChangeFn<SortingState>;
};

export function useServerTableState<
  TSearch extends PaginationSearch,
  TParams extends Record<string, unknown>,
>(
  search: TSearch,
  params: TParams,
  navigate: (opts: { search: (prev: TSearch) => TSearch }) => void,
): ServerTableState<TParams> {
  const { page, page_size, sort } = search;
  const sorting = parseSorting(sort);
  const ordering = serializeSorting(sorting);

  // --- Page reset on param change ---
  const prevParamsRef = useRef(params);
  const prevOrderingRef = useRef(ordering);

  const paramsChanged = !shallowEqual(prevParamsRef.current, params);
  const orderingChanged = prevOrderingRef.current !== ordering;
  const shouldReset = (paramsChanged || orderingChanged) && page !== 1;

  if (paramsChanged) {
    prevParamsRef.current = params;
  }
  if (orderingChanged) {
    prevOrderingRef.current = ordering;
  }
  if (shouldReset) {
    navigate({ search: (prev) => ({ ...prev, page: 1 }) });
  }

  const effectivePage = shouldReset ? 1 : page;

  // --- Handlers ---
  const handlePaginationUpdate = useCallback(
    (updater: Updater<PaginationState>) => {
      const prev = { pageIndex: effectivePage - 1, pageSize: page_size };
      const next = typeof updater === 'function' ? updater(prev) : updater;
      navigate({
        search: (s) => ({
          ...s,
          page: next.pageIndex + 1,
          page_size: next.pageSize,
        }),
      });
    },
    [effectivePage, page_size, navigate],
  );

  const handleSortingUpdate: OnChangeFn<SortingState> = useCallback(
    (updater) => {
      const prev = sorting;
      const next = typeof updater === 'function' ? updater(prev) : updater;
      navigate({
        search: (s) => ({ ...s, sort: serializeSorting(next) }),
      });
    },
    [sorting, navigate],
  );

  const pagination = useMemo(
    () => ({ pageIndex: effectivePage - 1, pageSize: page_size }),
    [effectivePage, page_size],
  );

  const queryParams = useMemo(
    () => ({
      ...params,
      pageIndex: effectivePage - 1,
      pageSize: page_size,
      ...(ordering !== undefined && { ordering }),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectivePage, page_size, ordering, paramsChanged],
  ) as TParams & { pageIndex: number; pageSize: number; ordering?: string };

  return useMemo(
    () => ({
      queryParams,
      pagination,
      setPagination: handlePaginationUpdate,
      sorting,
      setSorting: handleSortingUpdate,
    }),
    [queryParams, pagination, handlePaginationUpdate, sorting, handleSortingUpdate],
  );
}

// --- Internal utilities ---

function shallowEqual(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => Object.is(a[key], b[key]));
}
```

- [ ] **Step 3: Audit for other `parseAsSorting` consumers**

```bash
grep -r "parseAsSorting" src/ --include="*.ts" --include="*.tsx" -l
```

Update any remaining importers to use `parseSorting` instead. Check `sorting-parser.test.ts` if it exists — update it to test the new `parseSorting` and `serializeSorting` functions (no nuqs dependency).

- [ ] **Step 4: Rewrite useServerTableState tests**

The test file `src/common/design-system/molecules/data-table/hooks/use-server-table-state.test.ts` tests the old nuqs-based API: `useServerTableState({ tenant: 1 })` with a nuqs adapter wrapper. Rewrite all tests for the new three-argument API `(search, params, navigate)`:

- Remove nuqs adapter wrapper from test setup
- Mock `navigate` as a `vi.fn()`
- Provide `search` object with `{ page: 1, page_size: 10 }` and `params` as separate arguments
- Test page-reset-on-param-change by changing the `params` argument across renders
- Test pagination handler calls `navigate` with correct search updater
- Test sorting handler calls `navigate` with correct sort serialization

- [ ] **Step 5: Commit**

```bash
git add src/common/design-system/molecules/data-table/hooks/
git commit -m "refactor: rewrite useServerTableState for TanStack Router search params"
```

---

### Task 16: Extract hosts table column definitions

**Files:**
- Modify: `src/features/analytics/hosts/components/hostsTable/hostsTable.columns.tsx`

- [ ] **Step 1: Read the existing columns file**

Read `src/features/analytics/hosts/components/hostsTable/hostsTable.columns.tsx` to understand the current column definitions and the `CustomColumnDef` type used.

- [ ] **Step 2: Refactor columns as individual named exports**

Transform the existing columns array into individual named exports. The exact code depends on what's currently in the file, but the pattern is:

```ts
// Before: export const columns: CustomColumnDef<Host>[] = [{ id: 'hostname', ... }, ...]
// After:

export const hostnameColumn: CustomColumnDef<Host> = { id: 'hostname', ... };
export const ipColumn: CustomColumnDef<Host> = { id: 'ip', ... };
export const servicesColumn: CustomColumnDef<Host> = { id: 'services', ... };
export const lastSeenColumn: CustomColumnDef<Host> = { id: 'last_seen', ... };
export const hitsColumn: CustomColumnDef<Host> = { id: 'hits', ... };
export const roleColumn: CustomColumnDef<Host> = { id: 'role', ... };
// ... etc

// Convenience array (without hitsColumn — added conditionally by route)
export const hostsBaseColumns: CustomColumnDef<Host>[] = [
  hostnameColumn,
  ipColumn,
  servicesColumn,
  lastSeenColumn,
  roleColumn,
  // ... all columns except hits
];

// Keep export columns for backwards compatibility during migration
export const columns = hostsBaseColumns;
```

Also refactor `exportColumns` the same way.

- [ ] **Step 3: Commit**

```bash
git add src/features/analytics/hosts/components/hostsTable/hostsTable.columns.tsx
git commit -m "refactor: extract hosts table columns as individual named exports"
```

---

### Task 17: Refactor hosts route as orchestrator

**Files:**
- Modify: `src/routes/_enterprise/hosts/index.tsx`
- Modify: `src/features/analytics/hosts/components/hostsTable/hostsTable.tsx`
- Modify: `src/features/analytics/hosts/components/home-net-picker/home-net-picker.tsx`
- Modify: `src/pages/hosts/index.tsx` (may become unused)

- [ ] **Step 1: Update the hosts route with search params**

Rewrite `src/routes/_enterprise/hosts/index.tsx`:

```tsx
import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

import { DefaultPage } from '@/common/design-system/atoms/default-page';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { useServerTableState } from '@/common/design-system/molecules/data-table/hooks/use-server-table-state';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useQFBuilder } from '@/features/hunt/filtering/query-filters/hooks/use-qf-builder';
import { getFilterExtension } from '@/features/analytics/hosts/api/hooks/useHostsList';
import { useGetHostsQuery } from '@/features/analytics/hosts/api/hosts.api';
import { DiscoveredHosts } from '@/features/analytics/hosts/components/discovered-hosts/discovered-hosts';
import { HomeNetPicker } from '@/features/analytics/hosts/components/home-net-picker/home-net-picker';
import {
  hostsBaseColumns,
  hitsColumn,
  exportColumns,
} from '@/features/analytics/hosts/components/hostsTable/hostsTable.columns';
import { HostsTable } from '@/features/analytics/hosts/components/hostsTable/hostsTable';

const hostsSearchSchema = z.object({
  page: z.number().min(1).catch(1),
  page_size: z.number().min(1).catch(10),
  sort: z.string().optional(),
  with_alerts: z.boolean().catch(true),
  in_home_net: z.enum(['true', 'false', 'all']).catch('all'),
});

export const Route = createFileRoute('/_enterprise/hosts/')({
  validateSearch: zodValidator(hostsSearchSchema),
  component: HostsRoute,
});

function HostsRoute() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const QFBuilder = useQFBuilder();
  const globalParams = useGlobalQueryParams(
    ['tenant', 'dates', 'qfilter', 'qfilterHost'],
    { extendQfilter: getFilterExtension(QFBuilder, search.in_home_net) },
  );

  const apiParams = {
    tenant: globalParams.tenant,
    start_date: globalParams.start_date,
    end_date: globalParams.end_date,
    host_id_qfilter: globalParams.host_id_qfilter,
    qfilter: search.with_alerts ? globalParams.qfilter : undefined,
    withAlerts: search.with_alerts,
    discovery: search.with_alerts ? globalParams.discovery : undefined,
    alert: search.with_alerts ? globalParams.alert : undefined,
    stamus: search.with_alerts ? globalParams.stamus : undefined,
  };

  const { queryParams, pagination, setPagination, sorting, setSorting } =
    useServerTableState(search, apiParams, navigate);

  const { data, isFetching } = useGetHostsQuery({
    ...queryParams,
    ordering:
      queryParams.ordering ??
      (search.with_alerts ? '-hits' : '-host_id.last_seen'),
  });

  const columns = search.with_alerts
    ? [...hostsBaseColumns, hitsColumn]
    : hostsBaseColumns;

  const filteredExportColumns = exportColumns.filter((col) =>
    search.with_alerts ? true : col.label !== 'Hits',
  );

  return (
    <>
      <OutletBreadcrumb link="/hosts">Hosts</OutletBreadcrumb>
      <DefaultPage
        title="Hosts"
        actions={
          <HomeNetPicker
            value={search.in_home_net}
            onChange={(value) =>
              navigate({ search: (prev) => ({ ...prev, in_home_net: value, page: 1 }) })
            }
          />
        }
        description="Gain deep visibility into network assets, enriched with live host indicators and actionable insights."
      >
        <DiscoveredHosts />
        <HostsTable
          data={data}
          isLoading={isFetching}
          columns={columns}
          exportColumns={filteredExportColumns}
          pagination={pagination}
          onPaginationChange={setPagination}
          sorting={sorting}
          onSortingChange={setSorting}
          withAlerts={search.with_alerts}
          onWithAlertsChange={(value) =>
            navigate({ search: (prev) => ({ ...prev, with_alerts: value, page: 1 }) })
          }
        />
      </DefaultPage>
    </>
  );
}
```

- [ ] **Step 2: Make HostsTable presentational**

Rewrite `src/features/analytics/hosts/components/hostsTable/hostsTable.tsx` to accept data and state as props. It still owns `useTablePreferences`, `HostsTableExpandedRow`, `HostValuesSort`, toolbar, and empty state internally:

```tsx
import type { CustomColumnDef } from '@/common/design-system/molecules/data-table/data-table';
import type {
  OnChangeFn,
  PaginationState,
  SortingState,
  Updater,
} from '@tanstack/react-table';
import { LaptopMinimal } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

import { DataTableToolbar } from '@/common/design-system/molecules/data-table/data-table.toolbar';
import { DataTable } from '@/common/design-system/molecules/data-table/data-table';
import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { SwitchFilter } from '@/common/design-system/molecules/data-table/filters/switch-filter';
import { useTablePreferences } from '@/common/design-system/molecules/data-table/hooks/use-table-preferences';

import { HostValuesSort } from '../host-insights/host-values-sort';
import { HostsTableExpandedRow } from './hostsTable.expandedRow';

type ExportColumn = { label: string; key: string };

type HostsTableProps = {
  data: unknown; // Use actual HostsResponse type
  isLoading: boolean;
  columns: CustomColumnDef<unknown>[]; // Use actual Host type
  exportColumns: ExportColumn[];
  pagination: PaginationState;
  onPaginationChange: (updater: Updater<PaginationState>) => void;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  withAlerts: boolean;
  onWithAlertsChange: (value: boolean) => void;
};

export const HostsTable = ({
  data,
  isLoading,
  columns,
  exportColumns,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  withAlerts,
  onWithAlertsChange,
}: HostsTableProps) => {
  const {
    columnOrder,
    onColumnOrderChange,
    columnVisibility,
    onColumnVisibilityChange,
    canReset,
    onClickReset,
  } = useTablePreferences({
    tableId: 'hostsTable',
    columns,
  });
  const navigate = useNavigate();

  return (
    <DataTable
      data={data}
      isLoading={isLoading}
      columns={columns}
      ExpandedRow={HostsTableExpandedRow}
      onRowClick={(row) =>
        navigate({ to: '/hosts/$hostId', params: { hostId: row.original.ip } })
      }
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      sorting={sorting}
      onSortingChange={onSortingChange}
      toolBar={
        <DataTableToolbar>
          <SwitchFilter
            title="Apply event filters"
            setValue={onWithAlertsChange}
            value={withAlerts}
          />
          <div className="ml-2">
            <HostValuesSort />
          </div>
        </DataTableToolbar>
      }
      exportColumns={exportColumns}
      columnOrder={columnOrder}
      onColumnOrderChange={onColumnOrderChange}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={onColumnVisibilityChange}
      canReset={canReset}
      onClickReset={onClickReset}
      Empty={<DataTableEmpty Icon={LaptopMinimal} entity="hosts" />}
    />
  );
};
```

**Note:** The actual types (`Host`, `HostsResponse`, `CustomColumnDef`) should be imported from their real locations during implementation. The `unknown` types above are placeholders.

- [ ] **Step 3: Make HomeNetPicker accept value/onChange props**

Rewrite `src/features/analytics/hosts/components/home-net-picker/home-net-picker.tsx`:

```tsx
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/pillTabs';

type HomeNetPickerProps = {
  value: 'true' | 'false' | 'all';
  onChange: (value: 'true' | 'false' | 'all') => void;
};

export const HomeNetPicker = ({ value, onChange }: HomeNetPickerProps) => {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => onChange(v as 'true' | 'false' | 'all')}
    >
      <TabsList>
        <TabsTrigger value="true">Internal</TabsTrigger>
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="false">External</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
```

- [ ] **Step 4: Commit**

```bash
git add src/routes/_enterprise/hosts/index.tsx src/features/analytics/hosts/components/hostsTable/hostsTable.tsx src/features/analytics/hosts/components/home-net-picker/home-net-picker.tsx
git commit -m "feat: refactor hosts page as route orchestrator with search params"
```

---

### Task 18: Clean up dead code

**Files:**
- Delete: `src/pages/hosts/hosts-page-state.slice.ts`
- Modify: `src/store/store.ts` (remove hostsPageStateSlice)
- Delete: `src/features/analytics/hosts/components/hostsTable/use-with-alerts-param.ts`
- Delete: `src/features/analytics/hosts/components/home-net-picker/use-home-net-param.ts`
- Delete: `src/common/design-system/molecules/data-table/hooks/use-pagination.ts` (old nuqs hook)
- Delete: `src/common/design-system/molecules/data-table/hooks/use-sorting.ts` (old nuqs hook)

- [ ] **Step 1: Remove hostsPageStateSlice from store**

In `src/store/store.ts`, remove:
```ts
import { hostsPageStateSlice } from '@/pages/hosts/hosts-page-state.slice';
```

And remove from `pages` combineReducers:
```ts
pages: combineReducers({
  explorer: dashboardPageStateSlice.reducer,
  // hosts: hostsPageStateSlice.reducer,  ← REMOVE
}),
```

- [ ] **Step 2: Delete dead files**

```bash
rm src/pages/hosts/hosts-page-state.slice.ts
rm src/features/analytics/hosts/components/hostsTable/use-with-alerts-param.ts
rm src/features/analytics/hosts/components/home-net-picker/use-home-net-param.ts
```

Also check if `use-pagination.ts` and `use-sorting.ts` are still used by other tables. If only hosts used them, delete. If other tables still use them, keep for now.

- [ ] **Step 3: Search for remaining references to deleted files**

```bash
grep -r "use-with-alerts-param\|use-home-net-param\|hosts-page-state" src/ --include="*.ts" --include="*.tsx" -l
```

Fix any remaining imports.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove dead code from hosts page migration"
```

---

## Chunk 5: Verification

### Task 19: Run all quality checks

- [ ] **Step 1: Run linter**

```bash
pnpm run lint --fix
```

Expected: no errors. Fix any that appear.

- [ ] **Step 2: Run type checker**

```bash
pnpm run check
```

Expected: no TypeScript errors. Common issues:
- Missing type imports for TanStack Router
- `navigate()` call signature changes not caught
- `useParams` return type changes

- [ ] **Step 3: Run tests**

```bash
pnpm run test:ci
```

Expected: all tests pass. Fix any failures from the migration.

- [ ] **Step 4: Manual smoke test**

Start dev server and verify:
- Home page loads
- Enterprise routes gate correctly
- Hosts page loads with search params in URL
- Pagination updates URL
- Sorting updates URL
- Changing `with_alerts` or `in_home_net` resets page to 1
- Browser back/forward works
- Breadcrumbs display correctly
- Navigation sidebar works

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: fix lint and type errors from migration"
```

---

## Appendix: Navigation Config Migration Note

The `defaultMenu()` function in `navigation.config.tsx` currently receives the `routes` object from `routes.config.ts`. After removing `routes.config.ts`, this function needs updating. Options:
1. Hardcode the route path strings directly in the menu config
2. Import route paths from the generated route tree

This should be handled during Task 10 (design system migration) when migrating `app-sidebar.tsx`.

## Appendix: Files Referencing `routes.config.ts`

Search for `import.*routes.config` before deleting. Known importers:
- `src/pages/router.tsx` (being deleted)
- `src/app/root.tsx` (being deleted)
- `src/common/design-system/layouts/components/404.tsx` (migrated in Task 10)
- `src/common/design-system/layouts/components/navigation/navigation.config.tsx` (migrated in Task 10)
- Various page and feature components that reference `routes.xxx` for navigation

All must be updated to use hardcoded path strings before `routes.config.ts` can be deleted.
