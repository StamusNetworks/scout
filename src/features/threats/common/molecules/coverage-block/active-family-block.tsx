import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';

import {
  useGetActiveThreatFamiliesQuery,
  useGetActiveThreatsQuery,
  useGetThreatFamiliesQuery,
} from '../../threats.api';
import { CoverageBlock, CoverageBlockRow } from './coverage-block';
import { CoverageBlockSkeleton } from './coverage-block.skeleton';

export const ActiveFamilyBlock = ({ id }: { id: number }) => {
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
  const { data: activeFamilyData, isLoading: activeThreatsLoading } =
    useGetActiveThreatFamiliesQuery(params, {
      selectFromResult: (result) => ({
        ...result,
        data: result.data?.entities[id],
      }),
    });

  const { data: activeThreats } = useGetActiveThreatsQuery({
    ...params,
    family_id: id,
  });

  if (threatsLoading || activeThreatsLoading) return <CoverageBlockSkeleton />;
  if (!familyData || !activeFamilyData) return null;

  return (
    <ActiveFamilyBlockView
      id={id}
      description={familyData.description}
      familyClass={familyData.klass}
      name={familyData.name}
      victims={
        (activeFamilyData.nb_assets?.nb_victim || 0) +
        (activeFamilyData.nb_assets?.nb_offender || 0) -
        (activeFamilyData.nb_assets?.nb_both || 0)
      }
      activeThreats={activeThreats?.ids.length || 0}
    />
  );
};

interface ActiveFamilyBlockProps {
  id: number;
  familyClass: 'doc' | 'dopv';
  name: string;
  description: string;
  victims: number;
  activeThreats: number;
}

export const ActiveFamilyBlockView = ({
  id,
  familyClass,
  name,
  description,
  victims,
  activeThreats,
}: ActiveFamilyBlockProps) => (
  <CoverageBlock
    id={id}
    link="family"
    familyClass={familyClass}
    name={name}
    isActive
    description={description}
  >
    <div className="flex items-center gap-4">
      <CoverageBlockRow
        label="Impacted entities"
        value={victims}
      />
      <CoverageBlockRow
        label="Active threats"
        value={activeThreats}
      />
    </div>
  </CoverageBlock>
);
