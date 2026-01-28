import { useParams } from 'react-router-dom';

import { DataTable } from '@/common/design-system/molecules/data-table';
import { usePaginationUrlState } from '@/common/design-system/molecules/data-table/hooks/use-pagination';
import { useSortingUrlState } from '@/common/design-system/molecules/data-table/hooks/use-sorting';
import { getColumns } from '@/features/hunt/events/components/events-table/events.columns';
import { ExpandedEventRow } from '@/features/hunt/events/components/events-table/events.expanded-row';

import { useFamilyEvents } from '../../hooks/use-family-events';

const columns = getColumns(true);

export const ThreatFamilyEvents = () => {
  const { familyId } = useParams();
  const [pagination, setPagination] = usePaginationUrlState();
  const [sorting, setSorting, ordering] = useSortingUrlState();
  const { data, isLoading } = useFamilyEvents({
    familyId: familyId!,
    pagination,
    ordering,
  });
  return (
    <DataTable
      data={data}
      isLoading={isLoading}
      columns={columns}
      pagination={pagination}
      onPaginationChange={setPagination}
      ExpandedRow={ExpandedEventRow}
      sorting={sorting}
      onSortingChange={setSorting}
    />
  );
};
