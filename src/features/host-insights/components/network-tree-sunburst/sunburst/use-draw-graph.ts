import * as d3 from 'd3';
import React, { useEffect, useRef, useState } from 'react';

import { useTheme } from '@/features/theming';

import { SunburstNode } from './sunburst';
import {
  arcVisible,
  findNodeByPath,
  labelTransform,
  labelVisible,
} from './sunburst.utils';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface UseDrawGraphProps<T = Record<string, unknown>> {
  ref: React.RefObject<HTMLDivElement | null>;
  data: SunburstNode<T>;
  onNodeClick?: (
    d: MouseEvent,
    p: d3.HierarchyRectangularNode<SunburstNode<T>>,
  ) => void;
  renderTooltip?: (
    treeNode: SunburstNode<T> | undefined,
  ) => React.JSX.Element | null;
  selectedNode: string | null | undefined;
  onSelectionChange?: (path: string | null) => void;
  setTooltipData: (data: SunburstNode<T> | null) => void;
  setTooltipOpen: (open: boolean) => void;
}

export function useDrawGraph<T = Record<string, unknown>>({
  ref,
  data,
  onNodeClick,
  renderTooltip,
  selectedNode,
  onSelectionChange,
  setTooltipData,
  setTooltipOpen,
}: UseDrawGraphProps<T>) {
  const { isDark } = useTheme();
  const [graphReady, setGraphReady] = useState(false);

  const rootRef = useRef<d3.HierarchyRectangularNode<unknown> | null>(null);
  const hierarchyRef = useRef<d3.HierarchyNode<SunburstNode<T>>>(null);
  const arcRef = useRef<d3.Arc<any, any> | null>(null);
  const colorRef = useRef<d3.ScaleOrdinal<string, string, never> | null>(null);
  const svgRef =
    useRef<d3.Selection<SVGSVGElement, unknown, null, undefined>>(null);
  const pathRef =
    useRef<
      d3.Selection<
        d3.BaseType | SVGPathElement,
        d3.HierarchyRectangularNode<unknown>,
        SVGGElement,
        unknown
      >
    >(null);
  const labelRef =
    useRef<
      d3.Selection<
        d3.BaseType | SVGTextElement,
        d3.HierarchyRectangularNode<unknown>,
        SVGGElement,
        unknown
      >
    >(null);
  const parentRef =
    useRef<
      d3.Selection<
        SVGCircleElement,
        | d3.HierarchyRectangularNode<any>
        | d3.HierarchyRectangularNode<unknown>
        | null,
        null,
        undefined
      >
    >(null);
  const parentLabelRef =
    useRef<d3.Selection<SVGTextElement, unknown, null, undefined>>(null);
  const radiusRef = useRef<number>(0);

  const targetNode = rootRef.current
    ? findNodeByPath(rootRef.current, selectedNode)
    : null;

  useEffect(() => {
    if (!data || !ref.current) return;

    // Capture ref.current for cleanup
    const currentRef = ref.current;

    // Clear previous render
    currentRef.innerHTML = '';

    // D3 code adapted from the provided chart function
    const width = 928;
    const height = width;
    const radius = width / 6;

    radiusRef.current = radius;

    // Create the color scale.
    const color = d3.scaleOrdinal(
      d3.quantize(d3.interpolateRainbow, (data.children?.length || 0) + 1),
    );

    // Compute the layout.
    const hierarchy = d3
      .hierarchy(data)
      .sum((d) => d.value || 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
    hierarchyRef.current = hierarchy;

    const root = d3.partition().size([2 * Math.PI, hierarchy.height + 1])(
      hierarchy as d3.HierarchyNode<unknown>,
    );
    rootRef.current = root;

    /* eslint-disable @typescript-eslint/no-explicit-any */
    root.each((d) => ((d as any).current = d));

    // Create the arc generator.
    const arc = d3
      .arc()
      .startAngle((d) => (d as any).x0)
      .endAngle((d) => (d as any).x1)
      .padAngle((d) => Math.min(((d as any).x1 - (d as any).x0) / 2, 0.005))
      .padRadius(radius * 1.5)
      .innerRadius((d) => (d as any).y0 * radius)
      .outerRadius((d) =>
        Math.max((d as any).y0 * radius, (d as any).y1 * radius - 1),
      );
    arcRef.current = arc;

    // Create the SVG container.
    const svg = d3
      .select(currentRef)
      .append('svg')
      .attr('viewBox', `${-width / 2} ${-height / 2} ${width} ${width}`)
      .style('font', '10px sans-serif');
    svgRef.current = svg;

    // Append the arcs.
    const g = svg.append('g');

    const path = g
      .selectAll('path')
      .data(root.descendants().slice(1))
      .join('path')
      .attr('fill', (d) => {
        let ancestor = d;
        while (ancestor.depth > 1 && ancestor.parent)
          ancestor = ancestor.parent;
        return color((ancestor.data as SunburstNode<T>).name);
      })
      .attr('fill-opacity', (d) =>
        arcVisible((d as any).current) ? (d.children ? 0.6 : 0.4) : 0,
      )
      .attr('pointer-events', (d) =>
        arcVisible((d as any).current) ? 'auto' : 'none',
      )
      .attr('d', (d) => arc((d as any).current))
      .on('mouseenter', (_, d) => {
        if (renderTooltip) {
          setTooltipData(d.data as SunburstNode<T>);
          setTooltipOpen(true);
        }
      })
      .on('mouseleave', () => {
        if (renderTooltip) {
          setTooltipOpen(false);
          setTooltipData(null);
        }
      });

    path.style('cursor', 'zoom-in').on('click', clicked);
    pathRef.current = path;

    const label = svg
      .append('g')
      .attr('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .style('user-select', 'none')
      .selectAll('text')
      .data(root.descendants().slice(1))
      .join('text')
      .attr('dy', '0.35em')
      .attr('fill-opacity', (d) => +labelVisible((d as any).current))
      .attr('fill', isDark ? 'white' : 'black')
      .attr('transform', (d) => labelTransform((d as any).current, radius))
      .text((d) => (d.data as SunburstNode<T>).name);
    labelRef.current = label;

    const parent = svg
      .append('g')
      .attr('class', 'sunburst-parent-circle-group')
      .style('cursor', 'pointer');

    const parentCircle = parent
      .append('circle')
      .datum(targetNode)
      .attr('r', radius)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .attr('cursor', 'zoom-out')
      .attr('stroke-width', 1)
      .attr('stroke', 'var(--border)')
      .on('click', clicked);

    // Add a label in the center for the node name
    const parentLabel = parent
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', isDark ? 'white' : 'black')
      .style('font-size', '1.15em')
      .style('font-weight', 500)
      .style('z-index', -1)
      .style('pointer-events', 'none')
      .text(() => {
        // Find the current node by path, fallback to root
        const node = targetNode;
        // Fallback if no node
        if (!node) return '';
        // Show the node name; perhaps fallback to 'root'
        return (node.data as SunburstNode<T>).name || 'root';
      });

    parentRef.current = parentCircle;
    parentLabelRef.current = parentLabel;

    // Handle zoom on click.
    function clicked(event: any, p: any) {
      onSelectionChange?.(p.data.path || 'root');
      onNodeClick?.(event, p);
    }

    setGraphReady(true);
    // Clean up on unmount
    return () => {
      currentRef.innerHTML = '';
    };
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [data, onNodeClick, renderTooltip]);

  return {
    rootRef,
    hierarchyRef,
    arcRef,
    colorRef,
    svgRef,
    pathRef,
    labelRef,
    parentRef,
    parentLabelRef,
    radiusRef,
    graphReady,
    targetNode,
  };
}

export type SunburstGraphReturn = ReturnType<typeof useDrawGraph>;
