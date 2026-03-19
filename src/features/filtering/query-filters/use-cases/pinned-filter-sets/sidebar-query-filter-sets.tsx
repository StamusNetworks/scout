import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { Column } from '@/common/design-system/atoms/layout/column';
import { AlertDialog } from '@/common/design-system/molecules/alert-dialog';
import { RootState } from '@/store/store';
import { store } from '@/store/store-instance';

import {
  clearQueryFilterSets,
  removeQueryFilterSet,
  selectQueryFilterSets,
} from '../../store/query-filters-sets.slice';
import { SideBarHeader } from '../list-filters/filters-sidebar';
import {
  FilterSetsClearButton,
  FilterSetsHeader,
  FilterSetsItem,
  FilterSetsItems,
  FilterSetsTitle,
} from './sidebar-query-filter-sets.molecules';

const handleClearFavorites = () => {
  store.dispatch(clearQueryFilterSets('favorites'));
};
const handleClearPinned = () => {
  store.dispatch(clearQueryFilterSets('pinned'));
};
const handleDeleteFilterSetFromFavorites = (id: number) => {
  store.dispatch(removeQueryFilterSet({ key: 'favorites', id }));
};
const handleDeleteFilterSetFromPinned = (id: number) => {
  store.dispatch(removeQueryFilterSet({ key: 'pinned', id }));
};

export const SideBarQueryFilterSets = () => {
  const favorites = useSelector((state: RootState) =>
    selectQueryFilterSets(state, 'favorites'),
  );
  const pinned = useSelector((state: RootState) =>
    selectQueryFilterSets(state, 'pinned'),
  );
  const sortedFavorites = useMemo(
    () => [...favorites].sort((a, b) => a.name.localeCompare(b.name)),
    [favorites],
  );
  const sortedPinned = useMemo(
    () => [...pinned].sort((a, b) => a.name.localeCompare(b.name)),
    [pinned],
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
                onDelete={handleDeleteFilterSetFromFavorites}
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
                onDelete={handleDeleteFilterSetFromPinned}
              />
            ))}
          </FilterSetsItems>
        </Column>
      </Column>
    </Column>
  );
};
