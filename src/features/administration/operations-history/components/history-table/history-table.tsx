import { Row } from '@tanstack/react-table';

import { DataTable } from '@/common/design-system/molecules/data-table';
import { usePaginationUrlState } from '@/common/design-system/molecules/data-table/hooks/use-pagination';

import { useGetOperationsHistoryQuery } from '../../api/operations-history.api';
import { OperationRecord } from '../../model/operation-record.schema';
import { columns } from './history-table.columns';

export const HistoryTable = () => {
  const [pagination, setPagination] = usePaginationUrlState();
  const { data, isFetching } = useGetOperationsHistoryQuery(pagination);
  return (
    <DataTable
      data={data}
      isLoading={isFetching}
      columns={columns}
      pagination={pagination}
      onPaginationChange={setPagination}
      ExpandedRow={ExpandedRow}
    />
  );
};

const ExpandedRow = ({ row }: { row: Row<OperationRecord> }) => (
  <div className="p-4">{row.original.comment}</div>
);
