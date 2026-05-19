import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/common/design-system/atoms/ui/button';
import { FormattedBadge } from '@/common/design-system/molecules/formatted-badge';
import { EventValue } from '@/features/query-filters/components/interactive-value/event-value';
import { getFilterLabel } from '@/features/query-filters/utils/get-filter-label';

import { TimelineEventType, TimelineGroup } from '../../model/hunting-trail';

const SUMMARY_PAGE_SIZE = 5;

type EventItem = TimelineGroup['events'][number];

const displayIp = (event: EventItem) => event.flow?.src_ip ?? event.src_ip;
const displayDestIp = (event: EventItem) =>
  event.flow?.dest_ip ?? event.dest_ip;

type ColumnDef = {
  queryKey: string | ((e: EventItem) => string);
  getValue: (e: EventItem) => string | number | undefined;
};

const sigCol: ColumnDef = {
  queryKey: 'alert.signature',
  getValue: (e) => e.alert?.signature,
};
const srcCol: ColumnDef = { queryKey: 'flow.src_ip', getValue: displayIp };
const destCol: ColumnDef = {
  queryKey: 'flow.dest_ip',
  getValue: displayDestIp,
};
const getDnsRrname = (e: EventItem) =>
  e.dns?.rrname ??
  e.dns?.query?.[0]?.rrname ??
  e.dns?.queries?.[0]?.rrname ??
  e.dns?.answer?.[0]?.rrname ??
  e.dns?.answers?.[0]?.rrname;

const dnsCol: ColumnDef = {
  queryKey: 'dns.rrname',
  getValue: getDnsRrname,
};

const appProtoCol: ColumnDef = {
  queryKey: 'app_proto',
  getValue: (e) => e.app_proto,
};
const flowAgeCol: ColumnDef = {
  queryKey: 'flow.age',
  getValue: (e) => e.flow?.age,
};
const bytesToClientCol: ColumnDef = {
  queryKey: 'flow.bytes_toclient',
  getValue: (e) => e.flow?.bytes_toclient,
};
const bytesToServerCol: ColumnDef = {
  queryKey: 'flow.bytes_toserver',
  getValue: (e) => e.flow?.bytes_toserver,
};

const alertCols: ColumnDef[] = [sigCol, srcCol, destCol];
const dnsCols: ColumnDef[] = [dnsCol, srcCol, destCol, sigCol];
const sessionCols: ColumnDef[] = [srcCol, destCol, appProtoCol, flowAgeCol];
const biggerSessionCols: ColumnDef[] = [
  srcCol,
  destCol,
  bytesToClientCol,
  bytesToServerCol,
  flowAgeCol,
];

const TYPE_COLUMNS: Record<TimelineEventType, ColumnDef[]> = {
  nrd: [
    {
      queryKey: 'hostname_info.domain',
      getValue: (e) => e.hostname_info?.domain,
    },
    srcCol,
    destCol,
    sigCol,
  ],
  sightings: [
    { queryKey: 'discovery.asset', getValue: (e) => e.discovery?.asset },
    { queryKey: 'discovery.key', getValue: (e) => e.discovery?.key },
    {
      queryKey: (e) => e.discovery?.key ?? 'discovery.value',
      getValue: (e) => e.discovery?.value,
    },
  ],
  file: [
    {
      queryKey: (e) => (e.fileinfo ? 'fileinfo.filename' : 'files.filename'),
      getValue: (e) => e.fileinfo?.filename ?? e.files?.[0]?.filename,
    },
    {
      queryKey: (e) => (e.fileinfo ? 'fileinfo.mimetype' : 'files.mimetype'),
      getValue: (e) => e.fileinfo?.mimetype ?? e.files?.[0]?.mimetype,
    },
    {
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
    { queryKey: 'alert.lateral', getValue: (e) => e.alert?.lateral },
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
  unencryptedSmtpService: alertCols,
  unencryptedSmtpUsage: alertCols,
  ftpApplication: alertCols,
  ftpNetworkServices: alertCols,
};

type UniqueValue = {
  value: string;
  rawValue: string | number;
  count: number;
  queryKey: string;
};
type ColumnSummary = {
  queryKey: string;
  label: string;
  values: UniqueValue[];
};

function summarizeColumns(
  type: TimelineEventType,
  events: EventItem[],
): ColumnSummary[] {
  return TYPE_COLUMNS[type].map((col) => {
    const counts = new Map<
      string,
      { rawValue: string | number; count: number; queryKey: string }
    >();
    let resolvedKey = '';
    for (const event of events) {
      const raw = col.getValue(event);
      if (raw == null) continue;
      const key = String(raw);
      const qk =
        typeof col.queryKey === 'function' ? col.queryKey(event) : col.queryKey;
      if (!resolvedKey) resolvedKey = qk;
      const existing = counts.get(key);
      if (existing) {
        existing.count++;
      } else {
        counts.set(key, { rawValue: raw, count: 1, queryKey: qk });
      }
    }
    if (!resolvedKey) {
      resolvedKey = typeof col.queryKey === 'function' ? '' : col.queryKey;
    }
    const values: UniqueValue[] = [];
    for (const [value, { rawValue, count, queryKey }] of counts) {
      values.push({ value, rawValue, count, queryKey });
    }
    values.sort((a, b) => b.count - a.count);
    return {
      queryKey: resolvedKey,
      label: getFilterLabel(resolvedKey),
      values,
    };
  });
}

// --- Summary column with pagination ---

const SummaryColumn = ({ column }: { column: ColumnSummary }) => {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(column.values.length / SUMMARY_PAGE_SIZE);
  const visible = column.values.slice(
    page * SUMMARY_PAGE_SIZE,
    (page + 1) * SUMMARY_PAGE_SIZE,
  );

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="bg-muted/40 border-border flex h-7 items-center justify-between border-b px-3">
        <span className="text-muted-foreground text-xs font-medium">
          {column.label}{' '}
          <span className="text-muted-foreground/60">
            ({column.values.length})
          </span>
        </span>
        {totalPages > 1 && (
          <div className="text-foreground flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon-xs"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight />
            </Button>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-y-0.5 px-3 py-1">
        {visible.length === 0 ? (
          <span className="text-muted-foreground text-xs">—</span>
        ) : (
          visible.map(({ value, rawValue, count, queryKey }) => (
            <div
              key={value}
              className="flex items-center justify-between gap-2"
            >
              <EventValue
                query_key={queryKey}
                value={rawValue}
                className="min-w-0 truncate text-xs"
              />
              <FormattedBadge
                variant="secondary"
                className="shrink-0 rounded-full"
                value={count}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const CardSummary = ({
  type,
  events,
}: {
  type: TimelineEventType;
  events: TimelineGroup['events'];
}) => {
  const columns = useMemo(() => summarizeColumns(type, events), [type, events]);

  return (
    <div className="flex divide-x">
      {columns.map((col) => (
        <SummaryColumn
          key={col.queryKey || col.label}
          column={col}
        />
      ))}
    </div>
  );
};
