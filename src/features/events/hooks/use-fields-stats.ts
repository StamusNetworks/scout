import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';
import { useQFBuilder } from '@/features/query-filters/hooks/use-qf-builder';

import { useGetDashboardFieldsQuery } from '../api/dashboard.api';

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
