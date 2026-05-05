import { ThreatKind } from '../../../model/threat';
import { CoverageBlock } from './coverage-block';

interface FamilyBlockProps {
  id: number;
  kind: ThreatKind;
  name: string;
  isActive: boolean;
  description: string;
}

export const FamilyBlockView = ({
  id,
  kind,
  name,
  isActive,
  description,
}: FamilyBlockProps) => (
  <CoverageBlock
    id={id}
    link="family"
    kind={kind}
    name={name}
    isActive={isActive}
    description={description}
  />
);
