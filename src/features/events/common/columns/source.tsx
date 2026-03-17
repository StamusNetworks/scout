import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import type { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { Hostname } from '@/features/analytics/hosts/components/host-details/hostname';
import { Network } from '@/features/analytics/hosts/components/host-details/network';
import { EventValue } from '@/features/hunt/filtering/query-filters/components/event-value/event-value';

import type { Event } from '../model/event.schema';

export const SOURCE_COLUMN: CustomColumnDef<Event> = {
  id: 'source',
  header: ({ column }) => (
    <DataTableColumnHeader
      column={column}
      title="Source"
    />
  ),
  cell: ({ row }) => {
    const data = row.original.flow ? row.original.flow : row.original;
    const prefix = row.original.flow ? 'flow.' : '';
    return (
      <Column>
        <Row className="mb-1 gap-1">
          <EventValue
            query_key={`${prefix}src_ip`}
            value={data.src_ip}
          />
          <span>:</span>
          <EventValue
            query_key={`${prefix}src_port`}
            value={data.src_port}
          />
        </Row>
        <Hostname
          host={data.src_ip}
          size="small"
        />
        <Network
          host={data.src_ip}
          size="small"
        />
      </Column>
    );
  },
  meta: { viewLabel: 'Source IP' },
};
