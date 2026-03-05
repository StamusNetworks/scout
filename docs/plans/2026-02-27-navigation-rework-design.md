# Navigation Rework Design

## Overview

Replace the custom `Navigation` component with the shadcn `Sidebar` component. Restructure routing so that several tab-based pages become independent pages accessible via collapsible sidebar submenus.

## Sidebar Component

Replace `Navigation` with shadcn `Sidebar` (already installed at `sidebar.tsx`).

### Layout

```
<SidebarProvider>
  <AppSidebar />
  <SidebarInset>
    <Header />
    <Outlet />
    <FiltersSideBar />
  </SidebarInset>
</SidebarProvider>
```

### Sidebar Structure

- **Header**: Logo + Tenant selector (collapsed: icon only)
- **Content**: 4 `SidebarGroup` sections — Security Posture, Hunting & Investigation, Settings, Apps
- **Footer**: User profile + logout
- **Collapsible**: `icon` mode (collapses to icon rail, expands to full sidebar)
- **Keyboard shortcut**: Ctrl/Cmd+B (shadcn default)

### Collapsible Submenus

Items with children render as `Collapsible` + `SidebarMenuSub`:
- Threats → Compromises, Timeline, Coverage
- Policy Violations → Policy Violations, Coverage
- Analytics → Beaconing, Sightings

All other items are flat `SidebarMenuButton` links.

## Route Restructuring

### Threats

Previously 6 tabs under `/threats`. Now:

| Nav item | Route | Tabs |
|----------|-------|------|
| Compromises | `/threats/compromises` (→ `/threats/compromises/incidents`) | Incidents, Entities, Graph, Attack Flow |
| Timeline | `/threats/timeline` | None (standalone page) |
| Coverage | `/threats/coverage` | None (standalone page, keeps family/threat sub-routes) |

### Policy Violations

Previously 3 tabs under `/policy-violations`. Now:

| Nav item | Route | Tabs |
|----------|-------|------|
| Policy Violations | `/policy-violations/violations` (→ entities) | Entities, Graph |
| Coverage | `/policy-violations/coverage` | None (standalone page, keeps family/threat sub-routes) |

### Analytics

Previously 3 tabs under `/analytics`. Now:

| Nav item | Route | Tabs |
|----------|-------|------|
| Beaconing | `/analytics/beaconing` (→ `/analytics/beaconing/ips`) | IPs, JA3s |
| Sightings | `/analytics/sightings` | None (standalone page) |

### Redirects

| Old route | New route |
|-----------|-----------|
| `/threats` | `/threats/compromises/incidents` |
| `/threats/incidents` | `/threats/compromises/incidents` |
| `/threats/entities` | `/threats/compromises/entities` |
| `/threats/entities-graph` | `/threats/compromises/graph` |
| `/threats/attack-flow` | `/threats/compromises/attack-flow` |
| `/policy-violations` | `/policy-violations/violations` |
| `/policy-violations/entities-graph` | `/policy-violations/violations/graph` |
| `/analytics` | `/analytics/beaconing/ips` |
| `/analytics/beaconing-ips` | `/analytics/beaconing/ips` |
| `/analytics/beaconing-ja3s` | `/analytics/beaconing/ja3s` |

## Navigation Config Data Model

```ts
type NavItem = {
  key: string;
  title: string;
  icon?: React.ReactNode;
  url: string;
  type: 'link' | 'external';
  enterprise?: boolean;
  beta?: boolean;
  children?: NavItem[];
};

type NavGroup = {
  label: string;
  enterprise?: boolean;
  children: NavItem[];
};
```

## Standalone Page Layout

New standalone pages (Timeline, Coverage, Sightings) use composable `Page` primitives:

```tsx
<Page>
  <OutletBreadcrumb>Page Title</OutletBreadcrumb>
  <TogglePageContainer>
    <PageHeader>
      <PageHeaderContent>
        <PageTitle>Page Title</PageTitle>
        <PageDescription>...</PageDescription>
      </PageHeaderContent>
    </PageHeader>
    {/* page content */}
  </TogglePageContainer>
</Page>
```

No `DefaultPage` wrapper for these promoted pages.

## Files Changed

### New files
- `src/common/design-system/layouts/components/navigation/app-sidebar.tsx`
- `src/pages/threats/compromises/index.tsx`
- `src/pages/policy-violations/violations/index.tsx`
- `src/pages/analytics/beaconing/index.tsx`

### Modified files
- `src/pages/routes.config.ts` — new route constants
- `src/pages/router.tsx` — restructured route tree + backward-compat redirects
- `src/app/root.tsx` — SidebarProvider + AppSidebar + SidebarInset
- `src/common/design-system/layouts/components/navigation/navigation.config.tsx` — new data model with children
- `src/pages/threats/timeline.tsx` — standalone Page layout
- `src/pages/threats/coverage/index.tsx` — standalone Page layout
- `src/pages/policy-violations/coverage/index.tsx` — standalone Page layout
- `src/pages/analytics/sightings/index.tsx` — standalone Page layout
- `src/features/ui/ui-state.slice.ts` — remove isNavigationOpen

### Deleted
- `src/pages/threats/index.tsx` (replaced by compromises page)
- `src/pages/policy-violations/index.tsx` (replaced by violations page)
- `src/pages/analytics/analytics.tsx` (replaced by beaconing page)
- `src/common/design-system/layouts/components/navigation/navigation.tsx` (old nav)
