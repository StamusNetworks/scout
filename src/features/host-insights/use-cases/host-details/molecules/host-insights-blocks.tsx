import { Grid } from '@/common/design-system/atoms/layout/grid';
import { cn } from '@/common/lib/utils';
import { useGlobalQueryParams } from '@/features/filtering/use-global-query-params';
import { useGetHostWithAlertsQuery } from '@/features/host-insights/common/host-insights.api';

import { HostBlock } from './host-block';
import { getBlocks } from './host-block/host-block.config';

interface HostInsightsBlocksProps {
  hostId: string;
  className?: string;
}
export const HostInsightsBlocks = ({
  hostId,
  className,
}: HostInsightsBlocksProps) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { data: host } = useGetHostWithAlertsQuery({
    entity: hostId || '',
    tenant: params.tenant,
  });
  const insightsBlocks = getBlocks(host);

  return (
    <Grid
      className={cn(
        'grid-cols-[repeat(auto-fill,minmax(24rem,1fr))] gap-2',
        className,
      )}
    >
      {insightsBlocks
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
      {insightsBlocks
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
  );
};
