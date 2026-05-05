import { ThreatKind } from '../../model/threat';
import { CoverageBlock } from './coverage-block';

interface ThreatBlockProps {
  id: number;
  kind: ThreatKind;
  name: string;
  isActive: boolean;
  description: string;
  familyName?: string;
}

export const ThreatBlockView = ({
  id,
  kind,
  name,
  isActive,
  description,
  familyName,
}: ThreatBlockProps) => (
  <CoverageBlock
    id={id}
    link="threat"
    kind={kind}
    name={name}
    isActive={isActive}
    description={description}
    badge={familyName}
  />
);
