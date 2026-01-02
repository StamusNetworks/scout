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
import { useLocation } from 'react-router-dom';

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
import { useWithAlertsParam } from '@/features/analytics/hosts/components/hostsTable/use-with-alerts-param';
import { FilterActionsDropdown } from '@/features/hunt/filter-actions/components/filter-actions/filter-actions.dropdown';
import { useSupportedFilterActionsFilters } from '@/features/hunt/filter-actions/utils/get-supported-filters';
import { Investigation } from '@/features/hunt/investigation/components/ongoing-investigation/ongoing-investigation';
import { selectInvestigationStage } from '@/features/hunt/investigation/investigation.slice';
import { selectAutoOpenSidebarOnNavigation } from '@/features/ui/preferences/preferences.slice';
import {
  selectIsSidebarOpen,
  setIsSidebarOpen,
  setOpenModal,
} from '@/features/ui/ui-state.slice';
import { selectIsEnterprise } from '@/features/user/settings/settings.slice';
import { routes } from '@/pages/routes.config';
import { useAppSelector } from '@/store/store';

import { FilterCategory } from '../constants/query-filter.config';
import { getFilterDef } from '../constants/query-filter.definition';
import { QueryFilterState } from '../model/query-filter';
import { selectTagFilters } from '../store/query-filters.selector';
import { selectQueryFilters } from '../store/query-filters.selector';
import {
  AlertTags,
  EventTypes,
  updateTagFilters,
} from '../store/query-filters.slice';
import {
  clearQueryFilters,
  clearSuspendedFilters,
  reorderQueryFilters,
} from '../store/query-filters.slice';
import { openSaveFilterSetModal } from './save-filterset/save-filterset.slice';
import { SideBarFilter } from './side-bar-filter';
import { SidebarQueryFilter } from './side-bar-query-filter';
import { SideBarQueryFilterSets } from './side-bar-query-filter-sets/side-bar-query-filter-sets';

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
] satisfies { label: string; key: keyof EventTypes }[];

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
] satisfies { label: string; key: keyof AlertTags }[];

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
  const tagFilters = useSelector(selectTagFilters);
  const queryFilters = useSelector(selectQueryFilters);
  const isOpen = useAppSelector(selectIsSidebarOpen);
  const filterActionSupportedFilters = useSupportedFilterActionsFilters();
  const autoOpenSidebarOnNavigation = useAppSelector(
    selectAutoOpenSidebarOnNavigation,
  );
  const enterprise = useAppSelector(selectIsEnterprise);
  const [withAlerts] = useWithAlertsParam();

  const sideBarConfigPerPage: Partial<
    Record<(typeof routes)[keyof typeof routes], SideBarConfig>
  > = useMemo(
    () => ({
      [routes.explorer]: {
        enabled: ['outliers', 'events', 'tags', 'query_filters'],
        filterTypes: [FilterCategory.EVENT, FilterCategory.HOST],
      },
      [routes.attack_surface]: {
        enabled: ['query_filters'],
        filterTypes: [FilterCategory.HOST],
      },
      [routes.attack_surface_inventory]: {
        enabled: ['query_filters'],
        filterTypes: [FilterCategory.HOST],
      },
      [routes.hosts]: {
        enabled: withAlerts
          ? ['outliers', 'events', 'tags', 'query_filters']
          : ['query_filters'],
        filterTypes: [
          FilterCategory.HOST,
          ...(withAlerts ? [FilterCategory.EVENT] : []),
        ],
      },
      [routes.events]: {
        enabled: ['outliers', 'events', 'tags', 'query_filters'],
        filterTypes: [FilterCategory.EVENT, FilterCategory.HOST],
      },
      [routes.detection_methods]: {
        enabled: ['outliers', 'events', 'tags', 'query_filters'],
        filterTypes: [
          FilterCategory.SIGNATURE,
          ...(withAlerts ? [FilterCategory.EVENT] : []),
        ],
      },
      [routes.filters_actions]: {
        enabled: ['outliers', 'events', 'tags', 'query_filters'],
        filterTypes: [FilterCategory.EVENT, FilterCategory.SIGNATURE],
        getIsInapplicable: (filter) =>
          !filterActionSupportedFilters.includes(filter.key),
      },
      [routes.filter_sets]: {
        enabled: ['outliers', 'events', 'tags', 'query_filters'],
        filterTypes: [
          FilterCategory.EVENT,
          FilterCategory.SIGNATURE,
          FilterCategory.HOST,
        ],
      },
      [routes.session_events]: {
        enabled: ['query_filters'],
        filterTypes: [FilterCategory.EVENT],
        getIsInapplicable: (filter) =>
          startsWithOneOf(filter.key, ['alert.', 'stamus.', 'discovery.']),
      },
    }),
    [withAlerts, filterActionSupportedFilters],
  );

  const sideBarConfig =
    sideBarConfigPerPage[pathname as (typeof routes)[keyof typeof routes]];

  useEffect(() => {
    if (!autoOpenSidebarOnNavigation) return;
    if (sideBarConfig?.enabled) {
      dispatch(setIsSidebarOpen(true));
    } else {
      dispatch(setIsSidebarOpen(false));
    }
  }, [sideBarConfig?.enabled, dispatch, autoOpenSidebarOnNavigation]);

  const investigationStage = useAppSelector(selectInvestigationStage);

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
            dispatch(openSaveFilterSetModal());
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
          trigger={(disabled) => (
            <button disabled={disabled}>
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
        <button onClick={() => dispatch(clearQueryFilters())}>
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
        {tagFilters && enterprise && (
          <>
            <div className="w-full">
              <div className="mb-2">
                <SideBarHeader>Global Filters</SideBarHeader>
                <SideBarFilter
                  filter_key="novelty"
                  label="Outlier events"
                  dispatch={dispatch}
                  checked={tagFilters.novelty}
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
                    filter_key={f.key}
                    label={f.label}
                    dispatch={dispatch}
                    checked={tagFilters[f.key]}
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
                      checked={tagFilters[f.key]}
                      onCheckedChange={() =>
                        dispatch(
                          updateTagFilters({ [f.key]: !tagFilters[f.key] }),
                        )
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
                  dispatch(reorderQueryFilters(newFilters));
                }}
              >
                <SideBarSubHeader>Active filters</SideBarSubHeader>
                {queryFilters
                  .filter((item) => !item.is_suspended)
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
                    onClick={() => dispatch(clearSuspendedFilters())}
                  >
                    Clear
                  </Button>
                </Row>
                {queryFilters
                  .filter((item) => item.is_suspended)
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
  sideBarConfigPerPage: Partial<
    Record<(typeof routes)[keyof typeof routes], SideBarConfig>
  >,
) => {
  const config =
    sideBarConfigPerPage[pathname as (typeof routes)[keyof typeof routes]];
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
