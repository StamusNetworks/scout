import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from 'react-router-dom';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { useFeatureFlags } from '@/common/lib/use-feature-flags';
import { ThreatFamilyDefault } from '@/features/hunt/threats/templates/family-by-id/family-by-id';
import { ThreatByIdIndex } from '@/features/hunt/threats/templates/threat-by-id/threat-by-id';
import { Analytics } from '@/pages/analytics/analytics';
import { AttackSurface } from '@/pages/attack-surface';
import { Deeplinks } from '@/pages/deeplinks';
import { DetectionMethods } from '@/pages/detection-methods';
import { Events } from '@/pages/events';
import { EventByIdPage } from '@/pages/events/:eventId';
import { ExplorePage } from '@/pages/explore';
import { Explorer } from '@/pages/explorer';
import { FiltersActionsList } from '@/pages/filter-actions';
import { HostDetails } from '@/pages/hosts/[hostId]';
import { InvestigationsPage } from '@/pages/investigations';
import { OperationalCenter } from '@/pages/operational-center';
import { ThreatsGraphPage } from '@/pages/threats/graph';

import { Root } from '../app/root';
import { NotFound } from '../common/design-system/layouts/components/404';
import { Slash } from '../common/design-system/layouts/components/slash';
import { OutletBreadcrumb } from '../common/design-system/molecules/breadcrumbs';
import { BeaconingIps } from './analytics/beaconing-ips';
import { BeaconingIpDetails } from './analytics/beaconing-ips/[ip]';
import { BeaconingJa3s } from './analytics/beaconing-ja3s';
import { BeaconingJa3sDetails } from './analytics/beaconing-ja3s/[ja3s]';
import { Sightings } from './analytics/sightings';
import { SightingDetails } from './analytics/sightings/[id]';
import { AttackSurfaceInventory } from './attack-surface/inventory';
import { AttackSurfaceVisualisation } from './attack-surface/visualisation';
import { Deeplink } from './deeplink';
import { FilterSetsPage } from './filter-sets';
import { HostsPage } from './hosts';
import { HostBeaconing } from './hosts/[hostId]/beacons';
import { HostDetectionEvents } from './hosts/[hostId]/detection-events';
import { HostDetectionMethods } from './hosts/[hostId]/detection-methods';
import { HostIncidents } from './hosts/[hostId]/incidents';
import { HostInsights } from './hosts/[hostId]/insights';
import { HostOutlierEvents } from './hosts/[hostId]/outlier-events';
import { HostSightings } from './hosts/[hostId]/sightings';
import { HostTimeline } from './hosts/[hostId]/timeline';
import { PolicyViolationsPage } from './policy-violations';
import { PolicyViolationsCoveragePage } from './policy-violations/coverage';
import { PolicyViolationFamilyByIdPage } from './policy-violations/coverage/family';
import { PolicyViolationFamilyDetectionMethodsPage } from './policy-violations/coverage/family/detection-methods';
import { PolicyViolationFamilyEventsPage } from './policy-violations/coverage/family/events';
import { PolicyViolationThreatsListPage } from './policy-violations/coverage/family/threats';
import { PolicyViolationByIdPage } from './policy-violations/coverage/policy-violation';
import { PolicyViolationByIdDetectionMethods } from './policy-violations/coverage/policy-violation/detection-methods';
import { PolicyViolationByIdEventsPage } from './policy-violations/coverage/policy-violation/events';
import { PolicyViolationsGraphPage } from './policy-violations/graph';
import { PolicyViolationsImpactedEntities } from './policy-violations/impacted-entities';
import { UserSettingsPage } from './preferences';
import { Routes, routes } from './routes.config';
import { ThreatsPage } from './threats';
import { ThreatsCoveragePage } from './threats/coverage';
import { ThreatFamilyByIdPage } from './threats/coverage/family';
import { ThreatFamilyDetectionMethodsPage } from './threats/coverage/family/detection-methods';
import { ThreatFamilyEventsPage } from './threats/coverage/family/events';
import { ThreatFamilyThreatsListPage } from './threats/coverage/family/threats';
import { ThreatByIdPage } from './threats/coverage/threat';
import { ThreatByIdDetectionMethodsPage } from './threats/coverage/threat/detection-methods';
import { ThreatByIdEventsPage } from './threats/coverage/threat/events';
import { ThreatsImpactedEntities } from './threats/impacted-entities';
import { ThreatsTimelinePage } from './threats/timeline';
import { TransactionsPage } from './transactions';

const createRouter = (routes: Record<keyof Routes, string>) =>
  createBrowserRouter(
    [
      {
        path: '/',
        element: <Root />,
        children: [
          { path: '/', element: <Slash /> },
          {
            path: '/',
            element: <EnterpriseRoutes />,
            children: [
              {
                path: routes.operational_center,
                element: (
                  <PageBoundary key="operational-center">
                    <OperationalCenter />
                  </PageBoundary>
                ),
              },
              {
                path: routes.threats,
                element: (
                  <PageBoundary key="threats">
                    <ThreatsPage />
                  </PageBoundary>
                ),
                children: [
                  {
                    index: true,
                    element: (
                      <PageBoundary key="threats-root">
                        <ThreatsImpactedEntities />
                      </PageBoundary>
                    ),
                  },
                  {
                    path: routes.threats_timeline,
                    element: (
                      <PageBoundary key="threats-timeline">
                        <ThreatsTimelinePage />
                      </PageBoundary>
                    ),
                  },
                  {
                    path: routes.threats_graph,
                    element: (
                      <PageBoundary key="threats-graph">
                        <ThreatsGraphPage />
                      </PageBoundary>
                    ),
                  },
                  {
                    path: routes.threats_coverage,
                    element: (
                      <PageBoundary key="threats-coverage">
                        <ThreatsCoveragePage />
                      </PageBoundary>
                    ),
                  },
                ],
              },
              {
                path: routes.threats_coverage_threat,
                element: (
                  <PageBoundary key="threat-by-id">
                    <OutletBreadcrumb link={routes.threats}>
                      Threats
                    </OutletBreadcrumb>
                    <OutletBreadcrumb link={routes.threats_coverage}>
                      Coverage
                    </OutletBreadcrumb>
                    <ThreatByIdPage />
                  </PageBoundary>
                ),
                children: [
                  {
                    index: true,
                    element: (
                      <PageBoundary key="threat-by-id-index">
                        <ThreatByIdIndex />
                      </PageBoundary>
                    ),
                  },
                  {
                    path: routes.threats_coverage_threat_events,
                    element: (
                      <PageBoundary key="threat-by-id-events">
                        <ThreatByIdEventsPage />
                      </PageBoundary>
                    ),
                  },
                  {
                    path: routes.threats_coverage_threat_detection_methods,
                    element: (
                      <PageBoundary key="threat-by-id-detection-methods">
                        <ThreatByIdDetectionMethodsPage />
                      </PageBoundary>
                    ),
                  },
                ],
              },
              {
                path: routes.threats_coverage_family,
                element: (
                  <PageBoundary key="threat-family-by-id">
                    <OutletBreadcrumb link={routes.threats}>
                      Threats
                    </OutletBreadcrumb>
                    <OutletBreadcrumb link={routes.threats_coverage}>
                      Coverage
                    </OutletBreadcrumb>
                    <ThreatFamilyByIdPage />
                  </PageBoundary>
                ),
                children: [
                  {
                    index: true,
                    element: (
                      <PageBoundary key="threat-family-default">
                        <ThreatFamilyDefault />
                      </PageBoundary>
                    ),
                  },
                  {
                    path: routes.threats_coverage_family_threats,
                    element: (
                      <PageBoundary key="threat-family-threats-list">
                        <ThreatFamilyThreatsListPage />
                      </PageBoundary>
                    ),
                  },
                  {
                    path: routes.threats_coverage_family_events,
                    element: (
                      <PageBoundary key="threat-family-events">
                        <ThreatFamilyEventsPage />
                      </PageBoundary>
                    ),
                  },
                  {
                    path: routes.threats_coverage_family_detection_methods,
                    element: (
                      <PageBoundary key="threat-family-detection-methods">
                        <ThreatFamilyDetectionMethodsPage />
                      </PageBoundary>
                    ),
                  },
                ],
              },
              {
                path: routes.policy_violations_coverage_threat,
                element: (
                  <PageBoundary key="threat-by-id">
                    <OutletBreadcrumb link={routes.policy_violations}>
                      Policy Violations
                    </OutletBreadcrumb>
                    <OutletBreadcrumb link={routes.policy_violations_coverage}>
                      Coverage
                    </OutletBreadcrumb>
                    <PolicyViolationByIdPage />
                  </PageBoundary>
                ),
                children: [
                  {
                    index: true,
                    element: (
                      <PageBoundary key="threat-by-id-index">
                        <ThreatByIdIndex familyClass="dopv" />
                      </PageBoundary>
                    ),
                  },
                  {
                    path: routes.policy_violations_coverage_threat_events,
                    element: (
                      <PageBoundary key="threat-by-id-events">
                        <PolicyViolationByIdEventsPage />
                      </PageBoundary>
                    ),
                  },
                  {
                    path: routes.policy_violations_coverage_threat_detection_methods,
                    element: (
                      <PageBoundary key="threat-by-id-detection-methods">
                        <PolicyViolationByIdDetectionMethods />
                      </PageBoundary>
                    ),
                  },
                ],
              },
              {
                path: routes.policy_violations_coverage_family,
                element: (
                  <PageBoundary key="threat-family-by-id">
                    <OutletBreadcrumb link={routes.policy_violations}>
                      Policy Violations
                    </OutletBreadcrumb>
                    <OutletBreadcrumb link={routes.policy_violations_coverage}>
                      Coverage
                    </OutletBreadcrumb>
                    <PolicyViolationFamilyByIdPage />
                  </PageBoundary>
                ),
                children: [
                  {
                    index: true,
                    element: (
                      <PageBoundary key="threat-family-default">
                        <ThreatFamilyDefault familyClass="dopv" />
                      </PageBoundary>
                    ),
                  },
                  {
                    path: routes.policy_violations_coverage_family_threats,
                    element: (
                      <PageBoundary key="threat-family-threats-list">
                        <PolicyViolationThreatsListPage />
                      </PageBoundary>
                    ),
                  },
                  {
                    path: routes.policy_violations_coverage_family_events,
                    element: (
                      <PageBoundary key="threat-family-events">
                        <PolicyViolationFamilyEventsPage />
                      </PageBoundary>
                    ),
                  },
                  {
                    path: routes.policy_violations_coverage_family_detection_methods,
                    element: (
                      <PageBoundary key="threat-family-detection-methods">
                        <PolicyViolationFamilyDetectionMethodsPage />
                      </PageBoundary>
                    ),
                  },
                ],
              },
              {
                path: routes.policy_violations,
                element: (
                  <PageBoundary key="policy_violations">
                    <PolicyViolationsPage />
                  </PageBoundary>
                ),
                children: [
                  {
                    index: true,
                    element: (
                      <PageBoundary key="policy_violations-root">
                        <PolicyViolationsImpactedEntities />
                      </PageBoundary>
                    ),
                  },
                  {
                    path: routes.policy_violations_graph,
                    element: (
                      <PageBoundary key="policy_violations-graph">
                        <PolicyViolationsGraphPage />
                      </PageBoundary>
                    ),
                  },
                  {
                    path: routes.policy_violations_coverage,
                    element: (
                      <PageBoundary key="policy_violations-coverage">
                        <PolicyViolationsCoveragePage />
                      </PageBoundary>
                    ),
                  },
                ],
              },
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
                    element: (
                      <Navigate
                        to={routes.beaconing_ips}
                        replace
                      />
                    ),
                  },
                  {
                    path: routes.beaconing_ips,
                    element: (
                      <>
                        <OutletBreadcrumb>Beaconing IPs</OutletBreadcrumb>
                        <Outlet />
                      </>
                    ),
                    children: [
                      {
                        index: true,
                        element: (
                          <Analytics>
                            <PageBoundary key="beaconing-ips">
                              <BeaconingIps />
                            </PageBoundary>
                          </Analytics>
                        ),
                      },
                      {
                        path: routes.beaconing_ips_details,
                        element: (
                          <PageBoundary key="beaconing-ip-details">
                            <BeaconingIpDetails />
                          </PageBoundary>
                        ),
                      },
                    ],
                  },
                  {
                    path: routes.beaconing_ja3s,
                    element: (
                      <>
                        <OutletBreadcrumb>Beaconing JA3s</OutletBreadcrumb>
                        <Outlet />
                      </>
                    ),
                    children: [
                      {
                        index: true,
                        element: (
                          <Analytics>
                            <PageBoundary key="beaconing-ja3s">
                              <BeaconingJa3s />
                            </PageBoundary>
                          </Analytics>
                        ),
                      },
                      {
                        path: routes.beaconing_ja3s_details,
                        element: (
                          <PageBoundary key="beaconing-ja3s-details">
                            <BeaconingJa3sDetails />
                          </PageBoundary>
                        ),
                      },
                    ],
                  },
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
                        element: (
                          <Analytics>
                            <PageBoundary key="sightings">
                              <Sightings />
                            </PageBoundary>
                          </Analytics>
                        ),
                      },
                      {
                        path: routes.sightings_details,
                        element: (
                          <PageBoundary key="sightings-details">
                            <SightingDetails />
                          </PageBoundary>
                        ),
                      },
                    ],
                  },
                ],
              },
              {
                path: routes.attack_surface,
                element: (
                  <PageBoundary key="attack-surface">
                    <AttackSurface />
                  </PageBoundary>
                ),
                children: [
                  {
                    index: true,
                    element: (
                      <PageBoundary key="attack-surface-visualisation">
                        <AttackSurfaceVisualisation />
                      </PageBoundary>
                    ),
                  },
                  {
                    path: routes.attack_surface_inventory,
                    element: (
                      <PageBoundary key="attack-surface-inventory">
                        <AttackSurfaceInventory />
                      </PageBoundary>
                    ),
                  },
                ],
              },
              {
                path: routes.hosts,
                element: (
                  <PageBoundary key="hosts">
                    <HostsPage />
                  </PageBoundary>
                ),
              },
              {
                path: routes.hosts_host,
                element: (
                  <PageBoundary key="attack-surface-host">
                    <HostDetails />
                  </PageBoundary>
                ),
                children: [
                  {
                    index: true,
                    element: (
                      <PageBoundary key="host-insights">
                        <HostInsights />
                      </PageBoundary>
                    ),
                  },
                  {
                    path: routes.hosts_host_incidents,
                    element: (
                      <PageBoundary key="host-incidents">
                        <HostIncidents />
                      </PageBoundary>
                    ),
                  },
                  {
                    path: routes.hosts_host_detection_methods,
                    element: (
                      <PageBoundary key="host-detection-methods">
                        <HostDetectionMethods />
                      </PageBoundary>
                    ),
                  },
                  {
                    path: routes.hosts_host_beacons,
                    element: (
                      <PageBoundary key="host-beaconing">
                        <HostBeaconing />
                      </PageBoundary>
                    ),
                  },
                  {
                    path: routes.hosts_host_sightings,
                    element: (
                      <PageBoundary key="host-sightings">
                        <HostSightings />
                      </PageBoundary>
                    ),
                  },
                  {
                    path: routes.hosts_host_timeline,
                    element: (
                      <PageBoundary key="host-timeline">
                        <HostTimeline />
                      </PageBoundary>
                    ),
                  },
                  {
                    path: routes.hosts_host_outlierevents,
                    element: (
                      <PageBoundary key="host-outlier-events">
                        <HostOutlierEvents />
                      </PageBoundary>
                    ),
                  },
                  {
                    path: routes.hosts_host_detectionevents,
                    element: (
                      <PageBoundary key="host-detection-events">
                        <HostDetectionEvents />
                      </PageBoundary>
                    ),
                  },
                ],
              },
            ],
          },
          {
            path: routes.user_settings,
            element: (
              <PageBoundary key="user-settings">
                <UserSettingsPage />
              </PageBoundary>
            ),
          },
          {
            path: routes.explorer,
            element: (
              <PageBoundary key="explorer">
                <Explorer />
              </PageBoundary>
            ),
          },
          {
            path: routes.events,
            element: (
              <>
                <OutletBreadcrumb>Events</OutletBreadcrumb>
                <Outlet />
              </>
            ),
            children: [
              {
                index: true,
                element: (
                  <PageBoundary key="events">
                    <Events />
                  </PageBoundary>
                ),
              },
              {
                path: routes.event,
                element: (
                  <PageBoundary key="event-by-id">
                    <EventByIdPage />
                  </PageBoundary>
                ),
              },
            ],
          },
          {
            path: routes.detection_methods,
            element: (
              <PageBoundary key="detection-methods">
                <DetectionMethods />
              </PageBoundary>
            ),
          },
          {
            path: routes.detection_method,
            element: (
              <PageBoundary key="detection-method">
                <DetectionMethods />
              </PageBoundary>
            ),
          },
          {
            path: routes.filters_actions,
            element: (
              <PageBoundary key="filters_actions">
                <FiltersActionsList />
              </PageBoundary>
            ),
          },
          {
            path: routes.investigations,
            element: (
              <PageBoundary key="investigations">
                <InvestigationsPage />
              </PageBoundary>
            ),
          },
          {
            path: routes.explore,
            element: (
              <PageBoundary key="explore">
                <ExplorePage />
              </PageBoundary>
            ),
          },
          {
            path: routes.deeplink,
            element: (
              <PageBoundary key="deeplink">
                <Deeplink />
              </PageBoundary>
            ),
          },
          {
            path: routes.deeplinks,
            element: (
              <PageBoundary key="deeplinks">
                <Deeplinks />
              </PageBoundary>
            ),
          },
          {
            path: routes.session_events,
            element: (
              <PageBoundary key="transactions">
                <TransactionsPage />
              </PageBoundary>
            ),
          },
          {
            path: routes.filter_sets,
            element: (
              <PageBoundary key="filter-sets">
                <FilterSetsPage />
              </PageBoundary>
            ),
          },
          {
            path: '*',
            element: (
              <PageBoundary key="not-found">
                <NotFound />
              </PageBoundary>
            ),
          },
        ],
      },
    ],
    {
      basename: import.meta.env.BASE_URL || '',
    },
  );

export const Router = () => {
  return <RouterProvider router={createRouter(routes)} />;
};

const EnterpriseRoutes = () => {
  const { enterprise } = useFeatureFlags();
  return enterprise ? (
    <Outlet />
  ) : (
    <Navigate
      to={routes.explorer}
      replace
    />
  );
};
