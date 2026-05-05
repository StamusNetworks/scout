import { Row } from '@tanstack/react-table';

import { TabsContent } from '@/common/design-system/atoms/ui/borderTabs';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/pillTabs';
import { ScrollArea } from '@/common/design-system/atoms/ui/scroll-area';
import { HostInsightsBlocks } from '@/features/host-insights/use-cases/host-details/molecules/host-insights-blocks';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';
import { CompromiseHuntingTrail } from '@/features/threats';
import { CompromiseTimeline } from '@/features/threats';

import { ImpactedEntity } from '../../model/impacted-entity';
import { ThreatKind } from '../../model/threat';
import { AttackerInfrastructure } from '../attacker-infrastructure/attacker-infrastructure';
import { ThreatsTable } from '../threats-table/threats-table';

export const ExpandedRow = (kind: ThreatKind) => {
  const ImpactedEntitiesTableExpandedRow = ({
    row,
  }: {
    row: Row<ImpactedEntity>;
  }) => {
    const { start_date, end_date } = useGlobalQueryParams(['dates']);
    const isCompromise = kind === 'compromise';
    return (
      <Tabs
        defaultValue={isCompromise ? 'timeline' : 'threats'}
        className="p-2"
      >
        <TabsList>
          {isCompromise && <TabsTrigger value="timeline">Timeline</TabsTrigger>}
          {isCompromise && (
            <TabsTrigger value="hunting-trail">Hunting Trail</TabsTrigger>
          )}
          {isCompromise && (
            <TabsTrigger value="attacker_infrastructure">
              Attacker infrastructure
            </TabsTrigger>
          )}
          <TabsTrigger value="threats">
            {isCompromise ? 'Threats' : 'Policy Violations'}
          </TabsTrigger>
          <TabsTrigger value="insights">Host Insights</TabsTrigger>
        </TabsList>
        {isCompromise && (
          <TabsContent value="timeline">
            <CompromiseTimeline entity={row.original.value} />
          </TabsContent>
        )}
        {isCompromise && (
          <TabsContent value="hunting-trail">
            <ScrollArea className="max-h-[800px]">
              <CompromiseHuntingTrail
                asset={row.original.value}
                startDate={start_date}
                endDate={end_date}
              />
            </ScrollArea>
          </TabsContent>
        )}
        {isCompromise && (
          <TabsContent value="attacker_infrastructure">
            <AttackerInfrastructure entity={row.original.value} />
          </TabsContent>
        )}
        <TabsContent value="threats">
          <ThreatsTable
            data={row.original.threats}
            kind={kind}
          />
        </TabsContent>
        <TabsContent value="insights">
          <HostInsightsBlocks hostId={row.original.value} />
        </TabsContent>
      </Tabs>
    );
  };
  return ImpactedEntitiesTableExpandedRow;
};
