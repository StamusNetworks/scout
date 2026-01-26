import { useNavigate } from 'react-router-dom';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Badge } from '@/common/design-system/atoms/ui/badge';
import { Skeleton } from '@/common/design-system/atoms/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/common/design-system/atoms/ui/tooltip';
import { cn } from '@/common/lib/utils';
import { routes } from '@/pages/routes.config';
import { useAppSelector } from '@/store/store';

import { EntityThreat } from '../../entities/model/impacted-entity.schema';
import { selectIsAfterStart } from '../../filtering/dates-filters/dates-filters';
import { EventValue } from '../../filtering/query-filters/components/event-value/event-value';
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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
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
        </TooltipTrigger>
        <TooltipContent className="max-w-48">
          <p className="mb-1 italic">
            {threatDef?.family_class === 'doc'
              ? 'Compromise'
              : 'Policy Violation'}
            {' - '}{' '}
            {threat.kill_chain_offender > 0 || is_offender
              ? 'Offender'
              : 'Victim'}
          </p>
          <h3 className="mb-1 text-sm font-medium">{threatDef.name}</h3>
          {isLoadingDef ? (
            <Column className="gap-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-24" />
            </Column>
          ) : (
            threatDef?.description
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
