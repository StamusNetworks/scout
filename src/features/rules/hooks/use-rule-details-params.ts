import { useMemo } from 'react';

import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';
import { useQFBuilder } from '@/features/query-filters/hooks/use-qf-builder';

export const useRuleDetailsParams = (
  sid: number,
  applyGlobalFilters: boolean,
) => {
  const QFBuilder = useQFBuilder();
  const params = useGlobalQueryParams(['dates', 'qfilter', 'tenant'], {
    extendQfilter: [QFBuilder.createFilter('alert.signature_id', sid)],
  });

  const QF = useMemo(() => {
    if (applyGlobalFilters) {
      return {
        qfilter: params.qfilter,
        alert: params.alert,
        discovery: params.discovery,
        stamus: params.stamus,
      };
    } else {
      return {
        qfilter: QFBuilder.toQFString(
          [QFBuilder.createFilter('alert.signature_id', sid)],
          {
            informational: true,
            relevant: true,
            untagged: true,
          },
        ),
        alert: true,
        discovery: true,
        stamus: true,
      };
    }
  }, [applyGlobalFilters, params, QFBuilder, sid]);

  return {
    from: params.from,
    to: params.to,
    tenant: params.tenant,
    ...QF,
  };
};
