import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Sankey } from 'recharts';
import type { LinkProps, NodeProps } from 'recharts/types/chart/Sankey';

import { cn } from '@/common/lib/utils';

export interface SankeyNodeInfo {
  name: string;
  value: number;
  columnIndex: number;
  columnTitle?: string;
}

export interface SankeyChartData {
  nodes: {
    name: string;
    value: number;
    columnIndex?: number;
    columnTitle?: string;
  }[];
  links: { source: number; target: number; value: number }[];
  /** Complete root-to-leaf paths (as node indices) from the original aggregation tree. */
  paths: number[][];
}

interface SankeyChartProps {
  data: SankeyChartData;
  height?: number;
  className?: string;
  onNodeClick?: (node: SankeyNodeInfo) => void;
  onNodeRightClick?: (node: SankeyNodeInfo) => void;
}

type TooltipState =
  | {
      x: number;
      y: number;
      kind: 'link';
      sourceName: string;
      targetName: string;
      value: number;
    }
  | {
      x: number;
      y: number;
      kind: 'node';
      name: string;
      columnTitle: string;
      value: number;
    }
  | null;

const COLUMN_COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
];

function getColumnColor(columnIndex?: number): string {
  if (columnIndex == null) return COLUMN_COLORS[0];
  return COLUMN_COLORS[columnIndex % COLUMN_COLORS.length];
}

function truncateLabel(text: string | number, maxLength = 24): string {
  if (!text) return 'N/A';
  if (text.toString().length <= maxLength) return text.toString();
  return `${text.toString().slice(0, maxLength - 1)}...`;
}

/**
 * Returns the set of node indices that share a complete path with `nodeIndex`.
 * Uses the pre-computed paths from the aggregation tree so that shared
 * intermediate nodes (e.g. a common HTTP method) don't incorrectly bridge
 * unrelated branches.
 */
function getConnectedNodes(
  data: SankeyChartData,
  nodeIndex: number,
): Set<number> {
  const result = new Set<number>();
  for (const path of data.paths) {
    if (path.includes(nodeIndex)) {
      for (const ni of path) {
        result.add(ni);
      }
    }
  }
  return result;
}

export function SankeyChart({
  data,
  height = 400,
  className,
  onNodeClick,
  onNodeRightClick,
}: SankeyChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const [hoveredNodeIndex, setHoveredNodeIndex] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setWidth(entry.contentRect.width);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const highlightedNodes = useMemo(() => {
    if (hoveredNodeIndex == null) return null;
    return getConnectedNodes(data, hoveredNodeIndex);
  }, [data, hoveredNodeIndex]);

  // Lookup: "name::columnIndex" → data.nodes index
  const nodeLookup = useMemo(() => {
    const map = new Map<string, number>();
    data.nodes.forEach((node, i) => {
      map.set(`${node.name}::${node.columnIndex ?? 0}`, i);
    });
    return map;
  }, [data]);

  const resolveNodeIndex = useCallback(
    (payload: Record<string, unknown>) => {
      const col =
        (payload.columnIndex as number) ?? (payload.depth as number) ?? 0;
      return nodeLookup.get(`${payload.name}::${col}`);
    },
    [nodeLookup],
  );

  const buildNodeInfo = useCallback(
    (props: NodeProps): SankeyNodeInfo => {
      const nodeData = data.nodes[props.index];
      return {
        name: String(props.payload.name),
        value: nodeData?.value ?? 0,
        columnIndex:
          (props.payload as unknown as { columnIndex?: number }).columnIndex ??
          0,
        columnTitle: nodeData?.columnTitle,
      };
    },
    [data.nodes],
  );

  const renderNode = useCallback(
    (props: NodeProps) => {
      const { x, y, width, height, payload, index } = props;
      const fill = getColumnColor(
        (payload as unknown as { columnIndex?: number }).columnIndex,
      );
      const dimmed = highlightedNodes != null && !highlightedNodes.has(index);

      return (
        <g
          style={{
            transition: 'opacity 150ms',
            opacity: dimmed ? 0.15 : 1,
            cursor: 'pointer',
          }}
          onMouseEnter={() => setHoveredNodeIndex(index)}
          onMouseLeave={() => setHoveredNodeIndex(null)}
          onClick={(e) => {
            e.stopPropagation();
            onNodeClick?.(buildNodeInfo(props));
          }}
          onContextMenu={() => {
            onNodeRightClick?.(buildNodeInfo(props));
          }}
        >
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill={fill}
            rx={2}
          />
          <text
            x={x + width + 6}
            y={y + height / 2}
            textAnchor="start"
            dominantBaseline="central"
            className="fill-foreground text-[11px]"
          >
            {truncateLabel(payload.name)}
          </text>
        </g>
      );
    },
    [highlightedNodes, onNodeClick, onNodeRightClick, buildNodeInfo],
  );

  const renderLink = useCallback(
    (props: LinkProps) => {
      const {
        sourceX,
        sourceY,
        sourceControlX,
        targetX,
        targetY,
        targetControlX,
        linkWidth,
        payload,
      } = props;

      let dimmed = false;
      if (highlightedNodes != null) {
        const srcIdx = resolveNodeIndex(
          payload.source as unknown as Record<string, unknown>,
        );
        const tgtIdx = resolveNodeIndex(
          payload.target as unknown as Record<string, unknown>,
        );
        dimmed =
          srcIdx == null ||
          tgtIdx == null ||
          !highlightedNodes.has(srcIdx) ||
          !highlightedNodes.has(tgtIdx);
      }

      return (
        <path
          d={`M${sourceX},${sourceY} C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`}
          fill="none"
          strokeWidth={linkWidth}
          style={{
            stroke: 'var(--color-muted-foreground)',
            strokeOpacity: dimmed ? 0.05 : 0.2,
            transition: 'stroke-opacity 150ms',
          }}
        />
      );
    },
    [highlightedNodes, resolveNodeIndex],
  );

  const handleMouseEnter = useCallback(
    (...args: unknown[]) => {
      const [item, type, e] = args as [
        NodeProps | LinkProps,
        string,
        React.MouseEvent,
      ];
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (type === 'link') {
        const link = item as LinkProps;
        setTooltip({
          x,
          y,
          kind: 'link',
          sourceName: link.payload.source.name,
          targetName: link.payload.target.name,
          value: link.payload.value,
        });
      } else if (type === 'node') {
        const node = item as NodeProps;
        const idx = node.index;
        const nodeData = data.nodes[idx];
        if (nodeData) {
          setTooltip({
            x,
            y,
            kind: 'node',
            name: nodeData.name,
            columnTitle: nodeData.columnTitle ?? '',
            value: nodeData.value,
          });
        }
      }
    },
    [data.nodes],
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  if (!data.nodes.length || !data.links.length) return null;

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full', className)}
    >
      {width > 0 && (
        <Sankey
          width={width}
          height={height}
          data={data}
          node={renderNode}
          link={renderLink}
          nodePadding={10}
          nodeWidth={10}
          linkCurvature={0.5}
          margin={{ top: 10, right: 160, bottom: 10, left: 10 }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      )}
      {tooltip && (
        <div
          className="border-border/50 bg-background pointer-events-none absolute z-10 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl"
          style={{ left: tooltip.x + 12, top: tooltip.y - 12 }}
        >
          {tooltip.kind === 'link' ? (
            <>
              <div className="font-medium">
                {tooltip.sourceName} &rarr; {tooltip.targetName}
              </div>
              <div className="text-muted-foreground">
                Count: {tooltip.value.toLocaleString()}
              </div>
            </>
          ) : (
            <>
              {tooltip.columnTitle && (
                <div className="text-muted-foreground">
                  {tooltip.columnTitle}
                </div>
              )}
              <div className="font-medium">{tooltip.name}</div>
              <div className="text-muted-foreground">
                Events: {tooltip.value.toLocaleString()}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
