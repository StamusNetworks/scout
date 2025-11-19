import { Row } from '@tanstack/react-table';
import { useMemo } from 'react';

import { JsonView } from '@/common/design-system/atoms/json-view';
import { DataTable } from '@/common/design-system/molecules/data-table';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';

interface RelatedTableProps<EventType extends object> {
  data: EventType[];
  columns: CustomColumnDef<EventType>[];
}

export function RelatedTable<EventType extends object>({
  data,
  columns,
}: RelatedTableProps<EventType>) {
  const tableData = useMemo(
    () => ({
      results: data,
      count: data.length,
    }),
    [data],
  );
  return (
    <DataTable
      columns={columns}
      data={tableData}
      ExpandedRow={RelatedTableExpandedRow}
      serverSide={false}
    />
  );
}

export function RelatedTableExpandedRow<EventType extends object>({
  row,
}: {
  row: Row<EventType>;
}) {
  return <JsonView data={row.original} />;
}
