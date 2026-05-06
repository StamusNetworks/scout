import * as d3 from 'd3';
import { useEffect } from 'react';

import { SunburstNode } from './sunburst';
import { arcVisible, labelTransform, labelVisible } from './sunburst.utils';
import { SunburstGraphReturn } from './use-draw-graph';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface UseZoomTransitionProps<T = Record<string, unknown>> {
  graphReady: boolean;
  targetNode: SunburstGraphReturn['targetNode'];
  rootRef: SunburstGraphReturn['rootRef'];
  svgRef: SunburstGraphReturn['svgRef'];
  pathRef: SunburstGraphReturn['pathRef'];
  labelRef: SunburstGraphReturn['labelRef'];
  parentRef: SunburstGraphReturn['parentRef'];
  parentLabelRef: SunburstGraphReturn['parentLabelRef'];
  radiusRef: SunburstGraphReturn['radiusRef'];
  arcRef: SunburstGraphReturn['arcRef'];
  data: SunburstNode<T>;
}

export function useZoomTransition({
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
}: UseZoomTransitionProps<any>) {
  return useEffect(() => {
    if (
      !graphReady ||
      !arcRef.current ||
      !rootRef.current ||
      !svgRef.current ||
      !pathRef.current ||
      !labelRef.current ||
      !parentRef.current ||
      !parentLabelRef.current
    )
      return;

    const svg = svgRef.current;
    const path = pathRef.current;
    const label = labelRef.current;
    const root = rootRef.current;
    const arc = arcRef.current;
    const parent = parentRef.current;
    const parentLabel = parentLabelRef.current;
    const radius = radiusRef.current;

    // Find the selected node from the pat
    const currentNode = targetNode;
    if (!currentNode) return;

    parent.datum(currentNode?.parent || root);
    root.each((d) => {
      (d as any).target = {
        x0:
          Math.max(
            0,
            Math.min(
              1,
              (d.x0 - currentNode.x0) / (currentNode.x1 - currentNode.x0),
            ),
          ) *
          2 *
          Math.PI,
        x1:
          Math.max(
            0,
            Math.min(
              1,
              (d.x1 - currentNode.x0) / (currentNode.x1 - currentNode.x0),
            ),
          ) *
          2 *
          Math.PI,
        y0: Math.max(0, d.y0 - currentNode.depth),
        y1: Math.max(0, d.y1 - currentNode.depth),
      };
    });
    const t = svg.transition().duration(750);
    path
      .transition(t as any)
      .tween('data', (d) => {
        const i = d3.interpolate((d as any).current, (d as any).target);
        return (t) => ((d as any).current = i(t));
      })
      .filter(function (d) {
        const element = this as SVGPathElement;
        return Boolean(
          +(element.getAttribute('fill-opacity') || '0') ||
          arcVisible((d as any).target),
        );
      })
      .attr('fill-opacity', (d) =>
        arcVisible((d as any).target) ? (d.children ? 0.6 : 0.4) : 0,
      )
      .attr('pointer-events', (d) =>
        arcVisible((d as any).target) ? 'auto' : 'none',
      )
      .attrTween('d', (d) => () => arc((d as any).current) || '');
    label
      .filter(function (d) {
        const element = this as SVGTextElement;
        return Boolean(
          +(element.getAttribute('fill-opacity') || '0') ||
          labelVisible((d as any).target),
        );
      })
      .transition(t as any)
      .attr('fill-opacity', (d) => +labelVisible((d as any).target))
      .attrTween(
        'transform',
        (d) => () => labelTransform((d as any).current, radius),
      );

    if (targetNode?.data.name === 'root') {
      parentLabel.text('');
      parent.attr('pointer-events', 'none');
    } else {
      parentLabel.text(() => {
        return targetNode.data.name;
      });
      parent.attr('pointer-events', 'all');
    }

    if (targetNode?.children) {
      parent.attr('stroke-width', 0);
    } else {
      parent.attr('stroke-width', 1.5);
    }
  }, [
    data,
    targetNode?.data.name,
    graphReady,
    arcRef,
    rootRef,
    svgRef,
    pathRef,
    labelRef,
    parentRef,
    parentLabelRef,
    radiusRef,
    targetNode,
  ]);
}
