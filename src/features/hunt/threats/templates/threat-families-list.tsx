import { EntityState } from '@reduxjs/toolkit';
import { values } from 'ramda';

import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { sortBy } from '@/common/lib/sorting';

import {
  useGetActiveThreatFamiliesQuery,
  useGetThreatFamiliesQuery,
} from '../api/threats.api';
import { CoverageBlockSkeleton } from '../components/coverage-block/coverage-block.skeleton';
import { FamilyBlockView } from '../components/coverage-block/family-block';
import { ThreatGrid } from '../components/threat-grid';
import { ThreatFamily } from '../model/threat-family.model';

export const FamiliesList = ({
  familyClass,
  searchInput,
}: {
  familyClass: 'all' | 'doc' | 'dopv';
  searchInput: string;
}) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { data: families, isLoading: familiesLoading } =
    useGetThreatFamiliesQuery(
      {},
      {
        selectFromResult: (result) => ({
          ...result,
          data:
            result.data?.entities &&
            getFamiliesIdsFromFilters(
              result.data.entities,
              familyClass,
              searchInput,
            ),
        }),
      },
    );
  const { data: activeFamiliesData } = useGetActiveThreatFamiliesQuery(params);

  if (familiesLoading) {
    return (
      <ThreatGrid>
        {Array.from({ length: 20 }).map((_, i) => (
          <CoverageBlockSkeleton key={i} />
        ))}
      </ThreatGrid>
    );
  }

  if (!families) return null;

  return (
    <ThreatGrid>
      {families.map((family) => (
        <FamilyBlockView
          key={family.pk}
          id={family.pk}
          name={family.name}
          isActive={!!activeFamiliesData?.entities[family.pk]}
          description={family.description}
          familyClass={family.klass}
        />
      ))}
    </ThreatGrid>
  );
};

const getFamiliesIdsFromFilters = (
  families: EntityState<ThreatFamily, number>['entities'],
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
  return list.sort(sortBy('name'));
};
