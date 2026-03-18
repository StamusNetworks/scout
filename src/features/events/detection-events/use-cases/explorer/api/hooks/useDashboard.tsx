import { useFeatureFlags } from '@/common/lib/use-feature-flags';
import { useAppSelector } from '@/store/store';

import { CEdashboard, dashboard } from '../../components/dashboard.config';
import {
  selectOrdering,
  selectPageSize,
} from '../../store/dashboard.selectors';
import { useFieldsStats } from './useFieldsStats';

export const useDashboard = () => {
  const ordering = useAppSelector(selectOrdering);
  const pageSize = useAppSelector(selectPageSize);
  const prefix = ordering === 'ascending' ? '-' : '';
  const { enterprise } = useFeatureFlags();
  return useFieldsStats(
    Object.values(enterprise ? dashboard : CEdashboard)
      .map((panel) => panel.items.map((i) => `${prefix}${i.i}`))
      .flat()
      .join(','),
    { page_size: pageSize },
  );
};
