import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { DataTable } from '@/common/design-system/molecules/data-table/data-table.tsx';
import { usePaginationUrlState } from '@/common/design-system/molecules/data-table/hooks/use-pagination.ts';
import { useSortingUrlState } from '@/common/design-system/molecules/data-table/hooks/use-sorting.ts';
import { routes } from '@/pages/routes.config.ts';

import { useHostsList } from '../../api/hooks/useHostsList.ts';
import { columns, exportColumns } from './hostsTable.columns.tsx';
import { HostsTableExpandedRow } from './hostsTable.expandedRow.tsx';

export const InventoryTable = ({
  inHomeNetwork,
}: {
  inHomeNetwork: 'true' | 'false' | 'all';
}) => {
  const navigate = useNavigate();
  const [pagination, setPagination] = usePaginationUrlState();
  const [sorting, setSorting, ordering] = useSortingUrlState();
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [inHomeNetwork]);
  const { data, isFetching } = useHostsList({
    pagination,
    withAlerts: false,
    inHomeNetwork,
    ordering: ordering ?? '-host_id.last_seen',
  });

  return (
    <DataTable
      data={data}
      isLoading={isFetching}
      columns={columns.filter((col) => col.id !== 'hits')}
      ExpandedRow={HostsTableExpandedRow}
      onRowClick={(row) => navigate(`${routes.hosts}/${row.original.ip}`)}
      pagination={pagination}
      onPaginationChange={setPagination}
      sorting={sorting}
      onSortingChange={setSorting}
      exportColumns={exportColumns.filter((col) => col.label !== 'Hits')}
    />
  );
};
