import { Link } from '@tanstack/react-router';
import { CircleAlert, LaptopMinimal } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/common/design-system/atoms/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/common/design-system/atoms/ui/empty';
import { ScrollArea } from '@/common/design-system/atoms/ui/scroll-area';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { isIP } from '@/common/lib/ips';
import { TogglePageContainer } from '@/features/app-shell';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';
import { useTenancy } from '@/features/tenancy';

import { useGetHostWithAlertsQuery } from '../../api/hosts.api';

type Props = { hostId: string; children: ReactNode };

export const HostDetailsShell = ({ hostId, children }: Props) => {
  const { tenant } = useGlobalQueryParams(['tenant']);
  const { multitenancy } = useTenancy();

  const isValidIp = Boolean(hostId && isIP(hostId));

  const {
    data: host,
    isLoading,
    isError,
  } = useGetHostWithAlertsQuery(
    { entity: hostId || '', tenant },
    { skip: !isValidIp },
  );

  if (!isValidIp) {
    return (
      <HostsBreadcrumbs hostId={hostId}>
        <CenteredEmpty>
          <EmptyMedia variant="icon">
            <CircleAlert />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>Invalid IP address</EmptyTitle>
            <EmptyDescription>
              &quot;{hostId}&quot; is not a valid IP address.
            </EmptyDescription>
          </EmptyHeader>
          <Link to="/hosts">
            <Button>Back to hosts</Button>
          </Link>
        </CenteredEmpty>
      </HostsBreadcrumbs>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spin />
      </div>
    );
  }

  if (isError || !host?.host_id) {
    return (
      <HostsBreadcrumbs hostId={hostId}>
        <CenteredEmpty>
          <EmptyMedia variant="icon">
            <LaptopMinimal />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>Host not found</EmptyTitle>
            <EmptyDescription>
              {multitenancy
                ? 'This host does not exist or you may be on the wrong tenant.'
                : 'This host does not exist. It may have been removed or the IP address is incorrect.'}
            </EmptyDescription>
          </EmptyHeader>
          <Link to="/hosts">
            <Button>Back to hosts</Button>
          </Link>
        </CenteredEmpty>
      </HostsBreadcrumbs>
    );
  }

  return (
    <>
      <OutletBreadcrumb link="/hosts">Hosts</OutletBreadcrumb>
      <OutletBreadcrumb>{hostId}</OutletBreadcrumb>
      <ScrollArea className="h-full w-full overflow-clip">
        <TogglePageContainer>{children}</TogglePageContainer>
      </ScrollArea>
    </>
  );
};

const HostsBreadcrumbs = ({
  hostId,
  children,
}: {
  hostId: string;
  children: ReactNode;
}) => (
  <>
    <OutletBreadcrumb link="/hosts">Hosts</OutletBreadcrumb>
    <OutletBreadcrumb>{hostId}</OutletBreadcrumb>
    {children}
  </>
);

const CenteredEmpty = ({ children }: { children: ReactNode }) => (
  <div className="flex h-full items-center justify-center px-8">
    <Empty className="h-fit w-fit">{children}</Empty>
  </div>
);
