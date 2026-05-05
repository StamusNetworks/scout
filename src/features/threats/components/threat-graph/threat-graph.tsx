import { ThreatKind } from '../../model/threat';
import { EntitiesForceGraph } from '../entities-force-graph/entities-force-graph';

type Props = { kind: ThreatKind };

/**
 * Force-directed graph of impacted entities for a threat kind.
 */
export const ThreatGraph = ({ kind }: Props) => (
  <EntitiesForceGraph kind={kind} />
);
