import { Binary, Edit, LayoutDashboard, Trash } from 'lucide-react';
import { useState } from 'react';
import {
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from '@tanstack/react-router';
import { toast } from 'sonner';

import { DefaultPage } from '@/common/design-system/atoms/default-page';
import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Markdown } from '@/common/design-system/atoms/markdown';
import { PageTitle } from '@/common/design-system/atoms/page-header';
import { TabsBadge } from '@/common/design-system/atoms/ui/borderTabs';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/common/design-system/atoms/ui/dialog';
import {
  Tabs,
  TabsList,
  TabsTriggerLink,
} from '@/common/design-system/atoms/ui/pillTabs';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { usePaginationUrlState } from '@/common/design-system/molecules/data-table/hooks/use-pagination';
import { useSortingUrlState } from '@/common/design-system/molecules/data-table/hooks/use-sorting';
import { DeleteModal } from '@/common/design-system/molecules/delete-modal';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { ImpactedEntitiesTable } from '@/features/hunt/entities/components/impacted-entities-table/impacted-entities-table';
import { useQFBuilder } from '@/features/hunt/filtering/query-filters/hooks/use-qf-builder';
import { addQueryFilter } from '@/features/hunt/filtering/query-filters/store/query-filters.slice';
import { enableTags } from '@/features/hunt/filtering/query-filters/use-cases/enable-tags';
import { KillChainCountersByThreatId } from '@/features/hunt/killchain/components/killchain-counters/killchain-counters';
import {
  useDeleteThreatMutation,
  useGetActiveThreatsQuery,
  useGetThreatByIdQuery,
  useGetThreatFamiliesQuery,
} from '@/features/hunt/threats/api/threats.api';
import { CreateEditThreatForm } from '@/features/hunt/threats/components/create-edit-threat-form';
import { Threat } from '@/features/hunt/threats/model/threat.model';
import { useAppDispatch } from '@/store/store';

import { useThreatDetectionMethods } from '../../hooks/use-threat-detection-methods';
import { useThreatEvents } from '../../hooks/use-threat-events';

const usePageThreatEvents = () => {
  const { threatId } = useParams({ strict: false }) as { threatId: string };
  const [, , ordering] = useSortingUrlState();
  const [pagination] = usePaginationUrlState();
  return useThreatEvents({
    threatId: threatId!,
    pagination,
    ordering,
  });
};
const usePageThreatDetectionMethods = () => {
  const { threatId } = useParams({ strict: false }) as { threatId: string };
  const [, , ordering] = useSortingUrlState();
  const [pagination] = usePaginationUrlState();
  return useThreatDetectionMethods({
    threatId: threatId!,
    pagination,
    ordering,
  });
};

const threatSlugSuffix: Record<string, string> = {
  threats_coverage_threat: '',
  threats_coverage_threat_detection_methods: '/detection-methods',
  threats_coverage_threat_events: '/events',
  threats_coverage_family: '',
};

const getLink = (
  slug: string,
  familyClass: 'doc' | 'dopv',
  id: number,
  link: 'family' | 'threat' = 'threat',
) => {
  const base = familyClass === 'doc' ? '/threats' : '/policy-violations';
  return `${base}/coverage/${link}/${id}${threatSlugSuffix[slug] ?? ''}`;
};

export const ThreatById = () => {
  const { threatId } = useParams({ strict: false }) as { threatId: string };
  const pathname = useLocation().pathname;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const QFBuilder = useQFBuilder();

  const { tenant, start_date, end_date } = useGlobalQueryParams([
    'tenant',
    'dates',
  ]);
  const { data: threat } = useGetThreatByIdQuery({
    tenant,
    threatId: threatId!,
  });
  const { data: activeThreat, isLoading: activeThreatLoading } =
    useGetActiveThreatsQuery(
      { tenant, start_date, end_date },
      {
        selectFromResult: (result) => ({
          ...result,
          data: result.data?.entities[parseInt(threatId!)],
        }),
      },
    );
  const { data: family } = useGetThreatFamiliesQuery(
    {},
    {
      selectFromResult: (result) => ({
        ...result,
        data: threat && result.data?.entities[threat.family!],
      }),
      skip: !threat,
    },
  );

  const { data: threatEvents, isLoading: threatEventsLoading } =
    usePageThreatEvents();
  const {
    data: threatDetectionMethods,
    isLoading: threatDetectionMethodsLoading,
  } = usePageThreatDetectionMethods();

  if (!threat) return null;

  const stats = [
    {
      label: 'New victims',
      value: activeThreat?.nb_assets?.nb_new_victim || 0,
    },
    {
      label: 'Total victims',
      value: activeThreat?.nb_assets?.nb_victim || 0,
    },
    {
      label: 'New offenders',
      value: activeThreat?.nb_assets?.nb_new_offender || 0,
    },
    {
      label: 'Total offenders',
      value: activeThreat?.nb_assets?.nb_offender || 0,
    },
  ];

  return (
    <>
      {family && (
        <OutletBreadcrumb
          link={getLink(
            'threats_coverage_family',
            family.klass,
            family.pk,
            'family',
          )}
        >
          {family.name}
        </OutletBreadcrumb>
      )}

      <OutletBreadcrumb>{threat.name}</OutletBreadcrumb>
      <DefaultPage
        title={
          threat.user_defined ? <ThreatName threat={threat} /> : threat.name
        }
        description={
          <Markdown
            content={threat.description + ' ' + threat.additional_info}
          />
        }
        stats={stats}
        actions={
          <Row className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                enableTags(dispatch);
                dispatch(
                  addQueryFilter({
                    key: 'stamus.threat_name',
                    value: threat.name,
                  }),
                );
                navigate({ to: '/detection-events' });
              }}
              disabled={!QFBuilder}
            >
              <Binary />
              See events
            </Button>
            <Button
              onClick={() => {
                enableTags(dispatch);
                dispatch(
                  addQueryFilter({
                    key: 'stamus.threat_name',
                    value: threat.name,
                  }),
                );
                navigate({ to: '/explorer' });
              }}
              disabled={!QFBuilder}
            >
              <LayoutDashboard />
              Investigate
            </Button>
          </Row>
        }
      >
        <Tabs
          value={pathname}
          className="mt-8"
        >
          <TabsList>
            <TabsTriggerLink
              value={getLink(
                'threats_coverage_threat',
                threat.family_class,
                threat.pk,
              )}
            >
              Entities
              <TabsBadge
                count={
                  (activeThreat?.nb_assets?.nb_victim || 0) +
                  (activeThreat?.nb_assets?.nb_offender || 0) -
                  (activeThreat?.nb_assets?.nb_both || 0)
                }
                isLoading={activeThreatLoading}
              />
            </TabsTriggerLink>
            <TabsTriggerLink
              value={getLink(
                'threats_coverage_threat_detection_methods',
                threat.family_class,
                threat.pk,
              )}
            >
              Detection Methods
              <TabsBadge
                count={threatDetectionMethods?.count || 0}
                isLoading={threatDetectionMethodsLoading}
              />
            </TabsTriggerLink>
            <TabsTriggerLink
              value={getLink(
                'threats_coverage_threat_events',
                threat.family_class,
                threat.pk,
              )}
            >
              Events
              <TabsBadge
                count={threatEvents?.count || 0}
                isLoading={threatEventsLoading}
              />
            </TabsTriggerLink>
          </TabsList>
        </Tabs>
        <Outlet />
      </DefaultPage>
    </>
  );
};

export const ThreatByIdIndex = ({
  familyClass = 'doc',
}: {
  familyClass?: 'doc' | 'dopv';
}) => {
  const { threatId } = useParams({ strict: false }) as { threatId: string };
  const { tenant } = useGlobalQueryParams(['tenant']);
  const { data: threat } = useGetThreatByIdQuery({
    tenant,
    threatId: threatId!,
  });

  if (!threat) return null;

  return (
    <Column className="mt-6">
      {threatId && threat.family_class === 'doc' && (
        <div className="mb-6">
          <KillChainCountersByThreatId threatId={threatId} />
        </div>
      )}
      <ImpactedEntitiesTable
        threatId={threat.pk}
        familyClass={familyClass}
      />
    </Column>
  );
};

export const ThreatName = ({ threat }: { threat: Threat }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [deleteThreat] = useDeleteThreatMutation();

  if (!threat.user_defined) return threat.name;

  const handleDelete = () => {
    return deleteThreat(threat.pk).unwrap();
  };
  const handleSuccess = () => {
    toast.success('Threat deleted successfully');
    navigate({
      to: getLink(
        'threats_coverage_family',
        threat.family_class,
        threat.family,
        'family',
      ),
    });
  };

  return (
    <Row className="mb-1 items-center gap-2">
      <PageTitle className="mb-0">{threat.name}</PageTitle>
      <Row>
        <Dialog
          open={isEditing}
          onOpenChange={setIsEditing}
        >
          <DialogTrigger>
            <Button
              variant="ghost"
              className="text-muted-foreground h-7 w-7"
            >
              <Edit size={14} />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Edit Custom Threat</DialogTitle>
            <CreateEditThreatForm
              threat={threat}
              handleClose={() => setIsEditing(false)}
              isDoc={threat.family_class === 'doc'}
            />
          </DialogContent>
        </Dialog>
        <DeleteModal
          title={`Delete ${threat.name}`}
          description={`Deleting a Custom Threat will remove all Declarations of ${threat.family_class === 'doc' ? 'Compromise' : 'Policy Violation'} associated with it. It is irreversible.`}
          handleDelete={handleDelete}
          handleSuccess={handleSuccess}
          trigger={
            <Button
              variant="ghost"
              className="text-muted-foreground h-7 w-7"
            >
              <Trash size={14} />
            </Button>
          }
        />
      </Row>
    </Row>
  );
};
