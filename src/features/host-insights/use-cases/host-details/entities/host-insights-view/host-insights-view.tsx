import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { useGlobalQueryParams } from '@/features/filtering/use-global-query-params';
import { useGetHostWithAlertsQuery } from '@/features/host-insights/common/host-insights.api';

import { HostValuesSort } from '../../molecules/host-block/host-values-sort';
import { HostInsightsBlocks } from '../../molecules/host-insights-blocks';

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
