import { Link } from '@tanstack/react-router';
import { Binary } from 'lucide-react';

import { Button } from '@/common/design-system/atoms/ui/button';
import { DateTime } from '@/common/design-system/entities/date-time';
import { EventValue } from '@/features/query-filters/components/interactive-value/event-value';

import { TimelineEventType, TimelineGroup } from '../../model/hunting-trail';

type EventItem = TimelineGroup['events'][number];

const displayIp = (event: EventItem) => event.flow?.src_ip ?? event.src_ip;
const displayDestIp = (event: EventItem) =>
  event.flow?.dest_ip ?? event.dest_ip;

type TableColumnDef = {
  header: string;
  queryKey: string | ((e: EventItem) => string);
  getValue: (e: EventItem) => string | number | undefined;
  plain?: boolean;
};

const sigCol: TableColumnDef = {
  header: 'Signature',
  queryKey: 'alert.signature',
  getValue: (e) => e.alert?.signature,
};
const srcCol: TableColumnDef = {
  header: 'Src IP',
  queryKey: 'src_ip',
  getValue: displayIp,
};
const destCol: TableColumnDef = {
  header: 'Dest IP',
  queryKey: 'dest_ip',
  getValue: displayDestIp,
};
const getDnsRrname = (e: EventItem) =>
  e.dns?.rrname ??
  e.dns?.query?.[0]?.rrname ??
  e.dns?.queries?.[0]?.rrname ??
  e.dns?.answer?.[0]?.rrname ??
  e.dns?.answers?.[0]?.rrname;

const dnsCol: TableColumnDef = {
  header: 'DNS Query',
  queryKey: 'dns.rrname',
  getValue: getDnsRrname,
};

const appProtoCol: TableColumnDef = {
  header: 'App Proto',
  queryKey: 'app_proto',
  getValue: (e) => e.app_proto,
};
const flowAgeCol: TableColumnDef = {
  header: 'Duration (s)',
  queryKey: 'flow.age',
  getValue: (e) => e.flow?.age,
  plain: true,
};
const bytesToClientCol: TableColumnDef = {
  header: 'Bytes to Client',
  queryKey: 'flow.bytes_toclient',
  getValue: (e) => e.flow?.bytes_toclient,
  plain: true,
};
const bytesToServerCol: TableColumnDef = {
  header: 'Bytes to Server',
  queryKey: 'flow.bytes_toserver',
  getValue: (e) => e.flow?.bytes_toserver,
  plain: true,
};

const alertCols: TableColumnDef[] = [sigCol, srcCol, destCol];
const dnsCols: TableColumnDef[] = [dnsCol, srcCol, destCol, sigCol];
const sessionCols: TableColumnDef[] = [
  srcCol,
  destCol,
  appProtoCol,
  flowAgeCol,
];
const biggerSessionCols: TableColumnDef[] = [
  srcCol,
  destCol,
  bytesToClientCol,
  bytesToServerCol,
  flowAgeCol,
];

const TYPE_TABLE_COLUMNS: Record<TimelineEventType, TableColumnDef[]> = {
  nrd: [
    {
      header: 'Domain',
      queryKey: 'hostname_info.domain',
      getValue: (e) => e.hostname_info?.domain,
    },
    srcCol,
    destCol,
    sigCol,
  ],
  sightings: [
    {
      header: 'Asset',
      queryKey: 'discovery.asset',
      getValue: (e) => e.discovery?.asset,
    },
    {
      header: 'Key',
      queryKey: 'discovery.key',
      getValue: (e) => e.discovery?.key,
      plain: true,
    },
    {
      header: 'Value',
      queryKey: (e) => e.discovery?.key ?? 'discovery.value',
      getValue: (e) => e.discovery?.value,
    },
  ],
  file: [
    {
      header: 'Filename',
      queryKey: (e) => (e.fileinfo ? 'fileinfo.filename' : 'files.filename'),
      getValue: (e) => e.fileinfo?.filename ?? e.files?.[0]?.filename,
    },
    {
      header: 'MIME type',
      queryKey: (e) => (e.fileinfo ? 'fileinfo.mimetype' : 'files.mimetype'),
      getValue: (e) => e.fileinfo?.mimetype ?? e.files?.[0]?.mimetype,
    },
    {
      header: 'Size',
      queryKey: (e) => (e.fileinfo ? 'fileinfo.size' : 'files.size'),
      getValue: (e) => e.fileinfo?.size ?? e.files?.[0]?.size,
    },
    srcCol,
    destCol,
  ],
  lateral: [
    sigCol,
    srcCol,
    destCol,
    {
      header: 'Movement',
      queryKey: 'alert.lateral',
      getValue: (e) => e.alert?.lateral,
    },
  ],
  hunting: alertCols,
  remoteAdmin: alertCols,
  remoteRegistry: alertCols,
  postExploit: alertCols,
  ipDownload: alertCols,
  rawProtocol: alertCols,
  userEnum: alertCols,
  powershell: alertCols,
  newServers: alertCols,
  smbSightings: alertCols,
  torrent: alertCols,
  smtpExe: alertCols,
  base64Encoding: alertCols,
  maliciousFilenames: alertCols,
  suspiciousFilenames: alertCols,
  longDomains: dnsCols,
  shortDomains: dnsCols,
  exeSightings: alertCols,
  dynamicDns: dnsCols,
  tor: alertCols,
  publicDns: dnsCols,
  smtpUnencrypted: alertCols,
  base64Decoding: [
    {
      header: 'Payload',
      queryKey: 'payload_printable',
      getValue: (e) => e.payload_printable,
    },
    srcCol,
    destCol,
  ],
  ssh: sessionCols,
  longerSsh: sessionCols,
  rdp: sessionCols,
  rfbVnc: sessionCols,
  biggerTcp: biggerSessionCols,
  longerTcp: sessionCols,
  biggerUdp: biggerSessionCols,
  longerUdp: sessionCols,
  biggerIcmp: biggerSessionCols,
  longerIcmp: sessionCols,
};

export const CardEventsTable = ({
  type,
  events,
}: {
  type: TimelineEventType;
  events: TimelineGroup['events'];
}) => {
  const columns = TYPE_TABLE_COLUMNS[type];

  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="bg-muted/40 border-border border-b">
          <th className="text-muted-foreground px-3 py-2 text-left font-normal">
            Time
          </th>
          {columns.map((col) => (
            <th
              key={col.header}
              className="text-muted-foreground px-3 py-2 text-left font-normal"
            >
              {col.header}
            </th>
          ))}
          <th />
        </tr>
      </thead>
      <tbody>
        {events.map((event) => (
          <tr
            key={event._id}
            className="border-border border-b last:border-0"
          >
            <td className="text-muted-foreground px-3 py-1.5 whitespace-nowrap">
              <DateTime date={event.timestamp} />
            </td>
            {columns.map((col) => {
              const queryKey =
                typeof col.queryKey === 'function'
                  ? col.queryKey(event)
                  : col.queryKey;
              const value = col.getValue(event);
              return (
                <td
                  key={col.header}
                  className="px-3 py-1.5"
                >
                  {col.plain ? (
                    <span className="text-muted-foreground">{value}</span>
                  ) : (
                    <EventValue
                      query_key={queryKey}
                      value={value}
                    />
                  )}
                </td>
              );
            })}
            <td className="px-3 py-1.5 text-right">
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-foreground"
                asChild
              >
                <Link
                  to="/detection-events/event"
                  search={{ _id: event._id }}
                  preload={false}
                >
                  <Binary />
                </Link>
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
