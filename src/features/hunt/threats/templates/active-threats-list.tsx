import { EntityState } from '@reduxjs/toolkit';
import { values } from 'ramda';

import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { sortBy } from '@/common/lib/sorting';

import {
  useGetActiveThreatsQuery,
  useGetThreatFamiliesQuery,
} from '../api/threats.api';
import { ActiveThreatBlockView } from '../components/coverage-block/active-threat-block';
import { CoverageBlockSkeleton } from '../components/coverage-block/coverage-block.skeleton';
import { ThreatGrid } from '../components/threat-grid';
import { useCombinedThreats } from '../hooks/use-combined-threats';
import { ActiveThreat } from '../model/active-threat.model';
import { Threat } from '../model/threat.model';

export const ActiveThreatsList = ({
  familyClass,
  searchInput,
}: {
  familyClass: 'all' | 'doc' | 'dopv';
  searchInput: string;
}) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { data: threats, isLoading: threatsLoading } = useCombinedThreats();
  const { data: families } = useGetThreatFamiliesQuery({});
  const { data: activeThreatIds, isLoading: activeThreatsLoading } =
    useGetActiveThreatsQuery(params, {
      selectFromResult: (result) => ({
        ...result,
        data:
          threats &&
          result.data?.entities &&
          getThreatIdsFromFilters(
            threats,
            result.data.entities,
            familyClass,
            searchInput,
          ),
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
      {activeThreatIds?.map((threat) => {
        const threatDetail = threats.entities[threat.pk];
        const familyName = threatDetail?.family
          ? families?.entities[threatDetail.family]?.name
          : undefined;
        return (
          <ActiveThreatBlockView
            key={threat.pk}
            id={threat.pk}
            name={threat.name}
            description={threat.description}
            familyName={familyName}
            familyClass={threatDetail?.family_class ?? 'doc'}
            victims={threat.nb_assets?.nb_victim}
            victimsNew={threat.nb_assets?.nb_new_victim}
          />
        );
      })}
    </ThreatGrid>
  );
};

const getThreatIdsFromFilters = (
  threats: EntityState<Threat, number>,
  activeThreats: EntityState<ActiveThreat, number>['entities'],
  familyClass: 'all' | 'doc' | 'dopv',
  searchInput: string,
) => {
  // filter on familyClass has to happen on all threats because top list does not contain family class
  const threatIds =
    familyClass === 'all'
      ? threats.ids
      : values(threats.entities)
          .filter((threat) => threat.family_class === familyClass)
          .map((threat) => threat.pk);

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
    .filter((threat) => threatIds.includes(threat.pk))
    .sort(sortBy('name'));
};
