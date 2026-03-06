import { Row } from '@tanstack/react-table';
import { Radar } from 'lucide-react';
import { useQueryState } from 'nuqs';

import { DataTable } from '@/common/design-system/molecules/data-table';
import { ExportColumn } from '@/common/design-system/molecules/data-table/data-table';
import { DataTableToolbar } from '@/common/design-system/molecules/data-table/data-table.toolbar';
import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { CommandFilterSingle } from '@/common/design-system/molecules/data-table/filters/command-filter-single';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { TextFilter } from '@/common/design-system/molecules/data-table/filters/text-filter';
import { useServerTableState } from '@/common/design-system/molecules/data-table/hooks/use-server-table-state.ts';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { esEscape } from '@/common/lib/strings';
import { Event } from '@/features/hunt/events/model/event.schema';

import { useGetSightingEventsQuery } from '../../api/sightings.api';

export const SightingsTable = ({
  columns,
  exportColumns,
  onRowClick,
}: {
  columns: CustomColumnDef<Event>[];
  exportColumns?: ExportColumn<Event>[];
  onRowClick?: (row: Row<Event>) => void;
}) => {
  const [role, setRole] = useQueryState('role');
  const [search, setSearch] = useQueryState('value', { defaultValue: '' });
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const roleQfilter = !role
    ? null
    : role === 'unclassified'
      ? '(NOT discovery.asset_role:*)'
      : `discovery.asset_role:${role}`;
  const searchQfilter = search
    ? search
        .split(' ')
        .map((s) => `discovery.value:*${esEscape(s)}*`)
        .join(' AND ')
    : null;
  const qfilter =
    roleQfilter && searchQfilter
      ? `${roleQfilter} AND ${searchQfilter}`
      : roleQfilter || searchQfilter;
  const { queryParams, pagination, setPagination, sorting, setSorting } =
    useServerTableState({
      ...params,
      ...(qfilter && { qfilter }),
    });
  const { data, isFetching } = useGetSightingEventsQuery(queryParams);
  const toolBar = (
    <DataTableToolbar>
      <TextFilter
        value={search}
        onChange={setSearch}
        placeholder="Search by discovered value"
      />
      <CommandFilterSingle
        title="Role"
        value={role}
        onChange={setRole}
        options={[
          {
            label: 'Domain Controller',
            value: 'domain controller',
          },
          {
            label: 'Printer',
            value: 'printer',
          },
          {
            label: 'DHCP Server',
            value: 'dhcp server',
          },
          {
            label: 'Proxy',
            value: 'proxy',
          },
          {
            label: 'Unclassified',
            value: 'unclassified',
          },
        ]}
      />
    </DataTableToolbar>
  );
  return (
    <DataTable
      data={data}
      isLoading={isFetching}
      columns={columns}
      onRowClick={onRowClick}
      serverSide
      pagination={pagination}
      onPaginationChange={setPagination}
      sorting={sorting}
      onSortingChange={setSorting}
      toolBar={toolBar}
      exportColumns={exportColumns}
      Empty={
        <DataTableEmpty
          Icon={Radar}
          entity="sightings"
        />
      }
    />
  );
};
