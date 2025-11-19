import { CoverageBlock } from './coverage-block';
interface ThreatBlockProps {
  id: number;
  familyClass: 'doc' | 'dopv';
  name: string;
  isActive: boolean;
  description: string;
}
export const ThreatBlockView = ({
  id,
  familyClass,
  name,
  isActive,
  description,
}: ThreatBlockProps) => (
  <CoverageBlock
    id={id}
    link="threat"
    familyClass={familyClass}
    name={name}
    isActive={isActive}
  >
    {description}
  </CoverageBlock>
);
