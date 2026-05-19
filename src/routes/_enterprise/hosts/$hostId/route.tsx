import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
  useParams,
} from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/border-tabs';
import { Separator } from '@/common/design-system/atoms/ui/separator';
import {
  HostBeaconsTabBadge,
  HostDetectionEventsTabBadge,
  HostFilesTabBadge,
  HostOutlierEventsTabBadge,
  HostSightingsTabBadge,
} from '@/features/events';
import { HostDetailsShell, HostHeader } from '@/features/host-insights';
import { HostDetectionMethodsTabBadge } from '@/features/rules';
import { HostIncidentsTabBadge } from '@/features/threats';

export const Route = createFileRoute('/_enterprise/hosts/$hostId')({
  component: () => (
    <PageBoundary key="host-details">
      <HostDetailsLayout />
    </PageBoundary>
  ),
});

function HostDetailsLayout() {
  const { hostId } = useParams({ strict: false }) as { hostId: string };
  const { pathname } = useLocation();

  return (
    <HostDetailsShell hostId={hostId}>
      <HostHeader hostId={hostId} />
      <Tabs value={pathname}>
        <TabsList>
          <TabsTrigger
            value={`/hosts/${hostId}`}
            asChild
          >
            <Link
              to="/hosts/$hostId"
              params={{ hostId }}
            >
              Insights
            </Link>
          </TabsTrigger>
          <TabsTrigger
            value={`/hosts/${hostId}/timeline`}
            asChild
          >
            <Link
              to="/hosts/$hostId/timeline"
              params={{ hostId }}
            >
              Timeline
            </Link>
          </TabsTrigger>
          <TabsTrigger
            value={`/hosts/${hostId}/hunting-trail`}
            asChild
          >
            <Link
              to="/hosts/$hostId/hunting-trail"
              params={{ hostId }}
            >
              Hunting Trail
            </Link>
          </TabsTrigger>
          <Separator
            orientation="vertical"
            className="bg-foreground/10 dark:bg-foreground/15 mx-1 h-5"
          />
          <TabsTrigger
            value={`/hosts/${hostId}/incidents`}
            asChild
          >
            <Link
              to="/hosts/$hostId/incidents"
              params={{ hostId }}
            >
              Incidents <HostIncidentsTabBadge hostId={hostId} />
            </Link>
          </TabsTrigger>
          <TabsTrigger
            value={`/hosts/${hostId}/detection-methods`}
            asChild
          >
            <Link
              to="/hosts/$hostId/detection-methods"
              params={{ hostId }}
            >
              Detection Methods <HostDetectionMethodsTabBadge hostId={hostId} />
            </Link>
          </TabsTrigger>
          <TabsTrigger
            value={`/hosts/${hostId}/outlier-events`}
            asChild
          >
            <Link
              to="/hosts/$hostId/outlier-events"
              params={{ hostId }}
            >
              Outlier Events <HostOutlierEventsTabBadge hostId={hostId} />
            </Link>
          </TabsTrigger>
          <TabsTrigger
            value={`/hosts/${hostId}/detection-events`}
            asChild
          >
            <Link
              to="/hosts/$hostId/detection-events"
              params={{ hostId }}
            >
              Detection Events <HostDetectionEventsTabBadge hostId={hostId} />
            </Link>
          </TabsTrigger>
          <TabsTrigger
            value={`/hosts/${hostId}/sightings`}
            asChild
          >
            <Link
              to="/hosts/$hostId/sightings"
              params={{ hostId }}
            >
              Sightings <HostSightingsTabBadge hostId={hostId} />
            </Link>
          </TabsTrigger>
          <TabsTrigger
            value={`/hosts/${hostId}/beacons`}
            asChild
          >
            <Link
              to="/hosts/$hostId/beacons"
              params={{ hostId }}
            >
              Beacons <HostBeaconsTabBadge hostId={hostId} />
            </Link>
          </TabsTrigger>
          <TabsTrigger
            value={`/hosts/${hostId}/files`}
            asChild
          >
            <Link
              to="/hosts/$hostId/files"
              params={{ hostId }}
            >
              Files <HostFilesTabBadge hostId={hostId} />
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="mt-2">
        <Outlet />
      </div>
    </HostDetailsShell>
  );
}
