import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/common/design-system/atoms/ui/popover';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { cn } from '@/common/lib/utils';
import { ThreatTag } from '@/features/threats/common/molecules/threat-tag';

import { useGetImpactedEntitiesQuery } from '../../entities.api';
import { Threat } from '../../entity';

interface EntityThreatTagsListProps {
  entity: string;
  maxThreats?: number;
  className?: string;
}
export const EntityThreatTagsList = ({
  entity: entity,
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
  threats: Threat[];
  maxThreats?: number;
  className?: string;
}

export const EntityThreatTagsListTemplate = ({
  threats,
  maxThreats,
  className,
}: EntityThreatTagsListTemplateProps) => (
  <Row className={cn('gap-1', className)}>
    {maxThreats && maxThreats < threats.length ? (
      <>
        {threats.slice(0, maxThreats).map((threat) => (
          <ThreatTag
            key={threat.threat__threat_id}
            threat_id={threat.threat__threat_id}
            kill_chain={threat.kill_chain}
            is_offender={threat.kill_chain_offender > 0}
            first_seen={threat.first_seen}
            last_seen={threat.last_seen}
            status={threat.status}
          />
        ))}
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
            {threats.slice(maxThreats).map((threat) => (
              <ThreatTag
                key={threat.threat__threat_id}
                threat_id={threat.threat__threat_id}
                kill_chain={threat.kill_chain}
                is_offender={threat.kill_chain_offender > 0}
                first_seen={threat.first_seen}
                last_seen={threat.last_seen}
                status={threat.status}
              />
            ))}
          </PopoverContent>
        </Popover>
      </>
    ) : (
      threats?.map((threat) => (
        <ThreatTag
          key={threat.threat__threat_id}
          threat_id={threat.threat__threat_id}
          kill_chain={threat.kill_chain}
          is_offender={threat.kill_chain_offender > 0}
          first_seen={threat.first_seen}
          last_seen={threat.last_seen}
          status={threat.status}
        />
      ))
    )}
  </Row>
);
