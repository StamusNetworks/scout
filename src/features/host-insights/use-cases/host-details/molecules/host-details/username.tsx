import { User } from 'lucide-react';

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
import { EventValue } from '@/features/hunt/filtering/query-filters/components/event-value/event-value';

import { useGetHostInsights } from '../../hooks/use-get-host-insights';
import { DetailsVariants, detailsVariants } from './details.variants';

interface UsernameProps extends DetailsVariants {
  host: string;
  className?: string;
}
export const Username = ({ host, className, size }: UsernameProps) => {
  const { data, isFetching, isError } = useGetHostInsights(host);
  if (isFetching) return <Spin />;
  if (isError) return null;
  return (
    <UsernameTemplate
      usernames={data?.host_id.username}
      size={size}
      className={className}
    />
  );
};
interface UsernameTemplateProps extends DetailsVariants {
  usernames: Host['host_id']['username'];
  className?: string;
}
export const UsernameTemplate = ({
  usernames,
  size,
  className,
}: UsernameTemplateProps) => {
  if (!usernames?.length) return null;
  const sortedUsernames = sortUsernames(usernames);
  return (
    <Row className={cn('items-center', detailsVariants({ size }), className)}>
      <User className="mr-1 shrink-0" />
      <EventValue
        query_key="host_id.username.user"
        value={sortedUsernames[0].user}
      />
      {sortedUsernames.length > 1 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="ml-1 h-6 px-2"
              onClick={(e) => e.stopPropagation()}
            >
              +{sortedUsernames.length - 1}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="flex max-w-96 flex-col gap-2 py-3 text-sm">
            {sortedUsernames.slice(1).map((username) => (
              <EventValue
                key={username.user}
                query_key="host_id.username.user"
                value={username.user}
              />
            ))}
          </PopoverContent>
        </Popover>
      )}
    </Row>
  );
};

const sortUsernames = (usernames: NonNullable<Host['host_id']['username']>) => {
  return usernames
    .filter((username) => username.user !== '$')
    .sort(
      (a, b) =>
        new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime(),
    );
};
