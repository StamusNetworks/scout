import { useNavigate } from 'react-router-dom';

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
import { routes } from '@/pages/routes.config';
import { useAppSelector } from '@/store/store';

import { EntityThreat } from '../../entities/model/impacted-entity.schema';
import { selectIsAfterStart } from '../../filtering/dates-filters/dates-filters';
import { EventValue } from '../../filtering/query-filters/components/event-value/event-value';
import { KillchainTag } from '../../killchain/components/killchain-tag';
import { useThreat } from '../hooks/use-threat';

type ThreatWithoutLifecycle = Omit<
  EntityThreat,
  'status' | 'first_seen' | 'last_seen'
>;

export const ThreatTagById = ({
  threatId,
  is_offender = false,
}: {
  threatId: number;
  is_offender?: boolean;
}) => {
  const { data, isLoading } = useThreat(threatId);
  if (isLoading) return <Skeleton className="h-4 w-full" />;
  if (!data) return null;
  const threatFallback: ThreatWithoutLifecycle = {
    threat__threat_id: data.pk,
    threat__name: data.name,
    threat__family__family_id: data.family,
    kill_chain: 0,
    kill_chain_offender: 0,
  };
  return (
    <ThreatTag
      threat={threatFallback}
      threatId={threatId}
      is_offender={is_offender}
    />
  );
};

export const ThreatTag = ({
  threat,
  threatId,
  className,
  is_offender,
}: {
  threatId?: number;
  threat:
    | EntityThreat
    | Omit<EntityThreat, 'status' | 'first_seen' | 'last_seen'>;
  is_offender?: boolean;
  className?: string;
}) => {
  const navigate = useNavigate();
  const isAfterStart = useAppSelector(
    selectIsAfterStart(
      'first_seen' in threat ? new Date(threat.first_seen) : new Date(0),
    ),
  );
  const startedInRange = 'first_seen' in threat && isAfterStart;

  const { data: threatDef, isLoading: isLoadingDef } = useThreat(
    threatId || threat.threat__threat_id,
  );
  if (isLoadingDef) return <Skeleton className="h-4 w-full" />;
  if (!threatDef) return <span>-</span>;

  const handleClick = () => {
    const baseRoute =
      threatDef.family_class === 'doc'
        ? routes.threats_coverage_threat
        : routes.policy_violations_coverage_threat;
    const route = baseRoute.replace(':threatId', threatDef.pk.toString());
    navigate(route);
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
              'status' in threat && threat.status === 'fixed'
                ? 'muted'
                : threat.kill_chain_offender > 0 || is_offender
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
        className="w-fit max-w-110 text-sm"
        side="top"
      >
        <Row className="gap-3">
          <h3 className="text-sm font-bold">{threatDef.name}</h3>
          <KillchainTag kc={threat.kill_chain} />
        </Row>
        {'first_seen' in threat && 'last_seen' in threat && (
          <Row className="my-2 gap-3">
            <Column>
              <p className="text-muted-foreground text-xs font-bold">
                First seen
              </p>
              <DateTime date={threat.first_seen} />
            </Column>
            <Column>
              <p className="text-muted-foreground text-xs font-bold">
                Last seen
              </p>
              <DateTime date={threat.last_seen} />
            </Column>
          </Row>
        )}
        {isLoadingDef ? (
          <Column className="gap-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-24" />
          </Column>
        ) : (
          <p>{threatDef?.description}</p>
        )}
      </HoverCardContent>
    </HoverCard>
  );
};
