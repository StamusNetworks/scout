import { Grid } from '@/common/design-system/atoms/layout/grid';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { cn } from '@/common/lib/utils';

import { useGetHostWithAlertsQuery } from '../../api/hosts.api';
import { HostBlock } from './hostBlock';
import { getBlocks } from './hostBlock/hostBlock.config';

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
