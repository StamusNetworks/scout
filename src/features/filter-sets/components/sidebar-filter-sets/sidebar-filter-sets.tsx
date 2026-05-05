import { useCallback, useMemo } from 'react';

import { Column } from '@/common/design-system/atoms/layout/column';
import { AlertDialog } from '@/common/design-system/molecules/alert-dialog';
import { SideBarHeader } from '@/features/query-filters';

import { useFilterSetsRepository } from '../../state/filter-sets.repository';
import {
  FilterSetsClearButton,
  FilterSetsHeader,
  FilterSetsItem,
  FilterSetsItems,
  FilterSetsTitle,
} from './sidebar-filter-sets.molecules';

export const SideBarQueryFilterSets = () => {
  const repo = useFilterSetsRepository();
  const favorites = repo.getFavorites();
  const pinned = repo.getPinned();

  const sortedFavorites = useMemo(
    () => [...favorites].toSorted((a, b) => a.name.localeCompare(b.name)),
    [favorites],
  );
  const sortedPinned = useMemo(
    () => [...pinned].toSorted((a, b) => a.name.localeCompare(b.name)),
    [pinned],
  );

  const handleClearFavorites = useCallback(
    () => repo.clearCollection('favorites'),
    [repo],
  );
  const handleClearPinned = useCallback(
    () => repo.clearCollection('pinned'),
    [repo],
  );
  const handleDeleteFromFavorites = useCallback(
    (id: number) => repo.removeFromCollection('favorites', id),
    [repo],
  );
  const handleDeleteFromPinned = useCallback(
    (id: number) => repo.removeFromCollection('pinned', id),
    [repo],
  );

  return (
    <Column>
      <SideBarHeader>Filter Sets</SideBarHeader>
      <Column className="gap-2">
        <Column>
          <FilterSetsHeader>
            <FilterSetsTitle title="Favorites" />
            <AlertDialog
              trigger={<FilterSetsClearButton />}
              onConfirm={handleClearFavorites}
            />
          </FilterSetsHeader>
          <FilterSetsItems>
            {sortedFavorites.map((filterSet) => (
              <FilterSetsItem
                key={filterSet.id}
                filterSet={filterSet}
                onDelete={handleDeleteFromFavorites}
              />
            ))}
          </FilterSetsItems>
        </Column>
        <Column>
          <FilterSetsHeader>
            <FilterSetsTitle title="Pinned" />
            <FilterSetsClearButton onClear={handleClearPinned} />
          </FilterSetsHeader>
          <FilterSetsItems>
            {sortedPinned.map((filterSet) => (
              <FilterSetsItem
                key={filterSet.id}
                filterSet={filterSet}
                onDelete={handleDeleteFromPinned}
              />
            ))}
          </FilterSetsItems>
        </Column>
      </Column>
    </Column>
  );
};
