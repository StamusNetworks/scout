import { useNavigate } from 'react-router-dom';

import { DataTableToolbar } from '@/common/design-system/molecules/data-table/data-table.toolbar.tsx';
import { DataTable } from '@/common/design-system/molecules/data-table/data-table.tsx';
import { SwitchFilter } from '@/common/design-system/molecules/data-table/filters/switch-filter.tsx';
import { usePaginationUrlState } from '@/common/design-system/molecules/data-table/hooks/use-pagination.ts';
import { useUpdateEffect } from '@/common/lib/use-update-effect.ts';
import { routes } from '@/pages/routes.config.ts';

import { useHostsList } from '../../api/hooks/useHostsList.ts';
import { columns, exportColumns } from './hostsTable.columns.tsx';
import { HostsTableExpandedRow } from './hostsTable.expandedRow.tsx';
import { useWithAlertsParam } from './use-with-alerts-param.ts';

export const HostsTable = ({
  inHomeNetwork,
}: {
  inHomeNetwork: 'true' | 'false' | 'all';
}) => {
  const navigate = useNavigate();
  const [withAlerts, setWithAlerts] = useWithAlertsParam();
  const [pagination, setPagination] = usePaginationUrlState();

  useUpdateEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [inHomeNetwork, withAlerts]);

  const { data, isFetching } = useHostsList({
    pagination,
    withAlerts,
    inHomeNetwork,
  });

  return (
    <DataTable
      data={data}
      isLoading={isFetching}
      columns={columns.filter((col) => (withAlerts ? true : col.id !== 'hits'))}
      ExpandedRow={HostsTableExpandedRow}
      onRowClick={(row) => navigate(`${routes.hosts}/${row.original.ip}`)}
      pagination={pagination}
      onPaginationChange={setPagination}
      toolBar={
        <DataTableToolbar>
          <SwitchFilter
            title="Apply event filters"
            setValue={setWithAlerts}
            value={withAlerts}
          />
        </DataTableToolbar>
      }
      exportColumns={exportColumns.filter((col) =>
        withAlerts ? true : col.label !== 'Hits',
      )}
    />
  );
};
