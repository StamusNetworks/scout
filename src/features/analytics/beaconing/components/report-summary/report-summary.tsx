import { useMemo } from 'react';

import { DataTable } from '@/common/design-system/molecules/data-table';

import { useBeaconReport } from '../../hooks/use-beacon-report';
import {
  beaconingColumns,
  IPColumns,
  JA3SColumns,
} from './report-summary.columns';

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
