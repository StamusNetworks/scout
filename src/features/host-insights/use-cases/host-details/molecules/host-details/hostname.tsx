import { LaptopMinimal } from 'lucide-react';

import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/common/design-system/atoms/ui/popover';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { cn } from '@/common/lib/utils';
import { Host } from '@/features/host-insights/common/host.model';
import { EventValue } from '@/features/query-filters/use-cases/interactive-value/event-value';

import { useGetHostInsights } from '../../hooks/use-get-host-insights';
import { DetailsVariants, detailsVariants } from './details.variants';

interface HostnameProps extends DetailsVariants {
  host: string;
  className?: string;
}
export const Hostname = ({ host, className, size }: HostnameProps) => {
  const { data, isFetching, isError } = useGetHostInsights(host);
  if (isFetching) return <Spin />;
  if (isError) return null;
  return (
    <HostnameTemplate
      hostnames={data?.host_id.hostname}
      className={className}
      size={size}
    />
  );
};
interface HostnameTemplateProps extends DetailsVariants {
  hostnames: Host['host_id']['hostname'];
  className?: string;
}
export const HostnameTemplate = ({
  hostnames,
  className,
  size,
}: HostnameTemplateProps) => {
  if (!hostnames?.length) return null;
  const sortedHostnames = sortHostnames(hostnames);
  return (
    <Row className={cn('items-center', detailsVariants({ size }), className)}>
      <LaptopMinimal className="mr-1 shrink-0" />
      <EventValue
        query_key="host_id.hostname.host"
        value={sortedHostnames[0].host}
      />
      {sortedHostnames.length > 1 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="ml-1 h-6 px-2"
              onClick={(e) => e.stopPropagation()}
            >
              +{sortedHostnames.length - 1}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="flex max-w-96 flex-col gap-2 py-3 text-sm">
            {sortedHostnames.slice(1).map((hostname) => (
              <EventValue
                key={hostname.host}
                query_key="host_id.hostname.host"
                value={hostname.host}
              />
            ))}
          </PopoverContent>
        </Popover>
      )}
    </Row>
  );
};

const sortHostnames = (hostnames: NonNullable<Host['host_id']['hostname']>) => {
  return hostnames
    .filter((hostname) => hostname.host !== '$')
    .toSorted(
      (a, b) =>
        new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime(),
    );
};
