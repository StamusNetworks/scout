import { ArrowDown, ArrowUp, FoldVertical, UnfoldVertical } from 'lucide-react';
import { values } from 'ramda';
import React, { useMemo } from 'react';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
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
  movePanelDown,
  movePanelUp,
  toggleCollapse,
} from '../store/dashboard.slice';
import { dashboard, DashboardItem } from './dashboard.config';
import { ValueListCard } from './dashboard-card';
import { DashboardKeysToggler } from './dashboard-keys-toggler';

export const DashboardPanels = () => {
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
  const config = dashboard[panelId];
  const collapsed = useAppSelector(selectIsPanelCollapsed(panelId));
  const hideEmptyPanels = useAppSelector(selectHideEmptyPanels);
  const { data } = useDashboard();
  const disabledKeys = useAppSelector(selectDisabledKeys);
  const emptyPanel = useMemo(() => {
    const keys = dashboard[panelId].items
      .map((item) => item.i)
      .filter((i) => !disabledKeys.includes(i));
    return keys.every((key) => data?.[key].length === 0);
  }, [data, panelId, disabledKeys]);

  if (!config || (hideEmptyPanels && emptyPanel)) return null;

  return (
    <div
      key={panelId}
      data-testid="dashboard-panel"
      id={panelId}
    >
      <Row className="items-center gap-2">
        <Column className="mt-0.5">
          <MoveUpButton panelId={panelId} />
          <MoveDownButton panelId={panelId} />
        </Column>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="text-sm font-bold">
              {config.title}
            </TooltipTrigger>
            <TooltipContent>{config.tooltip}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <CollapseButton panelId={panelId} />
        <DashboardKeysToggler panelId={panelId} />
      </Row>
      {!collapsed && <DashboardMosaic panelId={panelId} />}
    </div>
  );
};

const DashboardMosaic = ({ panelId }: { panelId: keyof typeof dashboard }) => {
  const disabledKeys = useAppSelector(selectDisabledKeys);

  if (!dashboard[panelId]) return null;

  const rows = splitBlocksIntoRows(
    dashboard[panelId].items as readonly DashboardItem[],
    disabledKeys,
    dashboard[panelId].cols || 4,
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
          {row?.map(({ i, title, tooltip, size }, index: number) => (
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
                  tooltip={tooltip}
                />
              </ResizablePanel>
              {index < row.length - 1 && (
                <ResizableHandle
                  key={index}
                  withHandle
                />
              )}
            </React.Fragment>
          ))}
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
      variant="ghostIcon"
      size="none"
      onClick={() => dispatch(movePanelUp({ panelId }))}
      data-testid="move-panel-up"
      disabled={!canMoveUp}
      className="pb-0"
    >
      <ArrowUp className="size-3!" />
    </Button>
  );
};

const MoveDownButton = ({ panelId }: { panelId: keyof typeof dashboard }) => {
  const dispatch = useAppDispatch();
  const canMoveDown = useAppSelector(selectCanPanelMoveDown(panelId));

  return (
    <Button
      variant="ghostIcon"
      size="none"
      onClick={() => dispatch(movePanelDown({ panelId }))}
      data-testid="move-panel-down"
      disabled={!canMoveDown}
      className="pt-0"
    >
      <ArrowDown className="size-3!" />
    </Button>
  );
};

const CollapseButton = ({ panelId }: { panelId: keyof typeof dashboard }) => {
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector(selectIsPanelCollapsed(panelId));
  return (
    <Button
      variant="ghostIcon"
      size="none"
      onClick={() => dispatch(toggleCollapse(panelId))}
      data-testid="toggle-collapse"
    >
      {collapsed ? <UnfoldVertical /> : <FoldVertical />}
    </Button>
  );
};

const splitBlocksIntoRows = (
  items: readonly DashboardItem[], // All of the blocks in this panel
  disabledKeys: string[], // The keys that are disabled in this panel
  rowSize: number, // The number of blocks per row in this panel
) => {
  // Remove disabled keys
  const filteredItems = items.filter((item) => !disabledKeys.includes(item.i));

  const rows = [];

  for (let i = 0; i < filteredItems.length; i += rowSize) {
    const row = filteredItems.slice(i, i + rowSize);
    rows.push(getRowWithSize(row));
  }

  return rows;
};

const getRowWithSize = (row: DashboardItem[]) => {
  const rowTotalWeight = row.reduce((acc, curr) => acc + (curr.weight || 2), 0);
  return row.map((item) => ({
    ...item,
    size: (100 * (item.weight || 2)) / rowTotalWeight,
  }));
};
