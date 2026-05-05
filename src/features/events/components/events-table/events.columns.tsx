import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { ScrollArea } from '@/common/design-system/atoms/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/common/design-system/atoms/ui/tooltip';
import { DateTime } from '@/common/design-system/entities/date-time';
import { ExportColumn } from '@/common/design-system/molecules/data-table/data-table';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DataTableRowExpander } from '@/common/design-system/molecules/data-table/data-table.row-expander';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { cn } from '@/common/lib/utils';
import { Event } from '@/features/events/model/event';
import { Hostname } from '@/features/host-insights/components/host-attributes/hostname';
import { Network } from '@/features/host-insights/components/host-attributes/network';
import { EventValue } from '@/features/query-filters/components/interactive-value/event-value';

export const getColumns = (
  enterprise: boolean = true,
): CustomColumnDef<Event>[] => [
  {
    id: 'event-expanded',
    cell: ({ row }) => <DataTableRowExpander row={row} />,
    enableHiding: false,
    meta: {
      canReorder: false,
    },
  },
  {
    id: 'tag',
    header: () => null,
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger onClick={(e) => e.stopPropagation()}>
            <div
              className={cn('size-2 rounded-full', {
                'bg-untagged': row.original.alert?.tag === undefined,
                'bg-informational': row.original.alert?.tag === 'informational',
                'bg-relevant': row.original.alert?.tag === 'relevant',
              })}
            />
          </TooltipTrigger>
          <TooltipContent>
            {row.original.alert?.tag || 'Untagged'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
    meta: {
      canReorder: false,
    },
  },
  {
    id: 'timestamp',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Timestamp"
      />
    ),
    cell: ({ row }) => <DateTime date={row.original.timestamp} />,
  },
  {
    id: 'method',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Method"
      />
    ),
    cell: ({ row }) =>
      row.original.alert?.signature ? (
        <EventValue
          query_key="alert.signature"
          value={row.original.alert?.signature}
          className="line-clamp-2 max-w-112 min-w-80 whitespace-break-spaces"
        />
      ) : row.original.event_type === 'stamus' ? (
        row.original.stamus?.threat_name
      ) : null,
  },
  {
    id: 'source',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Source"
      />
    ),
    cell: ({ row }) => {
      const data = row.original.flow ? row.original.flow : row.original;
      const prefix = row.original.flow ? 'flow.' : '';
      return (
        <Column>
          <Row className="mb-1 gap-1">
            <EventValue
              query_key={`${prefix}src_ip`}
              value={data.src_ip}
            />
            <span>:</span>
            <EventValue
              query_key={`${prefix}src_port`}
              value={data.src_port}
            />
          </Row>
          <Hostname
            host={data.src_ip}
            size="small"
          />
          <Network
            host={data.src_ip}
            size="small"
          />
        </Column>
      );
    },
    meta: { viewLabel: 'Source IP' },
  },
  {
    id: 'destination',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Destination"
      />
    ),
    cell: ({ row }) => {
      const data = row.original.flow ? row.original.flow : row.original;
      const prefix = row.original.flow ? 'flow.' : '';
      return (
        <Column>
          <Row className="mb-1 gap-1">
            <EventValue
              query_key={`${prefix}dest_ip`}
              value={data.dest_ip}
            />
            <span>:</span>
            <EventValue
              query_key={`${prefix}dest_port`}
              value={data.dest_port}
            />
          </Row>
          <Hostname
            host={data.dest_ip}
            size="small"
          />
          <Network
            host={data.dest_ip}
            size="small"
          />
        </Column>
      );
    },
    meta: { viewLabel: 'Destination IP' },
  },
  {
    id: 'protocol',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Proto"
      />
    ),
    cell: ({ row }) => (
      <EventValue
        query_key="app_proto"
        value={row.original.app_proto}
      />
    ),
  },
  {
    id: 'host',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Probe"
      />
    ),
    cell: ({ row }) => (
      <EventValue
        query_key="host"
        value={row.original.host}
      />
    ),
  },
  {
    id: 'category',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Category"
      />
    ),
    cell: ({ row }) => (
      <div className="max-w-48">
        <EventValue
          query_key="alert.category"
          value={row.original.alert?.category}
        />
      </div>
    ),
  },
  ...(enterprise
    ? ([
        {
          id: 'hostname_host',
          visible: false,
          header: ({ column }) => (
            <DataTableColumnHeader
              column={column}
              title="Hostname host"
            />
          ),
          cell: ({ row }) => (
            <EventValue
              query_key="hostname_info.host"
              value={row.original.hostname_info?.host}
            />
          ),
        },
      ] as CustomColumnDef<Event>[])
    : []),
  {
    id: 'lateral',
    visible: false,
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Lateral"
      />
    ),
    cell: ({ row }) => (
      <EventValue
        query_key="alert.lateral"
        value={row.original.alert?.lateral}
      />
    ),
  },
  {
    id: 'tls_sni',
    visible: false,
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="TLS SNI"
      />
    ),
    cell: ({ row }) =>
      row.original.app_proto === 'tls' && (
        <EventValue
          query_key="tls.sni"
          value={row.original.tls?.sni}
        />
      ),
  },
  {
    id: 'http_url',
    visible: false,
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="HTTP URL"
      />
    ),
    cell: ({ row }) =>
      row.original.app_proto === 'http' && (
        <EventValue
          query_key="http.url"
          value={row.original.http?.url}
        />
      ),
  },
  {
    id: 'payload_printable',
    visible: false,
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Payload"
      />
    ),
    cell: ({ row }) =>
      row.original.payload_printable && (
        <Scrollable string={row.original.payload_printable} />
      ),
  },
  {
    id: 'http_request',
    visible: false,
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="HTTP Request"
      />
    ),
    cell: ({ row }) =>
      row.original.app_proto === 'http' &&
      row.original.http?.http_request_body_printable && (
        <Scrollable string={row.original.http.http_request_body_printable} />
      ),
  },
  {
    id: 'http_response',
    visible: false,
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="HTTP Response"
      />
    ),
    cell: ({ row }) =>
      row.original.app_proto === 'http' &&
      row.original.http?.http_response_body_printable && (
        <Scrollable string={row.original.http.http_response_body_printable} />
      ),
  },
  {
    id: 'outlier',
    visible: false,
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Outlier"
      />
    ),
    cell: ({ row }) => (
      <EventValue
        query_key="stamus_novel"
        value={(!!row.original.stamus_novel).toString()}
      />
    ),
  },
];

export const exportColumns: ExportColumn<Event>[] = [
  {
    label: 'Timestamp',
    value: (event) => event.timestamp,
  },
  {
    label: 'Method',
    value: (event) =>
      event.alert?.signature ||
      (event.event_type === 'stamus' && event.stamus?.threat_name) ||
      '',
  },
  {
    label: 'Source IP',
    value: (event) => event.src_ip || event.flow?.src_ip || '',
  },
  {
    label: 'Destination IP',
    value: (event) => event.dest_ip || event.flow?.dest_ip || '',
  },
  {
    label: 'Proto',
    value: (event) => event.app_proto || '',
  },
  {
    label: 'Probe',
    value: (event) => event.host || '',
  },
  {
    label: 'Category',
    value: (event) => event.alert?.category || '',
  },
];

const Scrollable = ({
  string,
  className,
}: {
  string: string;
  className?: string;
}) => {
  return (
    <div className="flex">
      <ScrollArea
        className={cn(
          'flex max-h-48 w-full max-w-[600px] overflow-clip text-xs wrap-anywhere',
          className,
        )}
      >
        <pre className="block">{string}</pre>
      </ScrollArea>
    </div>
  );
};
