import { ListOrdered } from 'lucide-react';

import { CommandFilterSingle } from '@/common/design-system/molecules/data-table/filters/command-filter-single';
import {
  HostsValuesSort,
  selectSort,
  setSort,
} from '@/pages/hosts/hosts-page-state.slice';
import { store } from '@/store/store';
import { useAppSelector } from '@/store/store';

const handleSetSort = (sort: HostsValuesSort) => {
  store.dispatch(setSort(sort));
};

export const HostValuesSort = () => {
  const sort = useAppSelector(selectSort);

  return (
    <CommandFilterSingle
      title="Block values"
      value={sort}
      onChange={(value) => handleSetSort(value as HostsValuesSort)}
      options={[
        { label: 'First Seen Ascending', value: 'first-seen-asc' },
        { label: 'First Seen Descending', value: 'first-seen-desc' },
        { label: 'Last Seen Ascending', value: 'last-seen-asc' },
        { label: 'Last Seen Descending', value: 'last-seen-desc' },
      ]}
      canClear={false}
      canSearch={false}
      Icon={ListOrdered}
    />
  );
};
