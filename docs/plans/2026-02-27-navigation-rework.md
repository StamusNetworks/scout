# Navigation Rework Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the custom Navigation component with shadcn Sidebar and restructure tab-based pages into independent sidebar submenu pages.

**Architecture:** The shadcn `Sidebar` component (already installed at `sidebar.tsx`) replaces the custom `Navigation`. Route structure changes from nested tabs to flat standalone pages for Timeline, Coverage, and Sightings. New wrapper pages (Compromises, Violations, Beaconing) hold the remaining tabs. Collapsible sidebar submenus map to these page groups.

**Tech Stack:** React, react-router-dom v6, shadcn sidebar, Radix UI Collapsible, Tailwind CSS, Redux Toolkit

---

### Task 1: Update route constants

**Files:**
- Modify: `src/pages/routes.config.ts`

**Step 1: Add new route constants**

Add the new routes for the restructured pages. Keep old routes for backward-compat redirects.

```ts
// Add these new routes to the routes object:

// Threats - Compromises (new wrapper)
threats_compromises: '/threats/compromises',
threats_compromises_incidents: '/threats/compromises/incidents',
threats_compromises_entities: '/threats/compromises/entities',
threats_compromises_graph: '/threats/compromises/graph',
threats_compromises_attack_flow: '/threats/compromises/attack-flow',

// Policy Violations - Violations (new wrapper)
policy_violations_violations: '/policy-violations/violations',
policy_violations_violations_graph: '/policy-violations/violations/graph',

// Analytics - Beaconing (new wrapper)
analytics_beaconing: '/analytics/beaconing',
analytics_beaconing_ips: '/analytics/beaconing/ips',
analytics_beaconing_ips_details: '/analytics/beaconing/ips/:ip',
analytics_beaconing_ja3s: '/analytics/beaconing/ja3s',
analytics_beaconing_ja3s_details: '/analytics/beaconing/ja3s/:ja3s',
```

Keep all existing route constants (they'll be used for redirects).

**Step 2: Run type check**

Run: `pnpm run check`
Expected: PASS (new constants don't break anything yet)

**Step 3: Commit**

```
feat: add new route constants for navigation restructure
```

---

### Task 2: Create the Compromises page (Threats tab wrapper)

**Files:**
- Create: `src/pages/threats/compromises/index.tsx`

**Step 1: Create the Compromises page**

This replaces the old `ThreatsPage` as the tab wrapper, keeping only Incidents, Entities, Graph, and Attack Flow tabs.

```tsx
import { Outlet, useLocation } from 'react-router-dom';

import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from '@/common/design-system/atoms/page';
import {
  Tabs,
  TabsList,
  TabsTriggerLink,
} from '@/common/design-system/atoms/ui/pillTabs';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { TogglePageContainer } from '@/common/design-system/molecules/toggle-container';
import { IndicatorsDoc } from '@/features/hunt/operational-center/components/indicators/docdopv.indicators';
import { routes } from '@/pages/routes.config';

export const CompromisesPage = () => {
  const { pathname } = useLocation();
  return (
    <Page>
      <OutletBreadcrumb>Compromises</OutletBreadcrumb>
      <TogglePageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Compromises</PageTitle>
            <PageDescription>
              Gain a comprehensive, real-time overview of active and historical
              Declarations of Compromise™ in your environment. Use filtering and
              visualization tools to investigate compromises, assess impact,
              explore relationships, empowering confident security
              decision-making and rapid incident response.
            </PageDescription>
          </PageHeaderContent>
          <IndicatorsDoc />
        </PageHeader>
        <Tabs value={pathname}>
          <TabsList>
            <TabsTriggerLink value={routes.threats_compromises_incidents}>
              Incidents
            </TabsTriggerLink>
            <TabsTriggerLink value={routes.threats_compromises_entities}>
              Entities
            </TabsTriggerLink>
            <TabsTriggerLink value={routes.threats_compromises_graph}>
              Graph
            </TabsTriggerLink>
            <TabsTriggerLink value={routes.threats_compromises_attack_flow}>
              Attack Flow
            </TabsTriggerLink>
          </TabsList>
        </Tabs>
        <div className="mt-2">
          <Outlet />
        </div>
      </TogglePageContainer>
    </Page>
  );
};
```

**Step 2: Commit**

```
feat: create Compromises page as new threats tab wrapper
```

---

### Task 3: Create standalone Threats Timeline page

**Files:**
- Modify: `src/pages/threats/timeline/index.tsx`

**Step 1: Wrap timeline in standalone Page layout**

The timeline was previously a tab child of ThreatsPage. Now it's standalone with its own Page layout.

```tsx
import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from '@/common/design-system/atoms/page';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { TogglePageContainer } from '@/common/design-system/molecules/toggle-container';
import { ThreatsTimeline } from '@/features/hunt/timeline/components/timeline/timeline';

export const ThreatsTimelinePage = () => (
  <Page>
    <OutletBreadcrumb>Timeline</OutletBreadcrumb>
    <TogglePageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Threats Timeline</PageTitle>
          <PageDescription>
            Visualize threats activity over time to identify patterns and trends
            in your environment.
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <ThreatsTimeline />
    </TogglePageContainer>
  </Page>
);
```

**Step 2: Commit**

```
feat: make threats timeline a standalone page
```

---

### Task 4: Create standalone Threats Coverage page

**Files:**
- Modify: `src/pages/threats/coverage/index.tsx`

**Step 1: Wrap coverage in standalone Page layout**

```tsx
import {
  Page,
  PageHeader,
  PageHeaderContent,
  PageTitle,
  PageDescription,
} from '@/common/design-system/atoms/page';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { TogglePageContainer } from '@/common/design-system/molecules/toggle-container';
import { CoveragePage } from '@/features/hunt/threats/templates/coverage';

export const ThreatsCoveragePage = () => (
  <Page>
    <OutletBreadcrumb>Coverage</OutletBreadcrumb>
    <TogglePageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Threats Coverage</PageTitle>
          <PageDescription>
            Review the coverage of threat detection methods and families in your
            environment.
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <CoveragePage familyClass="doc" />
    </TogglePageContainer>
  </Page>
);
```

**Step 2: Commit**

```
feat: make threats coverage a standalone page
```

---

### Task 5: Create the Violations page (Policy Violations tab wrapper)

**Files:**
- Create: `src/pages/policy-violations/violations/index.tsx`

**Step 1: Create Violations page with Entities + Graph tabs**

```tsx
import { Outlet, useLocation } from 'react-router-dom';

import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from '@/common/design-system/atoms/page';
import {
  Tabs,
  TabsList,
  TabsTriggerLink,
} from '@/common/design-system/atoms/ui/pillTabs';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { TogglePageContainer } from '@/common/design-system/molecules/toggle-container';
import { IndicatorsDopv } from '@/features/hunt/operational-center/components/indicators/docdopv.indicators';
import { routes } from '@/pages/routes.config';

export const ViolationsPage = () => {
  const { pathname } = useLocation();
  return (
    <Page>
      <OutletBreadcrumb>Policy Violations</OutletBreadcrumb>
      <TogglePageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Policy Violations</PageTitle>
            <PageDescription>
              Gain a comprehensive, real-time overview of active and historical
              Declaration of Policy Violations™ in your environment. Use
              filtering to investigate policy violations, assess impact, explore
              relationships, empowering confident security decision-making and
              rapid remediation.
            </PageDescription>
          </PageHeaderContent>
          <IndicatorsDopv />
        </PageHeader>
        <Tabs value={pathname}>
          <TabsList>
            <TabsTriggerLink value={routes.policy_violations_violations}>
              Entities
            </TabsTriggerLink>
            <TabsTriggerLink value={routes.policy_violations_violations_graph}>
              Graph
            </TabsTriggerLink>
          </TabsList>
        </Tabs>
        <div className="mt-2">
          <Outlet />
        </div>
      </TogglePageContainer>
    </Page>
  );
};
```

**Step 2: Commit**

```
feat: create Violations page as new policy violations tab wrapper
```

---

### Task 6: Create standalone Policy Violations Coverage page

**Files:**
- Modify: `src/pages/policy-violations/coverage/index.tsx`

**Step 1: Wrap in standalone Page layout**

```tsx
import {
  Page,
  PageHeader,
  PageHeaderContent,
  PageTitle,
  PageDescription,
} from '@/common/design-system/atoms/page';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { TogglePageContainer } from '@/common/design-system/molecules/toggle-container';
import { CoveragePage } from '@/features/hunt/threats/templates/coverage';

export const PolicyViolationsCoveragePage = () => (
  <Page>
    <OutletBreadcrumb>Coverage</OutletBreadcrumb>
    <TogglePageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Policy Violations Coverage</PageTitle>
          <PageDescription>
            Review the coverage of policy violation detection methods and
            families in your environment.
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <CoveragePage familyClass="dopv" />
    </TogglePageContainer>
  </Page>
);
```

**Step 2: Commit**

```
feat: make policy violations coverage a standalone page
```

---

### Task 7: Create the Beaconing page (Analytics tab wrapper)

**Files:**
- Create: `src/pages/analytics/beaconing/index.tsx`

**Step 1: Create Beaconing page with IPs + JA3s tabs**

This replaces the old `Analytics` component. It uses the composable Page layout instead of DefaultPage, and only has the two beaconing tabs.

```tsx
import { Link, Outlet, useLocation } from 'react-router-dom';

import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from '@/common/design-system/atoms/page';
import {
  Tabs,
  TabsBadge,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/borderTabs';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { TogglePageContainer } from '@/common/design-system/molecules/toggle-container';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useGetBeaconingEventsQuery } from '@/features/analytics/beaconing/api/beaconing.api';
import { routes } from '@/pages/routes.config';

export const BeaconingPage = () => {
  const pathname = useLocation().pathname;
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { data: ipsData, isLoading: ipsIsLoading } =
    useGetBeaconingEventsQuery({
      ...params,
      pageIndex: 0,
      pageSize: 10,
      qfilter: 'beacon_report.document_type:agg_serving_ip',
    });
  const { data: ja3sData, isLoading: ja3sIsLoading } =
    useGetBeaconingEventsQuery({
      ...params,
      pageIndex: 0,
      pageSize: 10,
      qfilter: 'beacon_report.document_type:agg_ja3s_src_only',
    });

  return (
    <Page>
      <OutletBreadcrumb>Beaconing</OutletBreadcrumb>
      <TogglePageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Beaconing</PageTitle>
            <PageDescription>
              Gain insights on TLS beaconing discovered on the network.
            </PageDescription>
          </PageHeaderContent>
        </PageHeader>
        <Tabs value={pathname}>
          <TabsList className="mb-2">
            <TabsTrigger
              value={
                pathname === routes.analytics_beaconing_ips
                  ? routes.analytics_beaconing_ips
                  : routes.analytics_beaconing
              }
              asChild
            >
              <Link to={routes.analytics_beaconing_ips}>
                Beaconing IPs
                <TabsBadge
                  count={ipsData?.count || 0}
                  isLoading={ipsIsLoading}
                />
              </Link>
            </TabsTrigger>
            <TabsTrigger
              value={routes.analytics_beaconing_ja3s}
              asChild
            >
              <Link to={routes.analytics_beaconing_ja3s}>
                Beaconing JA3s
                <TabsBadge
                  count={ja3sData?.count || 0}
                  isLoading={ja3sIsLoading}
                />
              </Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div>
          <Outlet />
        </div>
      </TogglePageContainer>
    </Page>
  );
};
```

**Step 2: Commit**

```
feat: create Beaconing page as new analytics tab wrapper
```

---

### Task 8: Create standalone Sightings page

**Files:**
- Modify: `src/pages/analytics/sightings/index.tsx`

**Step 1: Wrap sightings in standalone Page layout**

The current Sightings component is just a table. Wrap it in its own Page layout.

```tsx
import { useNavigate } from 'react-router-dom';

import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from '@/common/design-system/atoms/page';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { TogglePageContainer } from '@/common/design-system/molecules/toggle-container';
import { SightingsTable } from '@/features/analytics/sightings/components/sightings-table/sightings-table';
import {
  allSightingsExport,
  allSightingsTableColumns,
} from '@/features/analytics/sightings/components/sightings-table/sightings-table.columns';
import { routes } from '@/pages/routes.config';

export const Sightings = () => {
  const navigate = useNavigate();
  return (
    <Page>
      <OutletBreadcrumb>Sightings</OutletBreadcrumb>
      <TogglePageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Sightings</PageTitle>
            <PageDescription>
              Sightings events identify never observed before metadata, such as a
              HTTP User-Agent, a domain name, a JA4 hash, and more.
            </PageDescription>
          </PageHeaderContent>
        </PageHeader>
        <SightingsTable
          columns={allSightingsTableColumns}
          onRowClick={(row) =>
            navigate(
              routes.sightings_details.replace(
                ':sightingId',
                row.original._id,
              ),
            )
          }
          exportColumns={allSightingsExport}
        />
      </TogglePageContainer>
    </Page>
  );
};
```

**Step 2: Commit**

```
feat: make sightings a standalone page
```

---

### Task 9: Restructure the router

**Files:**
- Modify: `src/pages/router.tsx`

**Step 1: Update imports and route tree**

This is the biggest change. Restructure the route tree to:
1. Use new page wrappers (CompromisesPage, ViolationsPage, BeaconingPage)
2. Make Timeline, Coverage, Sightings standalone routes
3. Add redirects from old routes to new ones

Key changes:
- `/threats` children become: redirect to `/threats/compromises`, `/threats/compromises/*` (with tabs), `/threats/timeline`, `/threats/coverage`
- `/policy-violations` children become: redirect to `/policy-violations/violations`, `/policy-violations/violations/*` (with tabs), `/policy-violations/coverage`
- `/analytics` children become: redirect to `/analytics/beaconing`, `/analytics/beaconing/*` (with tabs), `/analytics/sightings/*`
- Old tab routes (`/threats/incidents`, `/threats/entities`, etc.) redirect to new paths
- Coverage sub-routes (family/:familyId, threat/:threatId) stay under `/threats/coverage/` and `/policy-violations/coverage/`

Add these new imports:
```tsx
import { CompromisesPage } from './threats/compromises';
import { ViolationsPage } from './policy-violations/violations';
import { BeaconingPage } from './analytics/beaconing';
```

Replace the threats route block:
```tsx
// Threats section
{
  path: '/threats',
  element: (
    <>
      <OutletBreadcrumb link={routes.threats_compromises}>Threats</OutletBreadcrumb>
      <Outlet />
    </>
  ),
  children: [
    {
      index: true,
      element: <Navigate to={routes.threats_compromises_incidents} replace />,
    },
    // Compromises (tab wrapper)
    {
      path: routes.threats_compromises,
      element: (
        <PageBoundary key="compromises">
          <CompromisesPage />
        </PageBoundary>
      ),
      children: [
        {
          index: true,
          element: <Navigate to={routes.threats_compromises_incidents} replace />,
        },
        {
          path: routes.threats_compromises_incidents,
          element: <PageBoundary key="compromises-incidents"><ThreatsIncidentsPage /></PageBoundary>,
        },
        {
          path: routes.threats_compromises_entities,
          element: <PageBoundary key="compromises-entities"><ThreatsImpactedEntities /></PageBoundary>,
        },
        {
          path: routes.threats_compromises_graph,
          element: <PageBoundary key="compromises-graph"><ThreatsGraphPage /></PageBoundary>,
        },
        {
          path: routes.threats_compromises_attack_flow,
          element: <PageBoundary key="compromises-attack-flow"><ThreatsAttackFlowPage /></PageBoundary>,
        },
      ],
    },
    // Timeline (standalone)
    {
      path: routes.threats_timeline,
      element: <PageBoundary key="threats-timeline"><ThreatsTimelinePage /></PageBoundary>,
    },
    // Coverage (standalone)
    {
      path: routes.threats_coverage,
      element: <PageBoundary key="threats-coverage"><ThreatsCoveragePage /></PageBoundary>,
    },
    // Backward-compat redirects
    { path: routes.threats_incidents, element: <Navigate to={routes.threats_compromises_incidents} replace /> },
    { path: routes.threats_entities, element: <Navigate to={routes.threats_compromises_entities} replace /> },
    { path: routes.threats_graph, element: <Navigate to={routes.threats_compromises_graph} replace /> },
    { path: routes.threats_attack_flow, element: <Navigate to={routes.threats_compromises_attack_flow} replace /> },
  ],
},
// Coverage sub-routes stay at top level (unchanged)
{ path: routes.threats_coverage_threat, ... },
{ path: routes.threats_coverage_family, ... },
```

Replace the policy-violations route block:
```tsx
{
  path: '/policy-violations',
  element: (
    <>
      <OutletBreadcrumb link={routes.policy_violations_violations}>Policy Violations</OutletBreadcrumb>
      <Outlet />
    </>
  ),
  children: [
    {
      index: true,
      element: <Navigate to={routes.policy_violations_violations} replace />,
    },
    // Violations (tab wrapper)
    {
      path: routes.policy_violations_violations,
      element: <PageBoundary key="violations"><ViolationsPage /></PageBoundary>,
      children: [
        {
          index: true,
          element: <PageBoundary key="violations-entities"><PolicyViolationsImpactedEntities /></PageBoundary>,
        },
        {
          path: routes.policy_violations_violations_graph,
          element: <PageBoundary key="violations-graph"><PolicyViolationsGraphPage /></PageBoundary>,
        },
      ],
    },
    // Coverage (standalone)
    {
      path: routes.policy_violations_coverage,
      element: <PageBoundary key="pv-coverage"><PolicyViolationsCoveragePage /></PageBoundary>,
    },
    // Backward-compat redirects
    { path: routes.policy_violations_graph, element: <Navigate to={routes.policy_violations_violations_graph} replace /> },
  ],
},
// Coverage sub-routes stay at top level (unchanged)
```

Replace the analytics route block:
```tsx
{
  path: routes.analytics,
  element: (
    <>
      <OutletBreadcrumb>Analytics</OutletBreadcrumb>
      <Outlet />
    </>
  ),
  children: [
    {
      index: true,
      element: <Navigate to={routes.analytics_beaconing_ips} replace />,
    },
    // Beaconing (tab wrapper)
    {
      path: routes.analytics_beaconing,
      element: (
        <>
          <OutletBreadcrumb>Beaconing</OutletBreadcrumb>
          <Outlet />
        </>
      ),
      children: [
        {
          index: true,
          element: <Navigate to={routes.analytics_beaconing_ips} replace />,
        },
        {
          path: routes.analytics_beaconing_ips,
          element: (
            <>
              <OutletBreadcrumb>IPs</OutletBreadcrumb>
              <Outlet />
            </>
          ),
          children: [
            {
              index: true,
              element: <BeaconingPage><PageBoundary key="beaconing-ips"><BeaconingIps /></PageBoundary></BeaconingPage>,
            },
            {
              path: routes.analytics_beaconing_ips_details,
              element: <PageBoundary key="beaconing-ip-details"><BeaconingIpDetails /></PageBoundary>,
            },
          ],
        },
        {
          path: routes.analytics_beaconing_ja3s,
          element: (
            <>
              <OutletBreadcrumb>JA3s</OutletBreadcrumb>
              <Outlet />
            </>
          ),
          children: [
            {
              index: true,
              element: <BeaconingPage><PageBoundary key="beaconing-ja3s"><BeaconingJa3s /></PageBoundary></BeaconingPage>,
            },
            {
              path: routes.analytics_beaconing_ja3s_details,
              element: <PageBoundary key="beaconing-ja3s-details"><BeaconingJa3sDetails /></PageBoundary>,
            },
          ],
        },
      ],
    },
    // Sightings (standalone)
    {
      path: routes.sightings,
      element: (
        <>
          <OutletBreadcrumb>Sightings</OutletBreadcrumb>
          <Outlet />
        </>
      ),
      children: [
        {
          index: true,
          element: <PageBoundary key="sightings"><Sightings /></PageBoundary>,
        },
        {
          path: routes.sightings_details,
          element: <PageBoundary key="sightings-details"><SightingDetails /></PageBoundary>,
        },
      ],
    },
    // Backward-compat redirects
    { path: routes.beaconing_ips, element: <Navigate to={routes.analytics_beaconing_ips} replace /> },
    { path: routes.beaconing_ja3s, element: <Navigate to={routes.analytics_beaconing_ja3s} replace /> },
  ],
},
```

**Step 2: Update internal links in page components**

Update `ThreatsIncidentsPage` (`src/pages/threats/incidents/index.tsx`) to reference new routes:
- `routes.threats_entities` → `routes.threats_compromises_entities`
- `routes.policy_violations` → `routes.policy_violations_violations`

Search for any other components referencing old route constants and update them.

**Step 3: Run type check and lint**

Run: `pnpm run check && pnpm run lint --fix`
Expected: PASS

**Step 4: Commit**

```
feat: restructure router for new navigation hierarchy
```

---

### Task 10: Update navigation config data model

**Files:**
- Modify: `src/common/design-system/layouts/components/navigation/navigation.config.tsx`

**Step 1: Update the MenuItem type and config**

Add `children` support to MenuItem and restructure Security Posture section:

```tsx
export type MenuItem = {
  key: string;
  type: 'link' | 'external';
  url: string;
  title: string;
  icon: React.ReactNode;
  beta?: boolean;
  enterprise?: boolean;
  children?: MenuItem[];
};
```

Update the Security Posture section:
```tsx
{
  label: 'Security Posture',
  enterprise: true,
  children: [
    {
      key: 'operational-center',
      type: 'link',
      url: routes.operational_center,
      title: 'Operational Center',
      icon: <Activity />,
      enterprise: true,
    },
    {
      key: 'volumetry',
      type: 'link',
      url: routes.volumetry,
      title: 'Volumetry',
      icon: <BarChart3 />,
      enterprise: true,
    },
    {
      key: 'threats',
      type: 'link',
      url: routes.threats_compromises,
      title: 'Threats',
      icon: <Biohazard />,
      enterprise: true,
      children: [
        {
          key: 'threats-compromises',
          type: 'link',
          url: routes.threats_compromises,
          title: 'Compromises',
          icon: <Biohazard />,
          enterprise: true,
        },
        {
          key: 'threats-timeline',
          type: 'link',
          url: routes.threats_timeline,
          title: 'Timeline',
          icon: <Biohazard />,
          enterprise: true,
        },
        {
          key: 'threats-coverage',
          type: 'link',
          url: routes.threats_coverage,
          title: 'Coverage',
          icon: <Biohazard />,
          enterprise: true,
        },
      ],
    },
    {
      key: 'policy-violations',
      type: 'link',
      url: routes.policy_violations_violations,
      title: 'Policy Violations',
      icon: <Scale />,
      enterprise: true,
      children: [
        {
          key: 'pv-violations',
          type: 'link',
          url: routes.policy_violations_violations,
          title: 'Policy Violations',
          icon: <Scale />,
          enterprise: true,
        },
        {
          key: 'pv-coverage',
          type: 'link',
          url: routes.policy_violations_coverage,
          title: 'Coverage',
          icon: <Scale />,
          enterprise: true,
        },
      ],
    },
    {
      key: 'attack-surface',
      type: 'link',
      url: routes.attack_surface,
      title: 'Attack Surface',
      icon: <Network />,
      enterprise: true,
      beta: true,
    },
    {
      key: 'analytics',
      type: 'link',
      url: routes.analytics_beaconing,
      title: 'Analytics',
      icon: <Radar />,
      enterprise: true,
      children: [
        {
          key: 'analytics-beaconing',
          type: 'link',
          url: routes.analytics_beaconing,
          title: 'Beaconing',
          icon: <Radar />,
          enterprise: true,
        },
        {
          key: 'analytics-sightings',
          type: 'link',
          url: routes.sightings,
          title: 'Sightings',
          icon: <Radar />,
          enterprise: true,
        },
      ],
    },
  ],
},
```

**Step 2: Commit**

```
feat: update navigation config with submenu children
```

---

### Task 11: Create the AppSidebar component

**Files:**
- Create: `src/common/design-system/layouts/components/navigation/app-sidebar.tsx`

**Step 1: Create the new sidebar component**

Build the new sidebar using the shadcn sidebar primitives. It should:
- Use `SidebarProvider` (in Root), `Sidebar` with `collapsible="icon"`
- Render `SidebarGroup` per section with `SidebarGroupLabel`
- Render items with children as `Collapsible` + `SidebarMenuSub`
- Render flat items as `SidebarMenuButton`
- Auto-open collapsible groups when a child route is active
- Handle external links (open in new tab)
- Show beta/enterprise badges
- Include tenant selector in header, user profile in footer

```tsx
import { ChevronRight, ArrowLeft, User } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import logo from '@/assets/stamus_s.png';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Column } from '@/common/design-system/atoms/layout/column';
import { Badge, BadgeProps } from '@/common/design-system/atoms/ui/badge';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/design-system/atoms/ui/select';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from '@/common/design-system/atoms/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/common/design-system/atoms/ui/collapsible';
import { useFeatureFlags } from '@/common/lib/use-feature-flags';
import { cn } from '@/common/lib/utils';
import { getConfig } from '@/config';
import { useGetCurrentUserQuery } from '@/features/user/auth/api/auth.api';
import { selectTenancy } from '@/features/user/tenancy/tenancy.selector';
import { setTenant, Tenant } from '@/features/user/tenancy/tenancy.slice';
import { routes } from '@/pages/routes.config';
import { useAppDispatch, useAppSelector } from '@/store/store';

import type { MenuItem, Submenu } from './navigation.config';

type AppSidebarProps = {
  menu: Submenu[];
};

export const AppSidebar = ({ menu }: AppSidebarProps) => {
  const { enterprise } = useFeatureFlags();
  const { pathname } = useLocation();

  const filteredMenu = menu
    .filter((group) => (enterprise ? true : !group.enterprise))
    .map((group) => ({
      ...group,
      children: group.children.filter((item) =>
        enterprise ? true : !item.enterprise,
      ),
    }));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarHeaderContent />
      </SidebarHeader>
      <SidebarContent>
        {filteredMenu.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.children.map((item) =>
                  item.children && item.children.length > 0 ? (
                    <CollapsibleMenuItem
                      key={item.key}
                      item={item}
                      pathname={pathname}
                      enterprise={enterprise}
                    />
                  ) : (
                    <FlatMenuItem
                      key={item.key}
                      item={item}
                      pathname={pathname}
                    />
                  ),
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <LegacyUIButton />
        <SidebarUserFooter />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

const SidebarHeaderContent = () => {
  const dispatch = useAppDispatch();
  const { multitenancy, tenant, tenantsList } = useAppSelector(selectTenancy);
  const { state } = useSidebar();

  return (
    <div className="flex flex-col gap-2">
      <Link to={routes.home}>
        <Row className="items-center gap-1 p-2">
          <img src={logo} alt="logo" className="h-8 w-8 shrink-0" />
          {state === 'expanded' && (
            <>
              <span className="text-lg font-black">/</span>
              <span className="text-lg font-light tracking-wide">Clear NDR</span>
            </>
          )}
        </Row>
      </Link>
      {multitenancy && state === 'expanded' && (
        <Select
          value={tenant?.toString()}
          onValueChange={(value: string) =>
            dispatch(setTenant(parseInt(value)))
          }
        >
          <SelectTrigger className="bg-background h-8 w-full">
            <SelectValue placeholder="Select Tenant" />
          </SelectTrigger>
          <SelectContent onCloseAutoFocus={(e) => e.preventDefault()}>
            {tenantsList.map((t: Tenant) => (
              <SelectItem key={t.tenantId} value={t.tenantId.toString()}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

const CollapsibleMenuItem = ({
  item,
  pathname,
  enterprise,
}: {
  item: MenuItem;
  pathname: string;
  enterprise: boolean;
}) => {
  const isActive = pathname.startsWith(item.url);
  const filteredChildren = item.children!.filter((child) =>
    enterprise ? true : !child.enterprise,
  );

  return (
    <Collapsible
      defaultOpen={isActive}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title}>
            {item.icon}
            <span>{item.title}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {filteredChildren.map((child) => (
              <SidebarMenuSubItem key={child.key}>
                <SidebarMenuSubButton
                  asChild
                  isActive={pathname.startsWith(child.url)}
                >
                  <Link to={child.url}>
                    <span>{child.title}</span>
                    <ItemBadges item={child} enterprise={enterprise} />
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

const FlatMenuItem = ({
  item,
  pathname,
}: {
  item: MenuItem;
  pathname: string;
}) => {
  const navigate = useNavigate();
  const { enterprise } = useFeatureFlags();
  const isActive = pathname.startsWith(item.url);

  const handleClick = () => {
    if (item.type === 'external') {
      window.open(item.url);
    } else {
      navigate(item.url);
    }
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={item.title}
        isActive={isActive}
        onClick={handleClick}
      >
        {item.icon}
        <span>{item.title}</span>
        <ItemBadges item={item} enterprise={enterprise} />
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const ItemBadges = ({
  item,
  enterprise,
}: {
  item: MenuItem;
  enterprise: boolean;
}) => (
  <Row className="ml-auto gap-1">
    {item.beta && (
      <Tag className="bg-beta text-beta-foreground">Beta</Tag>
    )}
    {!enterprise && item.enterprise && (
      <Tag variant="secondary">Enterprise</Tag>
    )}
  </Row>
);

const Tag = ({ children, className, ...props }: BadgeProps) => (
  <Badge className={cn('px-1 py-0 shadow-none', className)} {...props}>
    {children}
  </Badge>
);

const LegacyUIButton = () => {
  const { state } = useSidebar();
  return (
    <Button
      variant="outline"
      size="sm"
      className="mx-2"
      onClick={() =>
        (window.location.href = getConfig()?.apiUrl + '/stamus')
      }
    >
      <ArrowLeft className="size-4" />
      {state === 'expanded' && 'Back to legacy UI'}
    </Button>
  );
};

const SidebarUserFooter = () => {
  const { data } = useGetCurrentUserQuery();
  const { state } = useSidebar();

  return (
    <Row className="w-full items-center gap-3 px-2 pb-2">
      <div className="border-primary/50 flex size-9 shrink-0 items-center justify-center rounded-full border">
        <User className="size-5" />
      </div>
      {state === 'expanded' && (
        <Column>
          <p className="text-sm">{data?.username}</p>
          <Row className="-mt-1 items-center gap-2">
            <Button
              variant="link"
              className="h-3 p-0 text-xs"
              onClick={() =>
                window.open(getConfig()?.apiUrl + '/accounts/edit/')
              }
            >
              Settings
            </Button>
            <p className="text-foreground/50">{' | '}</p>
            <Button
              variant="link"
              className="h-3 p-0 text-xs"
              onClick={() =>
                (window.location.href =
                  getConfig()?.apiUrl + '/accounts/logout/')
              }
            >
              Log Out
            </Button>
          </Row>
        </Column>
      )}
    </Row>
  );
};
```

**Step 2: Verify collapsible is available**

Check that `@radix-ui/react-collapsible` is installed and there's a `collapsible.tsx` in the ui atoms. If not, install it and create the component.

**Step 3: Commit**

```
feat: create AppSidebar component using shadcn sidebar
```

---

### Task 12: Integrate AppSidebar into Root layout

**Files:**
- Modify: `src/app/root.tsx`
- Modify: `src/common/design-system/layouts/components/header/header.tsx`
- Modify: `src/features/ui/ui-state.slice.ts`

**Step 1: Update Root to use SidebarProvider + AppSidebar**

Replace the old `Navigation` with the new sidebar layout:

```tsx
import { SidebarProvider, SidebarInset } from '@/common/design-system/atoms/ui/sidebar';
import { AppSidebar } from '../common/design-system/layouts/components/navigation/app-sidebar';

// Remove: import { Navigation } from ...
// Remove: import { setIsNavigationOpen, selectIsNavigationOpen } from ...

export const Root = () => {
  // ... keep existing code, remove isNavigationOpen usage ...

  return (
    <SidebarProvider>
      <AppSidebar menu={menu} />
      <SidebarInset>
        <Modals />
        <BreadcrumbProvider>
          <div className="relative flex h-screen w-full flex-col overflow-hidden">
            <Header />
            <Row className="h-full gap-0 overflow-clip">
              <div id="expandable-portal-wrapper" className="empty:hidden" />
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
        </BreadcrumbProvider>
      </SidebarInset>
    </SidebarProvider>
  );
};
```

**Step 2: Update Header to use SidebarTrigger**

Replace the custom `NavigationToggler` with `SidebarTrigger`:

```tsx
import { SidebarTrigger } from '@/common/design-system/atoms/ui/sidebar';

// Replace NavigationToggler component and its usage with:
<SidebarTrigger />
```

Remove imports of `selectIsNavigationOpen` and `setIsNavigationOpen` from the header.

**Step 3: Clean up ui-state.slice.ts**

Remove `isNavigationOpen` from the Redux slice since the shadcn sidebar manages its own state via cookie. Remove:
- `isNavigationOpen` from `initialState`
- `isNavigationOpen` from `UIState` type
- `setIsNavigationOpen` reducer
- `selectIsNavigationOpen` selector
- The export of `setIsNavigationOpen`

**Step 4: Remove old Navigation component**

Delete or keep `src/common/design-system/layouts/components/navigation/navigation.tsx` — it's no longer imported. Keeping the file won't hurt but it's dead code.

**Step 5: Remove Ctrl/Cmd+D keybinding from navigation.tsx**

This is handled by the shadcn sidebar's built-in Ctrl/Cmd+B shortcut.

**Step 6: Search for any remaining references to old navigation**

Grep for `selectIsNavigationOpen`, `setIsNavigationOpen`, `isNavigationOpen` across the codebase and update/remove.

**Step 7: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: PASS

**Step 8: Commit**

```
feat: integrate AppSidebar into Root layout and clean up old navigation
```

---

### Task 13: Update internal route references

**Files:**
- Search and update all files referencing old route constants

**Step 1: Grep for old route references**

Search for these patterns across the codebase:
- `routes.threats_incidents` (should become `routes.threats_compromises_incidents`)
- `routes.threats_entities` (should become `routes.threats_compromises_entities`)
- `routes.threats_graph` (should become `routes.threats_compromises_graph`)
- `routes.threats_attack_flow` (should become `routes.threats_compromises_attack_flow`)
- `routes.policy_violations_graph` (should become `routes.policy_violations_violations_graph`)
- `routes.beaconing_ips` (should become `routes.analytics_beaconing_ips`)
- `routes.beaconing_ja3s` (should become `routes.analytics_beaconing_ja3s`)
- `routes.beaconing_ips_details` (should become `routes.analytics_beaconing_ips_details`)
- `routes.beaconing_ja3s_details` (should become `routes.analytics_beaconing_ja3s_details`)

Update each reference to use the new route constant. Some references in the router itself should stay (for backward-compat redirects).

**Step 2: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: PASS

**Step 3: Commit**

```
refactor: update internal route references to new paths
```

---

### Task 14: Run full verification

**Step 1: Run lint**

Run: `pnpm run lint --fix`
Expected: PASS

**Step 2: Run type check**

Run: `pnpm run check`
Expected: PASS

**Step 3: Run tests**

Run: `pnpm run test`
Expected: PASS (update any failing tests that reference old routes)

**Step 4: Manual smoke test checklist**

- [ ] Sidebar renders with all 4 sections
- [ ] Sidebar collapses to icon rail
- [ ] Ctrl/Cmd+B toggles sidebar
- [ ] Collapsible submenus open/close
- [ ] Active route highlights correct menu item
- [ ] Collapsible auto-opens when child route is active
- [ ] `/threats` redirects to `/threats/compromises/incidents`
- [ ] `/threats/compromises` shows tabs: Incidents, Entities, Graph, Attack Flow
- [ ] `/threats/timeline` is standalone page
- [ ] `/threats/coverage` is standalone page
- [ ] `/policy-violations` redirects to `/policy-violations/violations`
- [ ] `/policy-violations/violations` shows tabs: Entities, Graph
- [ ] `/policy-violations/coverage` is standalone page
- [ ] `/analytics` redirects to `/analytics/beaconing/ips`
- [ ] `/analytics/beaconing` shows tabs: IPs, JA3s
- [ ] `/analytics/sightings` is standalone page
- [ ] Old bookmarked URLs redirect correctly
- [ ] External links (Apps section) open in new tab
- [ ] Tenant selector works in sidebar header
- [ ] User profile and logout work in sidebar footer

**Step 5: Commit if tests needed updating**

```
fix: update tests for new navigation routes
```
