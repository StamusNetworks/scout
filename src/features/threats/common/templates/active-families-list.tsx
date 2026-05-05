import { EntityState } from '@reduxjs/toolkit';
import { values } from 'ramda';

import { sortBy } from '@/common/lib/sorting';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import { ActiveThreatFamily } from '../../api/active-threat-family.dto';
import { useGetActiveThreatFamiliesQuery } from '../../api/threats.api';
import { ActiveFamilyBlock } from '../molecules/coverage-block/active-family-block';
import { CoverageBlockSkeleton } from '../molecules/coverage-block/coverage-block.skeleton';
import { ThreatGrid } from '../molecules/threat-grid';

export const ActiveFamiliesList = ({
  familyClass,
  searchInput,
}: {
  familyClass: 'all' | 'doc' | 'dopv';
  searchInput: string;
}) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);

  const { data: activeFamilies, isLoading: activeFamiliesLoading } =
    useGetActiveThreatFamiliesQuery(params, {
      selectFromResult: (result) => ({
        ...result,
        data:
          result.data?.entities &&
          getFamiliesFromFilters(
            result.data.entities,
            familyClass,
            searchInput,
          ),
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
          key={family.pk}
          id={family.pk}
        />
      ))}
    </ThreatGrid>
  );
};

const getFamiliesFromFilters = (
  families: EntityState<ActiveThreatFamily, number>['entities'],
  familyClass: 'all' | 'doc' | 'dopv',
  searchInput: string,
) => {
  let list = values(families);
  if (familyClass !== 'all') {
    list = list.filter((family) => family.klass === familyClass);
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
