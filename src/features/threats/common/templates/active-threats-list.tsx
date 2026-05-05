import { EntityState } from '@reduxjs/toolkit';
import { values } from 'ramda';

import { sortBy } from '@/common/lib/sorting';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import {
  useGetActiveThreatsQuery,
  useGetThreatFamiliesQuery,
} from '../../api/threats.api';
import { ActiveThreatBlockView } from '../../components/coverage-block/active-threat-block';
import { CoverageBlockSkeleton } from '../../components/coverage-block/coverage-block.skeleton';
import { ThreatGrid } from '../../components/threat-grid/threat-grid';
import { useCombinedThreats } from '../../hooks/use-combined-threats';
import { ActiveThreat } from '../../model/active-threat';
import { Threat, ThreatKind } from '../../model/threat';

export const ActiveThreatsList = ({
  kind,
  searchInput,
}: {
  kind?: ThreatKind;
  searchInput: string;
}) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { data: threats, isLoading: threatsLoading } = useCombinedThreats();
  const { data: families } = useGetThreatFamiliesQuery({});
  const { data: activeThreats, isLoading: activeThreatsLoading } =
    useGetActiveThreatsQuery(params, {
      selectFromResult: (result) => ({
        ...result,
        data:
          threats &&
          result.data?.entities &&
          filterActiveThreats(threats, result.data.entities, kind, searchInput),
      }),
    });
  if (threatsLoading || activeThreatsLoading) {
    return (
      <ThreatGrid>
        {Array.from({ length: 10 }).map((_, i) => (
          <CoverageBlockSkeleton key={i} />
        ))}
      </ThreatGrid>
    );
  }
  if (!threats) return null;
  return (
    <ThreatGrid>
      {activeThreats?.map((threat) => {
        const threatDetail = threats.entities[threat.id];
        const familyName = threatDetail?.familyId
          ? families?.entities[threatDetail.familyId]?.name
          : undefined;
        return (
          <ActiveThreatBlockView
            key={threat.id}
            id={threat.id}
            name={threat.name}
            description={threat.description}
            familyName={familyName}
            kind={threatDetail?.kind ?? 'compromise'}
            victims={threat.assets.victims}
            victimsNew={threat.assets.newVictims}
          />
        );
      })}
    </ThreatGrid>
  );
};

const filterActiveThreats = (
  threats: EntityState<Threat, number>,
  activeThreats: EntityState<ActiveThreat, number>['entities'],
  kind: ThreatKind | undefined,
  searchInput: string,
) => {
  // filter on kind has to happen on all threats because top list does not
  // contain the kind discriminator
  const threatIds = !kind
    ? threats.ids
    : values(threats.entities)
        .filter((threat) => threat.kind === kind)
        .map((threat) => threat.id);

  const list = searchInput
    ? values(activeThreats).filter((threat) => {
        if (threat.name.toLowerCase().includes(searchInput.toLowerCase())) {
          return true;
        }
        if (threat.description) {
          return threat.description
            .toLowerCase()
            .includes(searchInput.toLowerCase());
        }
        return false;
      })
    : values(activeThreats);

  return list
    .filter((threat) => threatIds.includes(threat.id))
    .toSorted(sortBy('name'));
};
