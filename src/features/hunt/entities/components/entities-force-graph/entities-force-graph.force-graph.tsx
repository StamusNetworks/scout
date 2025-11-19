import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';
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
import { useTheme } from '@/features/ui/theming/useTheme';

import { ForceGraphData, Node } from './entities-force-graph.utils';

const extraRenderers = [new CSS2DRenderer()];

interface AttackerInfrastructureForceGraphProps {
  data: ForceGraphData;
  height: number;
  width: number;
}
export const EntitiesForceGraphComponent = ({
  data,
  height,
  width,
}: AttackerInfrastructureForceGraphProps) => {
  const [, setSelectedNode] = useState<NodeObject<Node> | null>(null);
  const forceGraphRef = useRef<ForceGraphMethods<NodeObject<Node>> | undefined>(
    undefined,
  );
  const zoomed = useRef<boolean>(false);
  const { isDark } = useTheme();

  const bgColor = useRootCssVariableValue('--background');
  const destructiveColor = useRootCssVariableValue('--doc');
  const foregroundColor = useRootCssVariableValue('--foreground');

  console.log(bgColor, destructiveColor, foregroundColor);

  useEffect(() => {
    forceGraphRef.current?.d3Force('collision', d3.forceCollide(12));
  }, []);

  return (
    <ForceGraph3D
      extraRenderers={extraRenderers}
      ref={forceGraphRef}
      graphData={data}
      nodeAutoColorBy="group"
      linkColor={() =>
        isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.3)'
      }
      backgroundColor={`${convertOklch(bgColor).hex}`}
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
        el.textContent = node.value;
        el.className = `node-label text-xs px-1 ${node.type === 'threat' ? 'text-doc bg-doc/20' : 'text-foreground bg-foreground/20'}`;

        const nodeLabel = new CSS2DObject(el);

        return nodeLabel;
      }}
      nodeThreeObjectExtend={true}
      nodeVal={20}
      nodeRelSize={3}
      nodeColor={(node) => {
        if (node.type === 'entity') {
          return `${convertOklch(foregroundColor).hex}`;
        }
        return `${convertOklch(destructiveColor).hex}`;
      }}
      nodeOpacity={0.2}
      linkDirectionalParticles={2}
      linkDirectionalParticleColor={'red'}
      linkDirectionalParticleResolution={10}
      nodeResolution={20}
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
