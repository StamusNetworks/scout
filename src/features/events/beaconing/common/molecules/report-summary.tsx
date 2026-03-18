import { useMemo } from 'react';

import { DataTable } from '@/common/design-system/molecules/data-table';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { formatBytes } from '@/common/lib/numbers';

import { BeaconingEvent } from '../beaconing-event.model';
import { useBeaconReport } from '../hooks/use-beacon-report';

// Columns

export const JA3SColumns: CustomColumnDef<BeaconingEvent['beacon_report']>[] = [
  {
    id: 'destinations',
    header: 'Destinations',
    enableSorting: false,
    accessorFn: (row) => row.serving_ip?.length,
  },
];
export const IPColumns: CustomColumnDef<BeaconingEvent['beacon_report']>[] = [
  {
    id: 'ja3s',
    header: 'JA3S',
    enableSorting: false,
    accessorFn: (row) => row.server_hash?.length,
  },
];

export const beaconingColumns: CustomColumnDef<
  BeaconingEvent['beacon_report']
>[] = [
  {
    id: 'hosts',
    header: 'Hosts',
    enableSorting: false,
    accessorFn: (row) => row.assets?.length,
  },
  {
    id: 'flow_counts',
    header: 'Flow counts',
    enableSorting: false,
    accessorFn: (row) => row.stats?.flow_count,
    meta: { viewLabel: 'Flows count' },
  },
  {
    id: 'flow_rx_total',
    header: 'Flow rx total',
    enableSorting: false,
    accessorFn: (row) => formatBytes(row.stats?.traffic_rx_total_bytes || 0),
    meta: { viewLabel: 'Flow rx total' },
  },
  {
    id: 'flow_tx_total',
    header: 'Flow tx total',
    enableSorting: false,
    accessorFn: (row) => formatBytes(row.stats?.traffic_tx_total_bytes || 0),
    meta: { viewLabel: 'Flow tx total' },
  },
  {
    id: 'flow_avg_size',
    header: 'Flow avg. size',
    enableSorting: false,
    accessorFn: (row) => formatBytes(row.stats?.traffic_avg_bytes || 0),
    meta: { viewLabel: 'Flow avg. size' },
  },
  {
    id: 'smallest_flow',
    header: 'Smallest flow',
    enableSorting: false,
    accessorFn: (row) => formatBytes(row.stats?.traffic_min_bytes || 0),
    meta: { viewLabel: 'Smallest flow' },
  },
  {
    id: 'largest_flow',
    header: 'Largest flow',
    enableSorting: false,
    accessorFn: (row) => formatBytes(row.stats?.traffic_max_bytes || 0),
    meta: { viewLabel: 'Largest flow' },
  },
  {
    id: 'flow_size_stdev',
    header: 'Flow size stdev',
    enableSorting: false,
    accessorFn: (row) =>
      formatBytes(
        (row.stats?.traffic_rx_std_dev_bytes || 0) +
          (row.stats?.traffic_tx_std_dev_bytes || 0),
      ),
    meta: { viewLabel: 'Flow size stdev' },
  },
];

// Component

interface ReportSummaryProps {
  value: string;
  type: 'ja3s' | 'ip';
}
export const ReportSummary = ({ value, type }: ReportSummaryProps) => {
  const { reports, isFetching } = useBeaconReport(type, value);
  const columns = [
    ...(type === 'ja3s' ? JA3SColumns : IPColumns),
    ...beaconingColumns,
  ];
  const data = useMemo(
    () =>
      reports
        ? {
            results: reports,
            count: 1,
          }
        : undefined,
    [reports],
  );
  return (
    <DataTable
      data={data}
      columns={columns}
      isLoading={isFetching}
      skeletonRows={1}
      paginationbar={false}
      serverSide={false}
    />
  );
};
