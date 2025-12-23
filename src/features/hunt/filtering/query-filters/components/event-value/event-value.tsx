import { ListRestart } from 'lucide-react';
import punycode from 'punycode/';

import { Row } from '@/common/design-system/atoms/layout/row';
import {
  ContextMenu,
  ContextMenuTrigger,
} from '@/common/design-system/atoms/ui/context-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/common/design-system/atoms/ui/tooltip';
import { compressIPv6, isIPv6 } from '@/common/lib/ips';
import { cn } from '@/common/lib/utils';
import { useAppDispatch } from '@/store/store';

import { getFilterDef } from '../../constants/query-filter.definition';
import { addQueryFilter } from '../../store/query-filters.slice';
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
  const dispatch = useAppDispatch();

  if (value === undefined) return null;

  const displayValue = formatFn
    ? typeof value === 'string'
      ? (formatFn as (value: string) => string)(value)
      : (formatFn as (value: number) => string)(value)
    : isIPv6(value?.toString())
      ? compressIPv6(value?.toString())
      : value?.toString();
  const decoded = decode(value?.toString());
  return (
    <ContextMenu>
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
                dispatch(addQueryFilter({ key: query_key, value }));
              }
            }}
            className={cn(
              'text-primary decoration-primary/30 max-w-fit cursor-context-menu truncate font-semibold underline decoration-dashed underline-offset-4 hover:no-underline',
              className,
            )}
            data-testid="event-value"
            title={displayValue}
          >
            {children ?? (displayValue || 'Unknown')}
          </div>
          {decoded !== value?.toString() && (
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
      <ContextMenuContent
        query_key={query_key}
        value={value}
        displayValue={displayValue}
        contextMenuOptions={contextMenuOptions}
      />
    </ContextMenu>
  );
};
