import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/common/design-system/atoms/ui/popover';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { cn } from '@/common/lib/utils';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';
import { ThreatTag } from '@/features/threats/common/molecules/threat-tag';

import { useGetImpactedEntitiesQuery } from '../../../api/entities.api';
import { EntityThreat } from '../../../model/impacted-entity';

interface EntityThreatTagsListProps {
  entity: string;
  maxThreats?: number;
  className?: string;
}
export const EntityThreatTagsList = ({
  entity,
  className,
  maxThreats,
}: EntityThreatTagsListProps) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { threats, isLoading } = useGetImpactedEntitiesQuery(
    {
      ...params,
      asset: entity,
    },
    {
      selectFromResult: (result) => ({
        ...result,
        threats: result.data?.results?.[0]?.threats,
      }),
    },
  );

  if (isLoading) return <Spin />;
  if (!threats?.length) return <span>-</span>;
  return (
    <EntityThreatTagsListTemplate
      threats={threats}
      maxThreats={maxThreats}
      className={className}
    />
  );
};

interface EntityThreatTagsListTemplateProps {
  threats: EntityThreat[];
  maxThreats?: number;
  className?: string;
}

export const EntityThreatTagsListTemplate = ({
  threats,
  maxThreats,
  className,
}: EntityThreatTagsListTemplateProps) => {
  const tag = (threat: EntityThreat) => (
    <ThreatTag
      key={threat.threatId}
      threat_id={threat.threatId}
      kill_chain={threat.phase ?? undefined}
      is_offender={threat.isOffender}
      first_seen={threat.firstSeen.toISOString()}
      last_seen={threat.lastSeen.toISOString()}
      status={threat.status}
    />
  );

  return (
    <Row className={cn('gap-1', className)}>
      {maxThreats && maxThreats < threats.length ? (
        <>
          {threats.slice(0, maxThreats).map(tag)}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-6"
                onClick={(e) => e.stopPropagation()}
              >
                +{threats.length - maxThreats}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="flex max-w-96 flex-wrap gap-0.5 px-1.5 py-1">
              {threats.slice(maxThreats).map(tag)}
            </PopoverContent>
          </Popover>
        </>
      ) : (
        threats?.map(tag)
      )}
    </Row>
  );
};
