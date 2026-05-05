import {
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from '@tanstack/react-router';
import { Binary, Info, LayoutDashboard, PlusCircle } from 'lucide-react';
import { useState } from 'react';

import { Row } from '@/common/design-system/atoms/layout/row';
import { Markdown } from '@/common/design-system/atoms/markdown';
import {
  Page,
  PageActions,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageStat,
  PageStats,
  PageTitle,
} from '@/common/design-system/atoms/page';
import {
  Tabs,
  TabsBadge,
  TabsList,
} from '@/common/design-system/atoms/ui/borderTabs';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/common/design-system/atoms/ui/dialog';
import { TabsTriggerLink } from '@/common/design-system/atoms/ui/pillTabs';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { usePaginationUrlState } from '@/common/design-system/molecules/data-table/hooks/use-pagination';
import { useSortingUrlState } from '@/common/design-system/molecules/data-table/hooks/use-sorting';
import { TogglePageContainer } from '@/common/design-system/molecules/toggle-container';
import { useCreateFilter } from '@/features/query-filters/hooks/use-create-filter';
import { useEnableFilterFlags } from '@/features/query-filters/hooks/use-enable-filter-flags';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';
import { KIND_LABEL, ThreatForm } from '@/features/threats';
import { ImpactedEntitiesTable } from '@/features/threats/components/impacted-entities-table/impacted-entities-table';
import { KillChainCountersByFamilyId } from '@/features/threats/components/kill-chain-counters/kill-chain-counters';

import {
  useGetActiveThreatFamiliesQuery,
  useGetThreatFamiliesQuery,
} from '../../../api/threats.api';
import { useFamilyDetectionMethods } from '../../../hooks/use-family-detection-methods';
import { useFamilyEvents } from '../../../hooks/use-family-events';
import { ThreatKind } from '../../../model/threat';
import { ThreatFamily } from '../../../model/threat-family';
import { FamilyActiveThreats } from '../family-active-threats';

const usePageFamilyEvents = () => {
  const { familyId } = useParams({ strict: false }) as { familyId: string };
  const [pagination] = usePaginationUrlState();
  const [, , ordering] = useSortingUrlState();
  return useFamilyEvents({
    familyId: familyId!,
    pagination,
    ordering,
  });
};

const usePageFamilyDetectionMethods = () => {
  const { familyId } = useParams({ strict: false }) as { familyId: string };
  const [pagination] = usePaginationUrlState();
  const [, , ordering] = useSortingUrlState();
  return useFamilyDetectionMethods({
    familyId: familyId!,
    pagination,
    ordering,
  });
};

const slugSuffix: Record<string, string> = {
  threats_coverage_family: '',
  threats_coverage_family_detection_methods: '/detection-methods',
  threats_coverage_family_events: '/events',
  threats_coverage_family_threats: '/threats',
};

const getLink = (slug: string, kind: ThreatKind, familyId: number) => {
  const base = kind === 'compromise' ? '/threats' : '/policy-violations';
  return `${base}/coverage/family/${familyId}${slugSuffix[slug] ?? ''}`;
};

export const ThreatFamilyById = () => {
  const { familyId } = useParams({ strict: false }) as { familyId: string };
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const createFilter = useCreateFilter();
  const enableTags = useEnableFilterFlags();

  const params = useGlobalQueryParams(['tenant', 'dates']);

  const { data: threatFamily } = useGetThreatFamiliesQuery(
    { tenant: params.tenant },
    {
      selectFromResult: (result) => ({
        ...result,
        data: result.data?.entities[parseInt(familyId!)],
      }),
    },
  );
  const { data: activeThreatFamily, isLoading: activeThreatFamilyLoading } =
    useGetActiveThreatFamiliesQuery(params, {
      selectFromResult: (result) => ({
        ...result,
        data: result.data?.entities[parseInt(familyId!)],
      }),
    });

  const { data: familyEvents, isLoading: familyEventsLoading } =
    usePageFamilyEvents();

  const {
    data: familyDetectionMethods,
    isLoading: familyDetectionMethodsLoading,
  } = usePageFamilyDetectionMethods();

  const assets = activeThreatFamily?.assets;
  const stats = [
    { label: 'New victims', value: assets?.victims ?? 0 },
    { label: 'Total victims', value: assets?.victims ?? 0 },
    { label: 'New offenders', value: assets?.offenders ?? 0 },
    { label: 'Total offenders', value: assets?.offenders ?? 0 },
  ];

  if (!threatFamily) return null;

  return (
    <>
      <OutletBreadcrumb>{threatFamily.name}</OutletBreadcrumb>
      <Page>
        <TogglePageContainer>
          <PageHeader>
            <PageHeaderContent>
              <Row className="items-center">
                <ThreatFamilyName family={threatFamily} />
                {(threatFamily.id === 1 || threatFamily.id === 25) && (
                  <Row className="bg-primary text-primary-foreground ml-3 w-fit rounded-md border px-2 py-1 text-xs">
                    <Info className="mr-2" />
                    Links might be broken in preview mode.
                  </Row>
                )}
              </Row>
              <PageDescription>
                <Markdown content={threatFamily.description} />
              </PageDescription>
            </PageHeaderContent>
            <PageActions>
              <Button
                variant="outline"
                onClick={() => {
                  enableTags();
                  createFilter({
                    key: 'stamus.family_name',
                    value: threatFamily.name,
                  });
                  navigate({ to: '/detection-events' });
                }}
              >
                <Binary />
                See events
              </Button>
              <Button
                onClick={() => {
                  enableTags();
                  createFilter({
                    key: 'stamus.family_name',
                    value: threatFamily.name,
                  });
                  navigate({ to: '/explorer' });
                }}
              >
                <LayoutDashboard />
                Investigate
              </Button>
            </PageActions>
          </PageHeader>
          <PageStats>
            {stats.map((s) => (
              <PageStat
                key={s.label}
                label={s.label}
                value={s.value}
              />
            ))}
          </PageStats>
          <FamilyActiveThreats familyId={parseInt(familyId!)} />
          <Tabs
            value={pathname}
            className="mt-4"
          >
            <TabsList>
              <TabsTriggerLink
                value={getLink(
                  'threats_coverage_family',
                  threatFamily.kind,
                  threatFamily.id,
                )}
              >
                Entities
                <TabsBadge
                  count={
                    (assets?.victims ?? 0) +
                    (assets?.offenders ?? 0) -
                    (assets?.bothVictimAndOffender ?? 0)
                  }
                  isLoading={activeThreatFamilyLoading}
                />
              </TabsTriggerLink>
              <TabsTriggerLink
                value={getLink(
                  'threats_coverage_family_detection_methods',
                  threatFamily.kind,
                  threatFamily.id,
                )}
              >
                Detection Methods
                <TabsBadge
                  count={familyDetectionMethods?.count || 0}
                  isLoading={familyDetectionMethodsLoading}
                />
              </TabsTriggerLink>
              <TabsTriggerLink
                value={getLink(
                  'threats_coverage_family_events',
                  threatFamily.kind,
                  threatFamily.id,
                )}
              >
                Events
                <TabsBadge
                  count={familyEvents?.count || 0}
                  isLoading={familyEventsLoading}
                />
              </TabsTriggerLink>
              <TabsTriggerLink
                value={getLink(
                  'threats_coverage_family_threats',
                  threatFamily.kind,
                  threatFamily.id,
                )}
              >
                {threatFamily.kind === 'compromise'
                  ? 'Threats'
                  : 'Policy Violations'}
              </TabsTriggerLink>
            </TabsList>
            <div className="pt-4">
              <Outlet />
            </div>
          </Tabs>
        </TogglePageContainer>
      </Page>
    </>
  );
};

export const ThreatFamilyDefault = ({
  kind = 'compromise',
}: {
  kind?: ThreatKind;
}) => {
  const { familyId } = useParams({ strict: false }) as { familyId: string };
  const { data: family } = useGetThreatFamiliesQuery(
    {},
    {
      selectFromResult: (result) => ({
        ...result,
        data: result.data?.entities[parseInt(familyId!)],
      }),
    },
  );
  return (
    <>
      {familyId && family?.kind === 'compromise' && (
        <KillChainCountersByFamilyId
          className="mb-6"
          familyId={familyId}
        />
      )}
      <ImpactedEntitiesTable
        familyId={parseInt(familyId!)}
        kind={kind}
      />
    </>
  );
};

export const ThreatFamilyName = ({ family }: { family: ThreatFamily }) => {
  const [isEditing, setIsEditing] = useState(false);
  if (family.id !== 1 && family.id !== 25)
    return <PageTitle>{family.name}</PageTitle>;

  return (
    <Row className="mb-1 items-center gap-2">
      <PageTitle className="mb-0">{family.name}</PageTitle>
      <Row>
        <Dialog
          open={isEditing}
          onOpenChange={setIsEditing}
        >
          <DialogTrigger>
            <Button
              variant="ghost"
              className="text-muted-foreground h-7 w-7 translate-y-px"
            >
              <PlusCircle size={14} />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Create Custom {KIND_LABEL[family.kind]}</DialogTitle>
            <ThreatForm
              onClose={() => setIsEditing(false)}
              kind={family.kind}
            />
          </DialogContent>
        </Dialog>
      </Row>
    </Row>
  );
};
