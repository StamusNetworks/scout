import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/common/design-system/atoms/ui/button';
import { FormattedBadge } from '@/common/design-system/molecules/formatted-badge';
import { EventValue } from '@/features/filtering/filters/query-filters/use-cases/interactive-value/event-value';
import { getFilterLabel } from '@/features/filtering/filters/query-filters/utils/get-filter-label';

import { TimelineEventType, TimelineGroup } from '../hunting-trail.model';

const SUMMARY_PAGE_SIZE = 5;

type EventItem = TimelineGroup['events'][number];

const displayIp = (event: EventItem) => event.flow?.src_ip ?? event.src_ip;
const displayDestIp = (event: EventItem) =>
  event.flow?.dest_ip ?? event.dest_ip;

type ColumnDef = {
  queryKey: string | ((e: EventItem) => string);
  getValue: (e: EventItem) => string | number | undefined;
};

const TYPE_COLUMNS: Record<TimelineEventType, ColumnDef[]> = {
  nrd: [
    {
      queryKey: 'hostname_info.domain',
      getValue: (e) => e.hostname_info?.domain,
    },
    { queryKey: 'flow.src_ip', getValue: displayIp },
    { queryKey: 'flow.dest_ip', getValue: displayDestIp },
    { queryKey: 'alert.signature', getValue: (e) => e.alert?.signature },
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
    { queryKey: 'flow.src_ip', getValue: displayIp },
    { queryKey: 'flow.dest_ip', getValue: displayDestIp },
  ],
  lateral: [
    { queryKey: 'alert.signature', getValue: (e) => e.alert?.signature },
    { queryKey: 'flow.src_ip', getValue: displayIp },
    { queryKey: 'flow.dest_ip', getValue: displayDestIp },
    { queryKey: 'alert.lateral', getValue: (e) => e.alert?.lateral },
  ],
  hunting: [
    { queryKey: 'alert.signature', getValue: (e) => e.alert?.signature },
    { queryKey: 'flow.src_ip', getValue: displayIp },
    { queryKey: 'flow.dest_ip', getValue: displayDestIp },
  ],
};

type UniqueValue = { value: string; count: number; queryKey: string };
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
    const counts = new Map<string, { count: number; queryKey: string }>();
    let resolvedKey = '';
    for (const event of events) {
      const raw = col.getValue(event);
      const val = raw != null ? String(raw) : undefined;
      if (!val) continue;
      const qk =
        typeof col.queryKey === 'function' ? col.queryKey(event) : col.queryKey;
      if (!resolvedKey) resolvedKey = qk;
      const existing = counts.get(val);
      if (existing) {
        existing.count++;
      } else {
        counts.set(val, { count: 1, queryKey: qk });
      }
    }
    if (!resolvedKey) {
      resolvedKey = typeof col.queryKey === 'function' ? '' : col.queryKey;
    }
    const values: UniqueValue[] = [];
    for (const [value, { count, queryKey }] of counts) {
      values.push({ value, count, queryKey });
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
      <div className="border-border flex h-7 items-center justify-between border-b px-3">
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
          visible.map(({ value, count, queryKey }) => (
            <div
              key={value}
              className="flex items-center justify-between gap-2"
            >
              <EventValue
                query_key={queryKey}
                value={value}
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
