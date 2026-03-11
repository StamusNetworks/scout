import { useParams } from '@tanstack/react-router';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useGetHostWithAlertsQuery } from '@/features/analytics/hosts/api/hosts.api';
import { HostValuesSort } from '@/features/analytics/hosts/components/host-insights/host-values-sort';
import { HostBlock } from '@/features/analytics/hosts/components/host-insights/hostBlock';
import { getBlocks } from '@/features/analytics/hosts/components/host-insights/hostBlock/hostBlock.config';

export const HostInsights = () => {
  const { hostId } = useParams({ strict: false }) as { hostId: string };
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { data: host } = useGetHostWithAlertsQuery({
    entity: hostId || '',
    tenant: params.tenant,
  });
  const activityBlocks = getBlocks(host);

  return (
    <Column className="gap-1">
      <Row>
        <HostValuesSort />
      </Row>
      <Grid className="grid-cols-[repeat(auto-fill,minmax(24rem,1fr))] gap-2">
        {activityBlocks
          .filter((block) => block.data?.length)
          .map((block) => (
            <HostBlock
              key={block.title}
              title={block.title + ` (${block.data?.length || 0})`}
              data={block.data}
              filterId={block.filter}
              type={block.type as 'default' | 'expandable'}
              Icon={block.Icon}
            />
          ))}
        {activityBlocks
          .filter((block) => !block.data?.length)
          .map((block) => (
            <HostBlock
              key={block.title}
              title={block.title + ` (${block.data?.length || 0})`}
              data={block.data}
              filterId={block.filter}
              type={block.type as 'default' | 'expandable'}
              Icon={block.Icon}
            />
          ))}
      </Grid>
    </Column>
  );
};
