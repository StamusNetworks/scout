import { useLocation } from '@tanstack/react-router';
import {
  CircleX,
  LucideIcon,
  PlusCircle,
  Save,
  WandSparkles,
} from 'lucide-react';
import { Reorder } from 'motion/react';
import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import { Checkbox } from '@/common/design-system/atoms/ui/checkbox';
import { ScrollArea } from '@/common/design-system/atoms/ui/scroll-area';
import { Separator } from '@/common/design-system/atoms/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/common/design-system/atoms/ui/tooltip';
import { startsWithOneOf } from '@/common/lib/strings';
import { cn } from '@/common/lib/utils';
import {
  FilterActionsDropdown,
  useSupportedFilters,
} from '@/features/filter-actions';
import {
  SideBarQueryFilterSets,
  useSaveFilterSetModal,
} from '@/features/filter-sets';
import { useWithAlertsParam } from '@/features/host-insights';
import { Investigation, useInvestigationStage } from '@/features/investigation';
import { useIsEnterprise } from '@/features/settings';
import { useAutoOpenSidebarOnNavigation } from '@/features/preferences';
import {
  selectIsSidebarOpen,
  setIsSidebarOpen,
  setOpenModal,
} from '@/features/ui/ui-state.slice';
import { useAppSelector } from '@/store/store';

import { FilterCategory } from '../../definitions/query-filter.config';
import { getFilterDef } from '../../definitions/query-filter.definitions';
import { useClearFilters } from '../../hooks/use-clear-filters';
import { useFilterFlagsRepository } from '../../hooks/use-filter-flags-repository';
import { useReorderFilters } from '../../hooks/use-reorder-filters';
import { useSuspendFilter } from '../../hooks/use-suspend-filter';
import { AlertTagFlags, EventTypeFlags } from '../../model/filter-flags';
import { QueryFilterState } from '../../model/query-filter';
import {
  selectGatedFilterFlags,
  selectQueryFilters,
} from '../../state/query-filters.selectors';
import { SideBarFilter } from './sidebar-filter';
import { SidebarQueryFilter } from './sidebar-query-filter';

const eventsTypes = [
  {
    label: 'Alerts',
    key: 'alert',
  },
  {
    label: 'Stamus',
    key: 'stamus',
  },
  {
    label: 'Sightings',
    key: 'discovery',
  },
] satisfies { label: string; key: keyof EventTypeFlags }[];

const tags = [
  {
    label: 'Informational',
    key: 'informational',
  },
  {
    label: 'Relevant',
    key: 'relevant',
  },
  {
    label: 'Untagged',
    key: 'untagged',
  },
] satisfies { label: string; key: keyof AlertTagFlags }[];

export const SidebarActionIcon = ({ type: Type }: { type: LucideIcon }) => {
  return (
    <Type className="size-3.5! cursor-pointer opacity-50 hover:opacity-100" />
  );
};

type SidebarFeature = 'outliers' | 'events' | 'tags' | 'query_filters';
type SideBarConfig = {
  enabled: SidebarFeature[] | false;
  filterTypes: (typeof FilterCategory)[keyof typeof FilterCategory][];
  getIsInapplicable?: (filters: QueryFilterState) => boolean;
};

export const FiltersSideBar = () => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const saveFilterSetModal = useSaveFilterSetModal();
  const flags = useSelector(selectGatedFilterFlags);
  const queryFilters = useSelector(selectQueryFilters);
  const isOpen = useAppSelector(selectIsSidebarOpen);
  const filterActionSupportedFilters = useSupportedFilters();
  const autoOpenSidebarOnNavigation = useAutoOpenSidebarOnNavigation();
  const enterprise = useIsEnterprise();
  const [withAlerts] = useWithAlertsParam();
  const clearFilters = useClearFilters();
  const reorderFilters = useReorderFilters();
  const { clearSuspended } = useSuspendFilter();
  const tagFiltersRepo = useFilterFlagsRepository();

  const sideBarConfigPerPage: Partial<Record<string, SideBarConfig>> = useMemo(
    () => ({
      '/explorer': {
        enabled: ['outliers', 'events', 'tags', 'query_filters'],
        filterTypes: [FilterCategory.EVENT, FilterCategory.HOST],
      },
      '/attack-surface': {
        enabled: ['query_filters'],
        filterTypes: [FilterCategory.HOST],
      },
      '/attack-surface/inventory': {
        enabled: ['query_filters'],
        filterTypes: [FilterCategory.HOST],
      },
      '/hosts': {
        enabled: withAlerts
          ? ['outliers', 'events', 'tags', 'query_filters']
          : ['query_filters'],
        filterTypes: [
          FilterCategory.HOST,
          ...(withAlerts ? [FilterCategory.EVENT] : []),
        ],
      },
      '/detection-events': {
        enabled: ['outliers', 'events', 'tags', 'query_filters'],
        filterTypes: [FilterCategory.EVENT, FilterCategory.HOST],
      },
      '/events-flow': {
        enabled: ['outliers', 'events', 'tags', 'query_filters'],
        filterTypes: [FilterCategory.EVENT],
      },
      '/detection-methods': {
        enabled: ['outliers', 'events', 'tags', 'query_filters'],
        filterTypes: [FilterCategory.SIGNATURE, FilterCategory.EVENT],
        getIsInapplicable: (filter) => {
          if (filter.key === 'alert.signature_id') return false;
          const def = getFilterDef(filter.key);
          return !withAlerts
            ? def?.category !== FilterCategory.SIGNATURE
            : def?.category !== FilterCategory.SIGNATURE &&
                def?.category !== FilterCategory.EVENT;
        },
      },
      '/filters-actions': {
        enabled: ['outliers', 'events', 'tags', 'query_filters'],
        filterTypes: [FilterCategory.EVENT, FilterCategory.SIGNATURE],
        getIsInapplicable: (filter) =>
          !filterActionSupportedFilters.includes(filter.key),
      },
      '/filter-sets': {
        enabled: ['outliers', 'events', 'tags', 'query_filters'],
        filterTypes: [
          FilterCategory.EVENT,
          FilterCategory.SIGNATURE,
          FilterCategory.HOST,
        ],
      },
      '/network-events': {
        enabled: ['query_filters'],
        filterTypes: [FilterCategory.EVENT],
        getIsInapplicable: (filter) =>
          startsWithOneOf(filter.key, ['alert.', 'stamus.', 'discovery.']),
      },
    }),
    [withAlerts, filterActionSupportedFilters],
  );

  const sideBarConfig = sideBarConfigPerPage[pathname];

  useEffect(() => {
    if (!autoOpenSidebarOnNavigation) return;
    if (sideBarConfig?.enabled) {
      dispatch(setIsSidebarOpen(true));
    } else {
      dispatch(setIsSidebarOpen(false));
    }
  }, [sideBarConfig?.enabled, dispatch, autoOpenSidebarOnNavigation]);

  const investigationStage = useInvestigationStage();

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'g' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        dispatch(setIsSidebarOpen(!isOpen));
      }
    },
    [isOpen, dispatch],
  );

  useEffect(() => {
    // attach the event listener
    document.addEventListener('keydown', handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  const filterSetActions = [
    {
      key: 'add-filter',
      label: 'Add filter',
      render: (
        <button onClick={() => dispatch(setOpenModal('addFilterCommand'))}>
          <SidebarActionIcon type={PlusCircle} />
        </button>
      ),
    },
    {
      key: 'save-filter-set',
      label: 'Save Filter Set',
      render: (
        <button
          onClick={() => {
            saveFilterSetModal.open();
          }}
        >
          <SidebarActionIcon type={Save} />
        </button>
      ),
    },
    {
      key: 'create-filter-actions',
      label: 'Create filter actions',
      render: (
        <FilterActionsDropdown
          trigger={() => (
            <button>
              <SidebarActionIcon type={WandSparkles} />
            </button>
          )}
        />
      ),
    },
    {
      key: 'clear-filters',
      label: 'Clear filters',
      render: (
        <button onClick={() => clearFilters()}>
          <SidebarActionIcon type={CircleX} />
        </button>
      ),
    },
  ];

  return (
    <ScrollArea
      className={`${isOpen ? 'w-72' : 'w-0'} relative h-[calc(100vh-48px)] shrink-0 grow-0 overflow-clip border-l transition-all duration-200 ease-in-out`}
    >
      <div className="max-w-72 p-3 pb-5">
        {flags && enterprise && (
          <>
            <div className="w-full">
              <div className="mb-2">
                <SideBarHeader>Global Filters</SideBarHeader>
                <SideBarFilter
                  label="Outlier events"
                  checked={flags.novelty}
                  onChange={(next) => tagFiltersRepo.setNovelty(next)}
                  disabled={
                    !sideBarConfig?.filterTypes.includes(
                      FilterCategory.EVENT,
                    ) || !isEnabled(pathname, 'outliers', sideBarConfigPerPage)
                  }
                  type="switch"
                />
              </div>
              <div className="mb-2">
                <h3 className="text-muted-foreground mb-1 text-[0.75rem]">
                  Event types
                </h3>
                {eventsTypes.map((f) => (
                  <SideBarFilter
                    key={f.key}
                    label={f.label}
                    checked={flags.eventTypes[f.key]}
                    onChange={(next) =>
                      tagFiltersRepo.setEventTypes({ [f.key]: next })
                    }
                    disabled={
                      !sideBarConfig?.filterTypes.includes(
                        FilterCategory.EVENT,
                      ) || !isEnabled(pathname, 'events', sideBarConfigPerPage)
                    }
                  />
                ))}
              </div>
              <div>
                <h3 className="text-muted-foreground mb-1 text-[0.75rem]">
                  Alert tags
                </h3>
                {tags.map((f) => (
                  <label
                    key={f.key}
                    className={cn(
                      'flex items-center gap-2',
                      !sideBarConfig?.filterTypes.includes(
                        FilterCategory.EVENT,
                      ) ||
                        (!isEnabled(pathname, 'tags', sideBarConfigPerPage) &&
                          'text-muted-foreground'),
                    )}
                  >
                    <Checkbox
                      checked={flags.alertTags[f.key]}
                      onCheckedChange={() =>
                        tagFiltersRepo.setAlertTags({
                          [f.key]: !flags.alertTags[f.key],
                        })
                      }
                      disabled={
                        !sideBarConfig?.filterTypes.includes(
                          FilterCategory.EVENT,
                        ) || !isEnabled(pathname, 'tags', sideBarConfigPerPage)
                      }
                    />
                    <div
                      className="size-2 rounded-full bg-(--bg)"
                      style={
                        { '--bg': `var(--${f.key})` } as React.CSSProperties
                      }
                    />
                    <p
                      className={cn(
                        'text-sm',
                        !isEnabled(pathname, 'tags', sideBarConfigPerPage) &&
                          'text-muted-foreground',
                      )}
                    >
                      {f.label}
                    </p>
                  </label>
                ))}
              </div>
            </div>
            <Separator className="my-3" />
          </>
        )}
        <Column>
          <Row className="justify-between">
            <SideBarHeader>Query filters</SideBarHeader>
            <Row className="items-center gap-3">
              {filterSetActions.map(({ render, key, label }) => (
                <TooltipProvider key={key}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span key={key}>{render}</span>
                    </TooltipTrigger>
                    <TooltipContent>{label}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </Row>
          </Row>
          <Column>
            <Column className="gap-1">
              <Reorder.Group
                axis="y"
                values={queryFilters}
                onReorder={(newFilters: QueryFilterState[]) => {
                  reorderFilters(newFilters);
                }}
              >
                <SideBarSubHeader>Active filters</SideBarSubHeader>
                {queryFilters
                  .filter((item) => !item.isSuspended)
                  .map((item) => {
                    const def = getFilterDef(item.key);
                    return (
                      <Reorder.Item
                        key={item.id}
                        value={item}
                      >
                        <SidebarQueryFilter
                          key={item.id}
                          className="mb-1"
                          filter={item}
                          variant={
                            (def?.category &&
                              (!sideBarConfig?.filterTypes?.includes(
                                def?.category,
                              ) ||
                                !isEnabled(
                                  pathname,
                                  'query_filters',
                                  sideBarConfigPerPage,
                                ))) ||
                            sideBarConfig?.getIsInapplicable?.(item)
                              ? 'suspended'
                              : 'default'
                          }
                        />
                      </Reorder.Item>
                    );
                  })}
                <Row className="items-center justify-between">
                  <SideBarSubHeader>Suspended filters</SideBarSubHeader>
                  <Button
                    variant="ghost"
                    size="xs"
                    className="text-muted-foreground"
                    onClick={() => clearSuspended()}
                  >
                    Clear
                  </Button>
                </Row>
                {queryFilters
                  .filter((item) => item.isSuspended)
                  .map((item) => (
                    <Reorder.Item
                      key={item.id}
                      value={item}
                    >
                      <SidebarQueryFilter
                        key={item.id}
                        className="mb-1"
                        filter={item}
                        variant="suspended"
                      />
                    </Reorder.Item>
                  ))}
              </Reorder.Group>
            </Column>
          </Column>
        </Column>
        {investigationStage !== null && (
          <>
            <Separator className="my-3" />
            <Investigation />
          </>
        )}
        <Separator className="my-3" />
        <SideBarQueryFilterSets />
      </div>
    </ScrollArea>
  );
};

const isEnabled = (
  pathname: string,
  feature: SidebarFeature,
  sideBarConfigPerPage: Partial<Record<string, SideBarConfig>>,
) => {
  const config = sideBarConfigPerPage[pathname];
  if (!config?.enabled) {
    return false;
  }
  return config.enabled.includes(feature);
};

export const SideBarHeader = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mb-1 text-sm font-bold">{children}</h2>
);

export const SideBarSubHeader = ({
  children,
}: {
  children: React.ReactNode;
}) => <h3 className="mb-1 text-xs">{children}</h3>;
