import { Spin } from '@/common/design-system/atoms/ui/spin';

import { Skeleton } from '../../atoms/ui/skeleton';
import { ProtoColumn } from './flow.columns';

interface FlowSkeletonProps<T = unknown> {
  columns?: ProtoColumn<T>[];
  rowCount: number;
}
export const FlowSkeleton = <T = unknown,>({
  columns = defaultColumns,
  rowCount,
}: FlowSkeletonProps<T>) => (
  <table
    style={{
      // display: areAllColumnsEmpty(columns, events) ? 'none' : 'block',
      overflowX: 'auto',
      width: `auto`,
      minWidth: `100%`,
      marginBottom: '0.65rem',
    }}
  >
    <thead>
      <tr className="border-border/50 mb-3 flex border-b-4">
        {columns.map((v) => (
          <th
            key={v.key}
            className="bg-border/50 text-card-foreground mr-[50px] flex w-[220px] cursor-default justify-center gap-4 rounded-t-lg py-2 text-sm font-bold last:mr-0"
          >
            {v.title} <Spin />
          </th>
        ))}
      </tr>
    </thead>
    <tbody className="space-y-4">
      {Array.from({ length: rowCount }).map((_, i) => (
        <tr
          key={i}
          className="flex gap-[50px]"
        >
          {columns.map((col) => (
            <td key={col.key}>
              <Skeleton className="h-10 w-[220px]" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

const defaultColumns: ProtoColumn[] = [
  {
    title: 'Loading...',
    key: 'a',
    missing: 'N/A',
  },
  {
    title: 'Loading..',
    key: 'b',
    missing: 'N/A',
  },
  {
    title: 'Loading..',
    key: 'c',
    missing: 'N/A',
  },
  {
    title: 'Loading..',
    key: 'd',
    missing: 'N/A',
  },
];
