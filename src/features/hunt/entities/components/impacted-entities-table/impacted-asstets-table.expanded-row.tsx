import { Row } from '@tanstack/react-table';

import { TabsContent } from '@/common/design-system/atoms/ui/borderTabs';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/pillTabs';
import { HostInsightsBlocks } from '@/features/analytics/hosts/components/host-insights/host-insights';
import { ThreatsTimeline } from '@/features/hunt/timeline/components/timeline/timeline';

import { Entity } from '../../model/entity';
import { AttackerInfrastructure } from '../attacker-infrastructure/attacker-infrastructure';
import { ThreatsTable } from '../threats-table/threats-table';

export const ExpandedRow = (type: 'doc' | 'dopv') => {
  const ImpactedEntitiesTableExpandedRow = ({ row }: { row: Row<Entity> }) => {
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
            <ThreatsTimeline entity={row.original.value} />
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
