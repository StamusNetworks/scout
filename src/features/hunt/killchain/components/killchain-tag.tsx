import { Badge } from '@/common/design-system/atoms/ui/badge';
import { cn } from '@/common/lib/utils';

import { EventValue } from '../../filtering/query-filters/components/event-value/event-value';
import { KillChainMap, killChainsConfig } from '../killchain';

export const KillchainTag = ({
  kc,
  status,
  className,
  onClick,
}: {
  kc: keyof typeof killChainsConfig | number;
  status?: 'fixed' | 'new';
  className?: string;
  onClick?: () => void;
}) => {
  const killchain =
    typeof kc === 'number'
      ? KillChainMap[kc.toString() as keyof typeof KillChainMap]
      : kc;
  const label =
    killChainsConfig[killchain]?.shorthand?.toUpperCase() ||
    killChainsConfig[killchain]?.name.toUpperCase();

  return (
    <EventValue
      query_key="stamus.kill_chain"
      value={killchain}
      className="no-underline"
      onClick={onClick}
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
