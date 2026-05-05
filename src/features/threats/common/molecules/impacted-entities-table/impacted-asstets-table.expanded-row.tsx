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

import { Entity } from '../../../api/impacted-entity.dto';
import { AttackerInfrastructure } from '../attacker-infrastructure/attacker-infrastructure';
import { ThreatsTable } from '../threats-table/threats-table';

export const ExpandedRow = (type: 'doc' | 'dopv') => {
  const ImpactedEntitiesTableExpandedRow = ({ row }: { row: Row<Entity> }) => {
    const { start_date, end_date } = useGlobalQueryParams(['dates']);
    return (
      <Tabs
        defaultValue={type === 'doc' ? 'timeline' : 'threats'}
        className="p-2"
      >
        <TabsList>
          {type === 'doc' && (
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          )}
          {type === 'doc' && (
            <TabsTrigger value="hunting-trail">Hunting Trail</TabsTrigger>
          )}
          {type === 'doc' && (
            <TabsTrigger value="attacker_infrastructure">
              Attacker infrastructure
            </TabsTrigger>
          )}
          <TabsTrigger value="threats">
            {type === 'doc' ? 'Threats' : 'Policy Violations'}
          </TabsTrigger>
          <TabsTrigger value="insights">Host Insights</TabsTrigger>
        </TabsList>
        {type === 'doc' && (
          <TabsContent value="timeline">
            <CompromiseTimeline entity={row.original.value} />
          </TabsContent>
        )}
        {type === 'doc' && (
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
        {type === 'doc' && (
          <TabsContent value="attacker_infrastructure">
            <AttackerInfrastructure entity={row.original.value} />
          </TabsContent>
        )}
        <TabsContent value="threats">
          <ThreatsTable
            data={row.original.threats}
            type={type}
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
