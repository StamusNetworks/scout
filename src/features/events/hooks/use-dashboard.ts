import { useFeatureFlags } from '@/common/lib/use-feature-flags';
import { useAppSelector } from '@/store/store';

import { CEdashboard, dashboard } from '../definitions/dashboard.config';
import { selectOrdering, selectPageSize } from '../state/dashboard.selectors';
import { useFieldsStats } from './use-fields-stats';

export const useDashboard = () => {
  const ordering = useAppSelector(selectOrdering);
  const pageSize = useAppSelector(selectPageSize);
  const prefix = ordering === 'ascending' ? '-' : '';
  const { enterprise } = useFeatureFlags();
  return useFieldsStats(
    Object.values(enterprise ? dashboard : CEdashboard)
      .flatMap((panel) => panel.items.map((i) => `${prefix}${i.i}`))
      .join(','),
    { page_size: pageSize },
  );
};
