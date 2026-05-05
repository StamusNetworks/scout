import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import {
  useGetActiveThreatFamiliesQuery,
  useGetActiveThreatsQuery,
  useGetThreatFamiliesQuery,
} from '../../../api/threats.api';
import { ThreatKind } from '../../../model/threat';
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

  const { victims, offenders, bothVictimAndOffender } = activeFamilyData.assets;

  return (
    <ActiveFamilyBlockView
      id={id}
      description={familyData.description}
      kind={familyData.kind}
      name={familyData.name}
      victims={victims + offenders - bothVictimAndOffender}
      activeThreats={activeThreats?.ids.length || 0}
    />
  );
};

interface ActiveFamilyBlockProps {
  id: number;
  kind: ThreatKind;
  name: string;
  description: string;
  victims: number;
  activeThreats: number;
}

export const ActiveFamilyBlockView = ({
  id,
  kind,
  name,
  description,
  victims,
  activeThreats,
}: ActiveFamilyBlockProps) => (
  <CoverageBlock
    id={id}
    link="family"
    kind={kind}
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
