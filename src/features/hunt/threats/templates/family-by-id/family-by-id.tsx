import { Binary, Info, LayoutDashboard, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';

import { DefaultPage } from '@/common/design-system/atoms/default-page';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Markdown } from '@/common/design-system/atoms/markdown';
import { PageTitle } from '@/common/design-system/atoms/page-header';
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
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { ImpactedEntitiesTable } from '@/features/hunt/entities/components/impacted-entities-table/impacted-entities-table';
import { useQFBuilder } from '@/features/hunt/filtering/query-filters/hooks/use-qf-builder';
import { addQueryFilter } from '@/features/hunt/filtering/query-filters/store/query-filters.slice';
import { enableTags } from '@/features/hunt/filtering/query-filters/use-cases/enable-tags';
import { KillChainCountersByFamilyId } from '@/features/hunt/killchain/components/killchain-counters/killchain-counters';
import {
  useGetActiveThreatFamiliesQuery,
  useGetThreatFamiliesQuery,
} from '@/features/hunt/threats/api/threats.api';
import { CreateEditThreatForm } from '@/features/hunt/threats/components/create-edit-threat-form';
import { ThreatFamily } from '@/features/hunt/threats/model/threat-family.model';
import { FamilyActiveThreats } from '@/features/hunt/threats/templates/family-active-threats';
import { routes } from '@/pages/routes.config';
import { useAppDispatch } from '@/store/store';

import { useFamilyDetectionMethods } from '../../hooks/use-family-detection-methods';
import { useFamilyEvents } from '../../hooks/use-family-events';

const usePageFamilyEvents = () => {
  const { familyId } = useParams();
  const [pagination] = usePaginationUrlState();
  const [, , ordering] = useSortingUrlState();
  return useFamilyEvents({
    familyId: familyId!,
    pagination,
    ordering,
  });
};

const usePageFamilyDetectionMethods = () => {
  const { familyId } = useParams();
  const [pagination] = usePaginationUrlState();
  const [, , ordering] = useSortingUrlState();
  return useFamilyDetectionMethods({
    familyId: familyId!,
    pagination,
    ordering,
  });
};

const getLink = (slug: string, familyClass: 'doc' | 'dopv', familyId: number) =>
  routes[
    (familyClass === 'doc'
      ? slug
      : slug.replace('threats', 'policy_violations')) as keyof typeof routes
  ].replace(':familyId', familyId.toString());

export const ThreatFamilyById = () => {
  const { familyId } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const QFBuilder = useQFBuilder();

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

  const stats = [
    {
      label: 'New victims',
      value: activeThreatFamily?.nb_assets?.nb_victim || 0,
    },
    {
      label: 'Total victims',
      value: activeThreatFamily?.nb_assets?.nb_victim || 0,
    },
    {
      label: 'New offenders',
      value: activeThreatFamily?.nb_assets?.nb_offender || 0,
    },
    {
      label: 'Total offenders',
      value: activeThreatFamily?.nb_assets?.nb_offender || 0,
    },
  ];

  if (!threatFamily) return null;

  return (
    <>
      <OutletBreadcrumb>{threatFamily.name}</OutletBreadcrumb>
      <DefaultPage
        title={
          <Row className="items-center">
            <ThreatFamilyName family={threatFamily} />
            {(threatFamily.pk === 1 || threatFamily.pk === 25) && (
              <Row className="bg-primary text-primary-foreground ml-3 w-fit rounded-md border px-2 py-1 text-xs">
                <Info className="mr-2" />
                Links might be broken in preview mode.
              </Row>
            )}
          </Row>
        }
        description={<Markdown content={threatFamily.description} />}
        stats={stats}
        actions={
          <Row className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                enableTags(dispatch);
                dispatch(
                  addQueryFilter(
                    QFBuilder.createFilter(
                      'stamus.family_name',
                      threatFamily.name,
                    ),
                  ),
                );
                navigate(routes.events);
              }}
            >
              <Binary />
              See events
            </Button>
            <Button
              onClick={() => {
                enableTags(dispatch);
                dispatch(
                  addQueryFilter({
                    key: 'stamus.family_name',
                    value: threatFamily.name,
                  }),
                );
                navigate(routes.explorer);
              }}
            >
              <LayoutDashboard />
              Investigate
            </Button>
          </Row>
        }
      >
        <FamilyActiveThreats familyId={parseInt(familyId!)} />
        <Tabs
          value={pathname}
          className="mt-4"
        >
          <TabsList>
            <TabsTriggerLink
              value={getLink(
                'threats_coverage_family',
                threatFamily.klass,
                threatFamily.pk,
              )}
            >
              Entities
              <TabsBadge
                count={
                  (activeThreatFamily?.nb_assets?.nb_victim || 0) +
                  (activeThreatFamily?.nb_assets?.nb_offender || 0) -
                  (activeThreatFamily?.nb_assets?.nb_both || 0)
                }
                isLoading={activeThreatFamilyLoading}
              />
            </TabsTriggerLink>
            <TabsTriggerLink
              value={getLink(
                'threats_coverage_family_detection_methods',
                threatFamily.klass,
                threatFamily.pk,
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
                threatFamily.klass,
                threatFamily.pk,
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
                threatFamily.klass,
                threatFamily.pk,
              )}
            >
              {threatFamily.klass === 'doc' ? 'Threats' : 'Policy Violations'}
            </TabsTriggerLink>
          </TabsList>
          <div className="pt-4">
            <Outlet />
          </div>
        </Tabs>
      </DefaultPage>
    </>
  );
};

export const ThreatFamilyDefault = () => {
  const { familyId } = useParams();
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
      {familyId && family?.klass === 'doc' && (
        <KillChainCountersByFamilyId
          className="mb-6"
          familyId={familyId}
        />
      )}
      <ImpactedEntitiesTable
        familyId={parseInt(familyId!)}
        familyClass={'doc'}
      />
    </>
  );
};

export const ThreatFamilyName = ({ family }: { family: ThreatFamily }) => {
  const [isEditing, setIsEditing] = useState(false);
  if (family.pk !== 1 && family.pk !== 25)
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
            <DialogTitle>Create Custom Threat</DialogTitle>
            <CreateEditThreatForm
              handleClose={() => setIsEditing(false)}
              isDoc={family.klass === 'doc'}
            />
          </DialogContent>
        </Dialog>
      </Row>
    </Row>
  );
};
