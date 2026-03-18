import { CoverageBlock } from './coverage-block';

interface FamilyBlockProps {
  id: number;
  familyClass: 'doc' | 'dopv';
  name: string;
  isActive: boolean;
  description: string;
}

export const FamilyBlockView = ({
  id,
  familyClass,
  name,
  isActive,
  description,
}: FamilyBlockProps) => (
  <CoverageBlock
    id={id}
    link="family"
    familyClass={familyClass}
    name={name}
    isActive={isActive}
    description={description}
  />
);
