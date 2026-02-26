import { CoverageBlock } from './coverage-block';

interface ThreatBlockProps {
  id: number;
  familyClass: 'doc' | 'dopv';
  name: string;
  isActive: boolean;
  description: string;
  familyName?: string;
}

export const ThreatBlockView = ({
  id,
  familyClass,
  name,
  isActive,
  description,
  familyName,
}: ThreatBlockProps) => (
  <CoverageBlock
    id={id}
    link="threat"
    familyClass={familyClass}
    name={name}
    isActive={isActive}
    description={description}
    badge={familyName}
  />
);
