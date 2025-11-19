import { useRef, useState } from 'react';
import ForceGraph3D, {
  ForceGraphMethods,
  NodeObject,
} from 'react-force-graph-3d';
import * as THREE from 'three';
import {
  CSS2DObject,
  CSS2DRenderer,
} from 'three/examples/jsm/renderers/CSS2DRenderer';

import { convertOklch } from '@/common/lib/colors';
import { useRootCssVariableValue } from '@/common/lib/use-root-css-variable-value';
import { cn } from '@/common/lib/utils';

import { ForceGraphData, Link, Node } from './attacker-infrastructure.utils';

const extraRenderers = [new CSS2DRenderer()];

interface AttackerInfrastructureForceGraphProps {
  data: ForceGraphData;
  width: number;
  height: number;
}
export const AttackerInfrastructureForceGraph = ({
  data,
  width,
  height,
}: AttackerInfrastructureForceGraphProps) => {
  const [, setSelectedNode] = useState<NodeObject<Node> | null>(null);
  const forceGraphRef = useRef<
    ForceGraphMethods<NodeObject<Node>, Link> | undefined
  >(undefined);
  const zoomed = useRef<boolean>(false);

  const bgColor = useRootCssVariableValue('--card');

  return (
    <ForceGraph3D
      extraRenderers={extraRenderers}
      ref={forceGraphRef}
      graphData={data}
      linkColor={() => convertOklch(getColor('foreground')).hex}
      width={width}
      height={height}
      cooldownTime={1000}
      onEngineStop={() => {
        if (!zoomed.current && forceGraphRef.current) {
          forceGraphRef.current.zoomToFit(500, 25);
          zoomed.current = true;
        }
      }}
      nodeThreeObject={(node) => {
        const el = document.createElement('div');
        el.textContent = node.label ?? node.value.toString();
        el.className = cn(`node-label text-xs px-1`);
        el.style.color = convertOklch(getColor(node.color)).hex;
        el.style.backgroundColor = toRgba(getColor(node.color), 0.2);
        const nodeLabel = new CSS2DObject(el);
        return nodeLabel;
      }}
      nodeThreeObjectExtend={true}
      nodeColor={(node) => convertOklch(getColor(node.color)).hex}
      nodeVal={20}
      nodeRelSize={3}
      nodeOpacity={0.35}
      nodeResolution={15}
      backgroundColor={convertOklch(bgColor).hex}
      linkDirectionalParticles={2}
      linkDirectionalParticleWidth={1}
      onNodeClick={(node) => {
        setSelectedNode(node);
        const currentCameraPosition = forceGraphRef.current?.camera().position;

        const offset = new THREE.Vector3()
          .subVectors(
            currentCameraPosition!,
            new THREE.Vector3(node.x, node.y, node.z),
          )
          .normalize()
          .multiplyScalar(300);
        const newCameraPosition = new THREE.Vector3(node.x, node.y, node.z).add(
          offset,
        );

        forceGraphRef.current?.cameraPosition(
          newCameraPosition,
          { x: node.x!, y: node.y!, z: node.z! },
          500,
        );
      }}
    />
  );
};

// const onNodeClick =
//   (navigate: NavigateFunction, dispatch: ReturnType<typeof useAppDispatch>) =>
//   (node: NodeObject<Node>) => {
//     switch (node.type) {
//       case 'killchain':
//         navigate(routes.dashboard);
//         dispatch(clearQueryFilters());
//         dispatch(addQueryFilter(createFilter('stamus.kill_chain', node.id)));
//         break;
//       case 'method':
//         navigate(routes.events);
//         dispatch(clearQueryFilters());
//         dispatch(addQueryFilter(createFilter('alert.signature', node.id)));
//         break;
//       case 'asset':
//         navigate(routes.attack_surface_host.replace(':hostId', node.id));
//         break;
//       case 'host':
//       default:
//         break;
//     }
//   };

const getColor = (token: string) => {
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--' + token)
    .trim();
};

const toRgba = (oklch: string, opacity = 1) => {
  const { r, g, b } = convertOklch(oklch);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};
