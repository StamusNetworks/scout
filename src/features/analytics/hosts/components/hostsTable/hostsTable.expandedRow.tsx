import { Row } from '@tanstack/react-table';
import { Activity } from 'lucide-react';

import { Grid } from '@/common/design-system/atoms/layout/grid';
import { TableCard } from '@/common/design-system/molecules/table-card';

import { Host } from '../../model/host';
import { HostBlock } from '../host-insights/hostBlock';
import { getBlocks } from '../host-insights/hostBlock/hostBlock.config';
import { HostProfile } from '../hostProfile/hostProfile';
import { getHostProfileChartData } from '../hostProfile/hostProfile.utils';

export const HostsTableExpandedRow = ({ row }: { row: Row<Host> }) => {
  const hostProfileData = getHostProfileChartData(row.original);
  const blocks = getBlocks(row.original);
  return (
    <Grid className="grid-cols-[repeat(auto-fill,minmax(32rem,1fr))] gap-2 p-2">
      <TableCard
        title="Host Profile"
        Icon={Activity}
        headers={[
          'Services',
          'TLS Agents',
          'HTTP User Agents',
          'Hostnames',
          'Usernames',
        ]}
        data={[
          {
            services: row.original.host_id?.services || 0,
            tls_agents: row.original.host_id?.['tls.ja4_count'] || 0,
            http_user_agents:
              row.original.host_id?.['http.user_agent_count'] || 0,
            hostnames: row.original.host_id?.hostname_count || 0,
            usernames: row.original.host_id?.username_count || 0,
          },
        ]}
      >
        <HostProfile data={hostProfileData} />
      </TableCard>
      {blocks
        .filter((block) => block.data?.length)
        .map((block) => (
          <HostBlock
            key={block.title}
            title={block.title + ` (${block.data?.length})`}
            data={block.data}
            filterId={block.filter}
            type={block.type as 'default' | 'expandable'}
            Icon={block.Icon}
          />
        ))}
    </Grid>
  );
};
