import { EntityState } from '@reduxjs/toolkit';
import { values } from 'ramda';

import { sortBy } from '@/common/lib/sorting';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import { useGetActiveThreatFamiliesQuery } from '../../api/threats.api';
import { ActiveThreatFamily } from '../../model/active-threat-family';
import { ThreatKind } from '../../model/threat';
import { ActiveFamilyBlock } from '../coverage-block/active-family-block';
import { CoverageBlockSkeleton } from '../coverage-block/coverage-block.skeleton';
import { ThreatGrid } from '../threat-grid/threat-grid';

export const ActiveFamiliesList = ({
  kind,
  searchInput,
}: {
  kind?: ThreatKind;
  searchInput: string;
}) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);

  const { data: activeFamilies, isLoading: activeFamiliesLoading } =
    useGetActiveThreatFamiliesQuery(params, {
      selectFromResult: (result) => ({
        ...result,
        data:
          result.data?.entities &&
          filterActiveFamilies(result.data.entities, kind, searchInput),
      }),
    });
  if (activeFamiliesLoading) {
    return (
      <ThreatGrid>
        {Array.from({ length: 6 }).map((_, i) => (
          <CoverageBlockSkeleton key={i} />
        ))}
      </ThreatGrid>
    );
  }
  return (
    <ThreatGrid>
      {activeFamilies?.map((family) => (
        <ActiveFamilyBlock
          key={family.id}
          id={family.id}
        />
      ))}
    </ThreatGrid>
  );
};

const filterActiveFamilies = (
  families: EntityState<ActiveThreatFamily, number>['entities'],
  kind: ThreatKind | undefined,
  searchInput: string,
) => {
  let list = values(families);
  if (kind) {
    list = list.filter((family) => family.kind === kind);
  }
  if (searchInput) {
    list = list.filter((family) => {
      if (family.name.toLowerCase().includes(searchInput.toLowerCase())) {
        return true;
      }
      if (family.description) {
        return family.description
          .toLowerCase()
          .includes(searchInput.toLowerCase());
      }
      return false;
    });
  }
  return list.toSorted(sortBy('name'));
};
