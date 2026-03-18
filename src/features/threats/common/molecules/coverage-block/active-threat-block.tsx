import { CoverageBlock, CoverageBlockRow } from './coverage-block';

interface ActiveThreatBlockProps {
  id: number;
  familyClass: 'doc' | 'dopv';
  name: string;
  description: string;
  familyName?: string;
  victims: number;
  victimsNew: number;
}

export const ActiveThreatBlockView = ({
  id,
  familyClass,
  name,
  description,
  familyName,
  victims,
  victimsNew,
}: ActiveThreatBlockProps) => (
  <CoverageBlock
    id={id}
    link="threat"
    familyClass={familyClass}
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
