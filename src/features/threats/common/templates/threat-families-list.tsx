import { EntityState } from '@reduxjs/toolkit';
import { values } from 'ramda';

import { sortBy } from '@/common/lib/sorting';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import {
  useGetActiveThreatFamiliesQuery,
  useGetThreatFamiliesQuery,
} from '../../api/threats.api';
import { CoverageBlockSkeleton } from '../../components/coverage-block/coverage-block.skeleton';
import { FamilyBlockView } from '../../components/coverage-block/family-block';
import { ThreatGrid } from '../../components/threat-grid/threat-grid';
import { ThreatKind } from '../../model/threat';
import { ThreatFamily } from '../../model/threat-family';

export const FamiliesList = ({
  kind,
  searchInput,
}: {
  kind?: ThreatKind;
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
            filterFamilies(result.data.entities, kind, searchInput),
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
          key={family.id}
          id={family.id}
          name={family.name}
          isActive={!!activeFamiliesData?.entities[family.id]}
          description={family.description}
          kind={family.kind}
        />
      ))}
    </ThreatGrid>
  );
};

const filterFamilies = (
  families: EntityState<ThreatFamily, number>['entities'],
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
