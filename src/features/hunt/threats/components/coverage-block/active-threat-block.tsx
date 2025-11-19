import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';

import { useGetActiveThreatsQuery } from '../../api/threats.api';
import { useThreat } from '../../hooks/use-threat';
import { CoverageBlock, CoverageBlockRow } from './coverage-block';
import { CoverageBlockSkeleton } from './coverage-block.skeleton';

export const ActiveThreatBlock = ({ id }: { id: number }) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { data: threatData, isLoading: threatLoading } = useThreat(id);
  const { data: activeThreatData, isLoading: activeThreatsLoading } =
    useGetActiveThreatsQuery(params, {
      selectFromResult: (result) => ({
        ...result,
        data: result.data?.entities[id],
      }),
    });

  if (!threatLoading || activeThreatsLoading) return <CoverageBlockSkeleton />;
  if (!threatData || !activeThreatData) return null;

  return (
    <ActiveThreatBlockView
      id={id}
      tooltip={threatData.description}
      familyClass={threatData.family_class}
      name={threatData.name}
      victims={activeThreatData.nb_assets?.nb_victim}
      victimsNew={activeThreatData.nb_assets?.nb_new_victim}
    />
  );
};

interface ActiveThreatBlockProps {
  id: number;
  familyClass: 'doc' | 'dopv';
  name: string;
  tooltip: string;
  victims: number;
  victimsNew: number;
}

export const ActiveThreatBlockView = ({
  id,
  familyClass,
  name,
  tooltip,
  victims,
  victimsNew,
}: ActiveThreatBlockProps) => (
  <CoverageBlock
    id={id}
    link="threat"
    familyClass={familyClass}
    name={name}
    isActive
    tooltip={tooltip}
  >
    <CoverageBlockRow
      label="New victims"
      value={victims}
    />
    <CoverageBlockRow
      label="Total victims"
      value={victimsNew}
    />
  </CoverageBlock>
);
