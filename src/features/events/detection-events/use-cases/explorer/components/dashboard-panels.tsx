import { ArrowDown, ArrowUp, FoldVertical, UnfoldVertical } from 'lucide-react';
import { values } from 'ramda';
import React, { useEffect, useMemo } from 'react';

import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import { ButtonGroup } from '@/common/design-system/atoms/ui/button-group';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/common/design-system/atoms/ui/resizable';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/common/design-system/atoms/ui/tooltip';
import { useFeatureFlags } from '@/common/lib/use-feature-flags';
import { getFilterDef } from '@/features/query-filters/constants/query-filter.definition';
import { useAppDispatch, useAppSelector } from '@/store/store';

import { useDashboard } from '../api/hooks/useDashboard';
import {
  selectCanPanelMoveDown,
  selectCanPanelMoveUp,
  selectDisabledKeys,
  selectHideEmptyPanels,
  selectIsPanelCollapsed,
  selectPanelsOrder,
} from '../store/dashboard.selectors';
import {
  initializePanelsOrdering,
  movePanelDown,
  movePanelUp,
  toggleCollapse,
} from '../store/dashboard.slice';
import { ValueListCard } from './dashboard-card';
import { DashboardKeysToggler } from './dashboard-keys-toggler';
import { CEdashboard, dashboard, DashboardItem } from './dashboard.config';

export const DashboardPanels = () => {
  const dispatch = useAppDispatch();
  const { enterprise } = useFeatureFlags();
  useEffect(() => {
    dispatch(initializePanelsOrdering({ enterprise }));
  }, [dispatch, enterprise]);

  const sortedPanelsIds = useAppSelector(selectPanelsOrder);
  const hideEmptyPanels = useAppSelector(selectHideEmptyPanels);
  const { data, isLoading, isFetching, isError } = useDashboard();
  const isEmpty = useMemo(() => {
    return values(data || {}).every((block) => block.length === 0);
  }, [data]);

  if (isLoading) return <Spin />;
  if (hideEmptyPanels && isEmpty && !isFetching)
    return <div>There is no data for the current filters</div>;
  if (isError) {
    return <div>There was an error while fetching the data</div>;
  }
  return (
    <>
      {sortedPanelsIds.map((panelId) => (
        <DashboardPanel
          key={panelId}
          panelId={panelId}
        />
      ))}
    </>
  );
};

export const DashboardPanel = ({
  panelId,
}: {
  panelId: keyof typeof dashboard;
}) => {
  const { enterprise } = useFeatureFlags();
  const config = enterprise ? dashboard[panelId] : CEdashboard[panelId];
  const collapsed = useAppSelector(selectIsPanelCollapsed(panelId));
  const hideEmptyPanels = useAppSelector(selectHideEmptyPanels);
  const { data } = useDashboard();
  const disabledKeys = useAppSelector(selectDisabledKeys);
  const emptyPanel = useMemo(() => {
    const keys = config.items
      .map((item) => item.i)
      .filter((i) => !disabledKeys.includes(i));
    return keys.every((key) => data?.[key].length === 0);
  }, [data, disabledKeys, config.items]);

  if (!config) return null;

  return (
    <div
      key={panelId}
      data-testid="dashboard-panel"
      id={panelId}
    >
      <Row className="items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="text-sm font-bold">
              {config.title}
            </TooltipTrigger>
            <TooltipContent>{config.tooltip}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <ButtonGroup>
          <MoveUpButton panelId={panelId} />
          <MoveDownButton panelId={panelId} />
          <CollapseButton panelId={panelId} />
          <DashboardKeysToggler panelId={panelId} />
        </ButtonGroup>
      </Row>
      {!collapsed && !(hideEmptyPanels && emptyPanel) && (
        <DashboardMosaic panelId={panelId} />
      )}
    </div>
  );
};

const DashboardMosaic = ({ panelId }: { panelId: keyof typeof dashboard }) => {
  const disabledKeys = useAppSelector(selectDisabledKeys);
  const { enterprise } = useFeatureFlags();
  const config = enterprise ? dashboard[panelId] : CEdashboard[panelId];

  if (!config) return null;

  const rows = splitBlocksIntoRows(
    config.items as readonly DashboardItem[],
    disabledKeys,
    config.cols || 4,
  );

  return (
    <div
      className="mt-1"
      data-testid="dashboard-mosaic"
    >
      {rows?.map((row, id) => (
        <ResizablePanelGroup
          key={id}
          direction="horizontal"
          className="border"
        >
          {row?.map(({ i, title, size }, index: number) => {
            const tooltip = getFilterDef(i)?.description;
            return (
              <React.Fragment key={i + '-' + index}>
                {/* index as key otherwise the resize feature breaks when
              removing/adding blocks */}
                <ResizablePanel
                  key={i + '-block-' + index}
                  defaultSize={size}
                >
                  <ValueListCard
                    key={i}
                    es_key={i}
                    title={title}
                    tooltip={tooltip || ''}
                  />
                </ResizablePanel>
                {index < row.length - 1 && (
                  <ResizableHandle
                    key={index}
                    withHandle
                  />
                )}
              </React.Fragment>
            );
          })}
        </ResizablePanelGroup>
      ))}
    </div>
  );
};

const MoveUpButton = ({ panelId }: { panelId: keyof typeof dashboard }) => {
  const dispatch = useAppDispatch();
  const canMoveUp = useAppSelector(selectCanPanelMoveUp(panelId));

  return (
    <Button
      variant="outline"
      size="icon-xs"
      onClick={() => dispatch(movePanelUp({ panelId }))}
      data-testid="move-panel-up"
      disabled={!canMoveUp}
      className="text-muted-foreground hover:text-foreground"
    >
      <ArrowUp className="size-4!" />
    </Button>
  );
};

const MoveDownButton = ({ panelId }: { panelId: keyof typeof dashboard }) => {
  const dispatch = useAppDispatch();
  const canMoveDown = useAppSelector(selectCanPanelMoveDown(panelId));

  return (
    <Button
      variant="outline"
      size="icon-xs"
      onClick={() => dispatch(movePanelDown({ panelId }))}
      data-testid="move-panel-down"
      disabled={!canMoveDown}
      className="text-muted-foreground hover:text-foreground"
    >
      <ArrowDown className="size-4!" />
    </Button>
  );
};

const CollapseButton = ({ panelId }: { panelId: keyof typeof dashboard }) => {
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector(selectIsPanelCollapsed(panelId));
  return (
    <Button
      variant="outline"
      size="icon-xs"
      onClick={() => dispatch(toggleCollapse(panelId))}
      data-testid="toggle-collapse"
      className="text-muted-foreground hover:text-foreground"
    >
      {collapsed ? <UnfoldVertical /> : <FoldVertical />}
    </Button>
  );
};

type DashboardItemWithSize = DashboardItem & { size: number };

const splitBlocksIntoRows = (
  items: readonly DashboardItem[], // All of the blocks in this panel
  disabledKeys: string[], // The keys that are disabled in this panel
  maxColumns: number, // The maximum number of blocks per row in this panel
) => {
  // Remove disabled keys
  const filteredItems = items.filter((item) => !disabledKeys.includes(item.i));

  const rows: DashboardItemWithSize[][] = [];
  const MAX_ROW_WEIGHT = 24;

  let currentRow: DashboardItem[] = [];
  let currentRowWeight = 0;

  for (const item of filteredItems) {
    const itemWeight = item.weight || MAX_ROW_WEIGHT / maxColumns;

    // If adding this item would exceed max weight or max columns, start a new row
    if (
      currentRow.length > 0 &&
      (currentRow.length >= maxColumns ||
        currentRowWeight + itemWeight > MAX_ROW_WEIGHT)
    ) {
      rows.push(getRowWithSize(currentRow));
      currentRow = [];
      currentRowWeight = 0;
    }

    currentRow.push(item);
    currentRowWeight += itemWeight;
  }

  // Add the last row if it has items
  if (currentRow.length > 0) {
    rows.push(getRowWithSize(currentRow));
  }

  return rows;
};

const getRowWithSize = (row: DashboardItem[]): DashboardItemWithSize[] => {
  const rowTotalWeight = row.reduce((acc, curr) => acc + (curr.weight || 2), 0);
  return row.map((item) => ({
    ...item,
    size: (100 * (item.weight || 2)) / rowTotalWeight,
  }));
};
