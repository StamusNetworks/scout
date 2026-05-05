import { ThreatKind } from '../../model/threat';
import { CoverageBlock, CoverageBlockRow } from './coverage-block';

interface ActiveThreatBlockProps {
  id: number;
  kind: ThreatKind;
  name: string;
  description: string;
  familyName?: string;
  victims: number;
  victimsNew: number;
}

export const ActiveThreatBlockView = ({
  id,
  kind,
  name,
  description,
  familyName,
  victims,
  victimsNew,
}: ActiveThreatBlockProps) => (
  <CoverageBlock
    id={id}
    link="threat"
    kind={kind}
    name={name}
    isActive
    description={description}
    badge={familyName}
  >
    <div className="flex items-center gap-4">
      <CoverageBlockRow
        label="New victims"
        value={victims}
      />
      <CoverageBlockRow
        label="Total victims"
        value={victimsNew}
      />
    </div>
  </CoverageBlock>
);
