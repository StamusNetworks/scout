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

export const ExpandedRow = ({ row }: { row: Row<Entity> }) => {
  return (
    <Tabs
      defaultValue="timeline"
      className="p-2"
    >
      <TabsList>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="attacker_infrastructure">
          Attacker infrastructure
        </TabsTrigger>
        <TabsTrigger value="insights">Host Insights</TabsTrigger>
      </TabsList>
      <TabsContent value="timeline">
        <ThreatsTimeline entity={row.original.value} />
      </TabsContent>
      <TabsContent value="attacker_infrastructure">
        <AttackerInfrastructure entity={row.original.value} />
      </TabsContent>
      <TabsContent value="insights">
        <HostInsightsBlocks hostId={row.original.value} />
      </TabsContent>
    </Tabs>
  );
};
