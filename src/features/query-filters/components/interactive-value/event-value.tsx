import { ListRestart } from 'lucide-react';
import punycode from 'punycode/';
import { useState } from 'react';

import { Row } from '@/common/design-system/atoms/layout/row';
import {
  ContextMenu,
  ContextMenuTrigger,
} from '@/common/design-system/atoms/ui/context-menu';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/common/design-system/atoms/ui/hover-card';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/common/design-system/atoms/ui/tooltip';
import { compressIPv6, isIP, isIPv6 } from '@/common/lib/ips';
import { cn } from '@/common/lib/utils';
import { useGetHostInsights } from '@/features/host-insights/use-cases/host-details/hooks/use-get-host-insights';
import { HostSummary } from '@/features/host-insights/use-cases/host-details/molecules/host-summary';
import { useGetImpactedEntityQuery } from '@/features/threats/api/entities.api';

import { getFilterDef } from '../../definitions/query-filter.definitions';
import { useCreateFilter } from '../../hooks/use-create-filter';
import { useGlobalQueryParams } from '../../hooks/use-global-query-params';
import { ContextMenuContent } from './context-menu/context-menu.content';

const decode = (value: string) => {
  try {
    return punycode.toUnicode(value);
  } catch {
    return value;
  }
};

export const EventValue = ({
  query_key,
  value,
  formatFn = getFilterDef(query_key)?.toDisplayValue,
  className,
  children,
  contextMenuOptions,
  onClick,
}: {
  query_key: string;
  value: string | number | undefined;
  formatFn?: ((value: string) => string) | ((value: number) => string);
  className?: string;
  children?: React.ReactNode;
  contextMenuOptions?: React.ReactNode;
  onClick?: () => void;
}) => {
  const createFilter = useCreateFilter();
  const rawValue = value?.toString() || '';
  const isHostIp = rawValue ? isIP(rawValue) : false;

  if (value === undefined) return null;
  const displayValue = formatFn
    ? typeof value === 'string'
      ? (formatFn as (value: string) => string)(value)
      : (formatFn as (value: number) => string)(value)
    : isIPv6(rawValue || '')
      ? compressIPv6(rawValue || '')
      : rawValue;
  const decoded = decode(rawValue);
  const eventValueTrigger = (
    <ContextMenuTrigger
      className="max-w-fit overflow-hidden"
      asChild
    >
      <Row>
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (onClick) {
              onClick();
            } else {
              createFilter({ key: query_key, value });
            }
          }}
          className={cn(
            'text-primary decoration-primary/30 max-w-fit cursor-context-menu truncate font-semibold underline decoration-dashed underline-offset-4 hover:no-underline',
            className,
          )}
          data-testid="event-value"
        >
          {children ?? (displayValue || 'Unknown')}
        </div>
        {decoded !== rawValue && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="ml-2 flex size-5 shrink-0 items-center justify-center rounded-full bg-yellow-200 font-bold text-yellow-950">
                <ListRestart className="size-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Possible punycode:</p>
                <p className="font-semibold">{decoded}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </Row>
    </ContextMenuTrigger>
  );
  return (
    <ContextMenu>
      {isHostIp ? (
        <HostHoverCard
          host={rawValue}
          trigger={eventValueTrigger}
        />
      ) : (
        eventValueTrigger
      )}
      <ContextMenuContent
        query_key={query_key}
        value={value}
        displayValue={displayValue}
        contextMenuOptions={contextMenuOptions}
      />
    </ContextMenu>
  );
};

const HostHoverCard = ({
  host,
  trigger,
}: {
  host: string;
  trigger: React.ReactNode;
}) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const [isHoverOpen, setIsHoverOpen] = useState(false);
  const {
    data: hostData,
    isFetching,
    isError,
  } = useGetHostInsights(host, isHoverOpen);
  const { data: entityData } = useGetImpactedEntityQuery(
    {
      ...params,
      asset: host,
    },
    {
      skip: !isHoverOpen,
    },
  );
  return (
    <HoverCard
      open={isHoverOpen}
      onOpenChange={setIsHoverOpen}
    >
      <HoverCardTrigger asChild>{trigger}</HoverCardTrigger>
      <HoverCardContent
        className="z-50 w-128 max-w-[90vw]"
        side="right"
        align="start"
        sideOffset={8}
        collisionPadding={8}
        onClick={stopPropagation}
      >
        {isFetching ? (
          <div className="flex items-center justify-center">
            <Spin />
          </div>
        ) : isError ? (
          <p className="text-muted-foreground text-sm">
            Unable to load host details.
          </p>
        ) : hostData ? (
          <HostSummary
            host={hostData}
            entity={entityData}
            hostId={host}
          />
        ) : (
          <p className="text-muted-foreground text-sm">No host details.</p>
        )}
      </HoverCardContent>
    </HoverCard>
  );
};

const stopPropagation = (e: React.MouseEvent<HTMLDivElement>) => {
  e.stopPropagation();
};
