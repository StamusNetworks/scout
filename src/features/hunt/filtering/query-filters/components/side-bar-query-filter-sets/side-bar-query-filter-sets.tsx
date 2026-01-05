import { useSelector } from 'react-redux';

import { store } from '@/app/App';
import { Column } from '@/common/design-system/atoms/layout/column';
import { AlertDialog } from '@/common/design-system/molecules/alert-dialog';
import { handleLoadFilterSet } from '@/pages/filter-sets';
import { RootState } from '@/store/store';

import {
  clearQueryFilterSets,
  removeQueryFilterSet,
  selectQueryFilterSets,
} from '../../store/query-filters-sets.slice';
import { SideBarHeader } from '../filters-side-bar';
import {
  FilterSetsClearButton,
  FilterSetsHeader,
  FilterSetsItem,
  FilterSetsItems,
  FilterSetsTitle,
} from './side-bar-query-filter-sets.molecules';

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
            {favorites.map((filterSet) => (
              <FilterSetsItem
                key={filterSet.id}
                filterSet={filterSet}
                onDelete={handleDeleteFilterSetFromFavorites}
                onClickHandler={handleLoadFilterSet}
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
            {pinned.map((filterSet) => (
              <FilterSetsItem
                key={filterSet.id}
                filterSet={filterSet}
                onDelete={handleDeleteFilterSetFromPinned}
                onClickHandler={handleLoadFilterSet}
              />
            ))}
          </FilterSetsItems>
        </Column>
      </Column>
    </Column>
  );
};
