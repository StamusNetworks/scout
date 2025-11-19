import { SunburstNode } from './sunburst';

/* eslint-disable @typescript-eslint/no-explicit-any */

export function arcVisible(d: any) {
  return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
}

export function labelVisible(d: any) {
  return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
}

export function labelTransform(d: any, radius: number) {
  const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
  const y = ((d.y0 + d.y1) / 2) * radius;
  return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
}

export function findNodeByPath(
  root: d3.HierarchyRectangularNode<SunburstNode<any>>,
  path?: string | null,
): d3.HierarchyRectangularNode<SunburstNode<any>> | null {
  if (!path || path === 'root') return root;

  const pathParts = path.split('.').reverse();
  let current: d3.HierarchyRectangularNode<SunburstNode<any>> | null = root;

  for (const part of pathParts) {
    if (!current || !current.children) return null;

    const found: d3.HierarchyRectangularNode<SunburstNode<any>> | undefined =
      current.children.find((child) => child.data.name === part);
    if (!found) return null;

    current = found;
  }

  return current;
}
