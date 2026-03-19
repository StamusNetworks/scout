import { useNavigate } from '@tanstack/react-router';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Badge } from '@/common/design-system/atoms/ui/badge';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/common/design-system/atoms/ui/hover-card';
import { Skeleton } from '@/common/design-system/atoms/ui/skeleton';
import { DateTime } from '@/common/design-system/entities/date-time';
import { cn } from '@/common/lib/utils';
import { selectIsAfterStart } from '@/features/filtering/dates/dates.selectors';
import { EventValue } from '@/features/filtering/query-filters/use-cases/interactive-value/event-value';
import { KillchainTag } from '@/features/threats/common/killchain/components/killchain-tag';
import { type KillChainPhase } from '@/features/threats/common/killchain/killchain';
import { useAppSelector } from '@/store/store';

import { useThreat } from '../hooks/use-threat';

interface ThreatTagProps {
  threat_id: number;
  kill_chain?: KillChainPhase | number;
  is_offender?: boolean;
  first_seen?: string;
  last_seen?: string;
  status?: 'new' | 'fixed';
  className?: string;
}

export const ThreatTag = ({
  threat_id,
  kill_chain,
  is_offender = false,
  first_seen,
  last_seen,
  status,
  className,
}: ThreatTagProps) => {
  const navigate = useNavigate();
  const isAfterStart = useAppSelector(
    selectIsAfterStart(first_seen ? new Date(first_seen) : new Date(0)),
  );
  const startedInRange = first_seen && isAfterStart;

  const { data: threatDef, isLoading } = useThreat(threat_id);
  if (isLoading) return <Skeleton className="h-4 w-full" />;
  if (!threatDef) return <span>-</span>;

  const handleClick = () => {
    const base =
      threatDef.family_class === 'doc' ? '/threats' : '/policy-violations';
    navigate({ to: `${base}/coverage/threat/${threatDef.pk}` });
  };

  return (
    <HoverCard>
      <HoverCardTrigger>
        <EventValue
          query_key="stamus.threat_name"
          value={threatDef.name}
          className="cursor-pointer"
          onClick={handleClick}
        >
          <Badge
            variant={
              status === 'fixed'
                ? 'muted'
                : is_offender
                  ? 'offender'
                  : threatDef.family_class === 'dopv'
                    ? 'policy_violation'
                    : 'victim'
            }
            className={cn(className, 'font-medium')}
          >
            {startedInRange && <span className="mr-2 text-[0.5rem]">● </span>}
            {threatDef.name}
          </Badge>
        </EventValue>
      </HoverCardTrigger>
      <HoverCardContent
        className="flex w-fit max-w-110 flex-col gap-2 text-sm"
        side="top"
      >
        <Row className="gap-3">
          <h3 className="text-sm font-bold">{threatDef.name}</h3>
          {kill_chain && <KillchainTag kc={kill_chain} />}
        </Row>
        {first_seen && last_seen && (
          <Row className="gap-3">
            <Column>
              <p className="text-muted-foreground text-xs font-bold">
                First seen
              </p>
              <DateTime date={first_seen} />
            </Column>
            <Column>
              <p className="text-muted-foreground text-xs font-bold">
                Last seen
              </p>
              <DateTime date={last_seen} />
            </Column>
          </Row>
        )}
        <p>{threatDef.description}</p>
      </HoverCardContent>
    </HoverCard>
  );
};
