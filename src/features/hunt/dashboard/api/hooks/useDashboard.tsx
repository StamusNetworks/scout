import { useAppSelector } from '@/store/store';

import { dashboard } from '../../components/dashboard.config';
import {
  selectOrdering,
  selectPageSize,
} from '../../store/dashboard.selectors';
import { useFieldsStats } from './useFieldsStats';

export const useDashboard = () => {
  const ordering = useAppSelector(selectOrdering);
  const pageSize = useAppSelector(selectPageSize);
  const prefix = ordering === 'ascending' ? '-' : '';
  return useFieldsStats(
    Object.values(dashboard)
      .map((panel) => panel.items.map((i) => `${prefix}${i.i}`))
      .flat()
      .join(','),
    { page_size: pageSize },
  );
};
