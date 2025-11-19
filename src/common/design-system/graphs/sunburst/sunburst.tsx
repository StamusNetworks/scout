import * as d3 from 'd3';
import { useRef, useState } from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/common/design-system/molecules/tooltip';

import { useApplyTheme } from './use-apply-theme';
import { useDrawGraph } from './use-draw-graph';
import { useZoomTransition } from './use-zoom-transition';

// Generic interface for sunburst data nodes
export type SunburstNode<T = Record<string, unknown>> = {
  name: string;
  value?: number;
  path: string;
  children?: SunburstNode<T>[];
} & T;

interface SunburstGraphProps<T = Record<string, unknown>> {
  data: SunburstNode<T>;
  onNodeClick?: (
    d: MouseEvent,
    p: d3.HierarchyRectangularNode<SunburstNode<T>>,
  ) => void;
  renderTooltip?: (treeNode: SunburstNode<T> | undefined) => JSX.Element | null;
  selectedNode: string | null | undefined;
  onSelectionChange?: (path: string | null) => void;
}

export function SunburstGraph<T = Record<string, unknown>>({
  data,
  onNodeClick,
  renderTooltip,
  selectedNode,
  onSelectionChange,
}: SunburstGraphProps<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const [tooltipData, setTooltipData] = useState<SunburstNode<T> | null>(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  // const handleClick = useCallback(
  //   (event: MouseEvent, p: d3.HierarchyRectangularNode<SunburstNode<T>>) => {
  //     onNodeClick?.(event, p);
  //     onSelectionChange?.(p.data.path || 'root');
  //   },
  //   [onNodeClick, onSelectionChange],
  // );

  const {
    rootRef,
    // hierarchyRef,
    arcRef,
    // colorRef,
    svgRef,
    pathRef,
    labelRef,
    parentRef,
    parentLabelRef,
    radiusRef,
    graphReady,
    targetNode,
  } = useDrawGraph({
    ref,
    data,
    onNodeClick,
    renderTooltip,
    selectedNode,
    onSelectionChange,
    setTooltipData,
    setTooltipOpen,
  });

  useZoomTransition({
    graphReady,
    targetNode,
    rootRef,
    svgRef,
    pathRef,
    labelRef,
    parentRef,
    parentLabelRef,
    radiusRef,
    arcRef,
    data,
  });

  useApplyTheme({
    graphReady,
    parentLabelRef,
    labelRef,
  });

  if (!renderTooltip) {
    return (
      <div
        ref={ref}
        className="mx-auto w-full max-w-[1000px]"
      />
    );
  }

  return (
    <Tooltip
      open={tooltipOpen}
      onOpenChange={setTooltipOpen}
    >
      <TooltipTrigger asChild>
        <div
          ref={ref}
          className="mx-auto w-full max-w-[1000px]"
        />
      </TooltipTrigger>
      <TooltipContent>
        {tooltipData && renderTooltip(tooltipData)}
      </TooltipContent>
    </Tooltip>
  );
}
