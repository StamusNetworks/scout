import { NetworkIcon } from 'lucide-react';

import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/common/design-system/atoms/ui/popover';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { cn } from '@/common/lib/utils';
import { useGetHostInsights } from '@/features/host-insights/hooks/use-get-host-insights';
import { Host } from '@/features/host-insights/model/host';
import { EventValue } from '@/features/query-filters/components/interactive-value/event-value';

import { DetailsVariants, detailsVariants } from './details.variants';

const queryKeys = {
  host: 'host_id.net_info.agg',
  source: 'alert.source.net_info_agg',
  target: 'alert.target.net_info_agg',
} as const;
type QueryKey = keyof typeof queryKeys;

interface NetworkProps extends DetailsVariants {
  host: string;
  keyType?: QueryKey;
  className?: string;
}
export const Network = ({
  host,
  keyType = 'host',
  size,
  className,
}: NetworkProps) => {
  const { data, isFetching, isError } = useGetHostInsights(host);
  if (isFetching) return <Spin />;
  if (isError) return null;
  return (
    <NetworkTemplate
      networks={data?.host_id.net_info}
      keyType={keyType}
      size={size}
      className={className}
    />
  );
};

interface NetworkTemplateProps extends DetailsVariants {
  networks: Host['host_id']['net_info'] | undefined;
  keyType?: QueryKey;
  className?: string;
}
export const NetworkTemplate = ({
  networks,
  keyType = 'host',
  className,
  size,
}: NetworkTemplateProps) => {
  if (!networks?.length) return null;
  const queryKey = queryKeys[keyType];
  const sortedNetworks = sortNetworks(networks);
  return (
    <Row className={cn('items-center', detailsVariants({ size }), className)}>
      <NetworkIcon className="mr-1 shrink-0" />
      <EventValue
        query_key={queryKey}
        value={sortedNetworks[0].agg}
      />
      {sortedNetworks.length > 1 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="ml-1 h-6 px-2"
              onClick={(e) => e.stopPropagation()}
            >
              +{sortedNetworks.length - 1}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="flex max-w-96 flex-col gap-2 py-3 text-sm">
            {sortedNetworks.slice(1).map((network) => (
              <EventValue
                key={network.agg}
                query_key={queryKey}
                value={network.agg}
              />
            ))}
          </PopoverContent>
        </Popover>
      )}
    </Row>
  );
};

const sortNetworks = (networks: NonNullable<Host['host_id']['net_info']>) => {
  return networks
    .filter((network) => network.agg !== '$')
    .toSorted(
      (a, b) =>
        new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime(),
    );
};
