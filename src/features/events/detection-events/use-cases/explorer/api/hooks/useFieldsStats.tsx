import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useQFBuilder } from '@/features/filtering/query-filters/hooks/use-qf-builder';

import { useGetDashboardFieldsQuery } from '../dashboard.api';

export const useFieldsStats = (
  fields: string,
  options?: {
    qfilter?: { key: string; value: string | number }[];
    page_size?: number;
  },
) => {
  const QFBuilder = useQFBuilder();
  const params = useGlobalQueryParams(
    ['tenant', 'qfilter', 'qfilterHost', 'dates'],
    {
      extendQfilter: options?.qfilter?.map((f) =>
        QFBuilder!.createFilter(f.key, f.value),
      ),
    },
  );

  return useGetDashboardFieldsQuery({
    ...params,
    fields,
    page_size: options?.page_size,
  });
};
