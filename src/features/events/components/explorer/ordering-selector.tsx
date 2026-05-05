import { ListOrdered } from 'lucide-react';

import { CommandFilterSingle } from '@/common/design-system/molecules/data-table/filters/command-filter-single';
import { useAppDispatch, useAppSelector } from '@/store/store';

import { selectOrdering } from '../../state/dashboard.selectors';
import { setOrdering } from '../../state/dashboard.slice';

export const OrderingSelector = () => {
  const dispatch = useAppDispatch();
  const ordering = useAppSelector(selectOrdering);
  return (
    <CommandFilterSingle
      title="Order"
      value={ordering}
      onChange={(value) => dispatch(setOrdering(value as typeof ordering))}
      options={[
        {
          label: 'Descending',
          value: 'descending',
        },
        {
          label: 'Ascending',
          value: 'ascending',
        },
      ]}
      canClear={false}
      canSearch={false}
      Icon={ListOrdered}
    />
  );
};
