import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';

import {
  useGetActiveThreatFamiliesQuery,
  useGetThreatFamiliesQuery,
} from '../../api/threats.api';
import { CoverageBlock } from './coverage-block';
import { CoverageBlockSkeleton } from './coverage-block.skeleton';

export const FamilyBlock = ({ id }: { id: number }) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { data: familyData, isLoading: threatsLoading } =
    useGetThreatFamiliesQuery(
      {
        tenant: params.tenant,
      },
      {
        selectFromResult: (result) => ({
          ...result,
          data: result.data?.entities[id],
        }),
      },
    );

  const { data: activeFamilyData } = useGetActiveThreatFamiliesQuery(params, {
    selectFromResult: (result) => ({
      ...result,
      data: result.data?.entities[id],
    }),
  });

  if (threatsLoading) return <CoverageBlockSkeleton />;
  if (!familyData) return null;

  return (
    <FamilyBlockView
      id={id}
      familyClass={familyData.klass}
      name={familyData.name}
      isActive={!!activeFamilyData}
      description={familyData.description}
    />
  );
};

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
  >
    <p className="line-clamp-5">{description}</p>
  </CoverageBlock>
);
