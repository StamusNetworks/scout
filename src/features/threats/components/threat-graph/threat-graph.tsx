import { EntitiesForceGraph } from '../../common/molecules/entities-force-graph/entities-force-graph';
import { ThreatKind } from '../../model/threat';

const FAMILY_CLASS_BY_KIND = {
  compromise: 'doc',
  policyViolation: 'dopv',
} as const;

type Props = { kind: ThreatKind };

/**
 * Force-directed graph of impacted entities for a threat kind.
 */
export const ThreatGraph = ({ kind }: Props) => (
  <EntitiesForceGraph familyClass={FAMILY_CLASS_BY_KIND[kind]} />
);
