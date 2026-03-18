import { ListOrdered } from 'lucide-react';

import { CommandFilterSingle } from '@/common/design-system/molecules/data-table/filters/command-filter-single';

import {
  type HostsValuesSort,
  useValuesSortParam,
} from './use-values-sort-param';

export const HostValuesSort = () => {
  const [sort, setSort] = useValuesSortParam();

  return (
    <CommandFilterSingle
      title="Block values"
      value={sort}
      onChange={(value) => setSort(value as HostsValuesSort)}
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
