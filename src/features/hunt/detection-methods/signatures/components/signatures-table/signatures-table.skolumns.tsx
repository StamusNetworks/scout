import { Skeleton } from '@/common/design-system/atoms/ui/skeleton';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { Signature } from '@/features/hunt/detection-methods/signatures/model/signature';

export const skeletonColumns: CustomColumnDef<Signature>[] = [
  {
    accessorKey: 'sid',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Signature ID"
      />
    ),
    cell: () => <Skeleton className="h-5 w-24 text-sm" />,
  },
  {
    accessorKey: 'category',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Category"
      />
    ),
    cell: () => <Skeleton className="h-5 w-24 text-sm" />,
  },
  {
    accessorKey: 'msg',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Message"
      />
    ),
    cell: () => <Skeleton className="h-5 w-80 text-sm" />,
  },
  {
    accessorKey: 'created',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Created"
      />
    ),
    cell: () => <Skeleton className="h-5 w-24 text-sm" />,
  },
];
