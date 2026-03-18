import { useNavigate } from '@tanstack/react-router';
import { LayoutDashboard } from 'lucide-react';
import { useCallback, useMemo } from 'react';

import { Badge } from '@/common/design-system/atoms/ui/badge';
import { ContextMenuItem } from '@/common/design-system/atoms/ui/context-menu';
import { cn } from '@/common/lib/utils';
import { EventValue } from '@/features/filtering/query-filters/components/event-value/event-value';
import { replaceFilters } from '@/features/filtering/query-filters/store/query-filters.slice';
import { useAppDispatch } from '@/store/store';

import { KillChainMap, killChainsConfig } from '../killchain';

export const KillchainTag = ({
  kc,
  status,
  className,
  onClick,
  context,
}: {
  kc: keyof typeof killChainsConfig | number;
  status?: 'fixed' | 'new';
  className?: string;
  onClick?: () => void;
  context?: { es_key: string; value: string | number }[];
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const killchain =
    typeof kc === 'number'
      ? KillChainMap[kc.toString() as keyof typeof KillChainMap]
      : kc;
  const label =
    killChainsConfig[killchain]?.shorthand?.toUpperCase() ||
    killChainsConfig[killchain]?.name.toUpperCase();

  const defaultOnClick = useCallback(() => {
    navigate({ to: '/threats/compromises/entities?killchain=' + killchain });
  }, [navigate, killchain]);

  const contextMenuOptions = useMemo(
    () => (
      <ContextMenuItem
        key="explore-with-context"
        onClick={() => {
          dispatch(
            replaceFilters([
              { key: 'stamus.kill_chain', value: killchain },
              ...(context?.map(({ es_key, value }) => ({
                key: es_key,
                value,
              })) || []),
            ]),
          );
          navigate({ to: '/explorer' });
        }}
      >
        <LayoutDashboard /> Explore with context
      </ContextMenuItem>
    ),
    [dispatch, context, killchain, navigate],
  );

  if (killchain === 'pre_condition') return null;

  return (
    <EventValue
      query_key="stamus.kill_chain"
      value={killchain}
      className="cursor-pointer no-underline"
      onClick={onClick ?? defaultOnClick}
      contextMenuOptions={contextMenuOptions}
    >
      <Badge
        className={cn(
          `flex h-5 w-32 items-center justify-center px-2 text-[0.65rem] leading-0 font-bold text-nowrap`,
          className,
        )}
        variant={status === 'fixed' ? 'muted' : killchain}
        rounded="full"
      >
        {label}
      </Badge>
    </EventValue>
  );
};
