import { EntitiesForceGraph } from '../../common/molecules/entities-force-graph/entities-force-graph';
import { ThreatKind } from '../../model/threat';

type Props = { kind: ThreatKind };

/**
 * Force-directed graph of impacted entities for a threat kind.
 */
export const ThreatGraph = ({ kind }: Props) => (
  <EntitiesForceGraph kind={kind} />
);
