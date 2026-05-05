import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import { useGetHostWithAlertsQuery } from '../../api/hosts.api';
import { HostValuesSort } from '../host-block/host-values-sort';
import { HostInsightsBlocks } from '../host-insights-blocks';

export interface HostInsightsViewProps {
  hostId: string;
}

export function HostInsightsView({ hostId }: HostInsightsViewProps) {
  const params = useGlobalQueryParams(['tenant']);
  const { isLoading, isError } = useGetHostWithAlertsQuery({
    entity: hostId || '',
    tenant: params.tenant,
  });

  if (isLoading) {
    return (
      <div
        className="flex h-48 w-full items-center justify-center"
        data-testid="host-insights-loading"
      >
        <Spin />
      </div>
    );
  }

  if (isError) {
    return null;
  }

  return (
    <Column className="gap-1">
      <Row>
        <HostValuesSort />
      </Row>
      <HostInsightsBlocks hostId={hostId} />
    </Column>
  );
}
