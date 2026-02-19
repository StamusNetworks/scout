import { ArrowUpDown, HardDriveDownload, HardDriveUpload } from 'lucide-react';
import { useState } from 'react';

import { DefaultPage } from '@/common/design-system/atoms/default-page';
import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import { Card, CardContent } from '@/common/design-system/atoms/ui/card';
import { Label as UILabel } from '@/common/design-system/atoms/ui/label';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { Switch } from '@/common/design-system/atoms/ui/switch';
import { DateTime } from '@/common/design-system/entities/date-time';
import { BarChartTimeline } from '@/common/design-system/graphs/bar-chart-timeline/bar-chart-timeline';
import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { usePaginationUrlState } from '@/common/design-system/molecules/data-table/hooks/use-pagination';
import { Pagination } from '@/common/design-system/molecules/pagination';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { getDuration } from '@/common/lib/duration';
import { formatBytes, formatNumber } from '@/common/lib/numbers';
import { startsWithOneOf } from '@/common/lib/strings';
import { Hostname } from '@/features/analytics/hosts/components/host-details/hostname';
import { Network } from '@/features/analytics/hosts/components/host-details/network';
import {
  useGetEventsTailQuery,
  useGetEventsTimelineQuery,
} from '@/features/hunt/events/api/events.api';
import {
  EventDetailTabs,
  FilesTab,
  JsonTab,
  MetaViewTab,
  PcapTab,
  RelatedEventsTabs,
  SyntheticTab,
} from '@/features/hunt/events/components/event-detail-tabs';
import { Event } from '@/features/hunt/events/model/event.schema';
import { setDates } from '@/features/hunt/filtering/dates-filters/dates-filters.slice';
import { EventValue } from '@/features/hunt/filtering/query-filters/components/event-value/event-value';
import { FilterLabel } from '@/features/hunt/filtering/query-filters/components/filter-label';
import { FilterCategory } from '@/features/hunt/filtering/query-filters/constants/query-filter.config';
import { useQueryFiltersDefinitions } from '@/features/hunt/filtering/query-filters/hooks/use-filters-definitions';
import { useQFBuilder } from '@/features/hunt/filtering/query-filters/hooks/use-qf-builder';
import { selectQueryFilters } from '@/features/hunt/filtering/query-filters/store/query-filters.selector';
import { KillchainTag } from '@/features/hunt/killchain/components/killchain-tag';
import { killChainsConfig } from '@/features/hunt/killchain/killchain';
import { ThreatTag } from '@/features/hunt/threats/components/threat-tag';
import { CountsTimeline } from '@/features/hunt/timeline/models/counts-timeline.model';
import { selectDefaultEventDetailTab } from '@/features/ui/preferences/preferences.slice';
import { useAppDispatch, useAppSelector } from '@/store/store';

export const TransactionsPage = () => {
  const [groupByFlow, setGroupByFlow] = useState(true);
  const [pagination, setPagination] = usePaginationUrlState(20);
  const filters = useAppSelector(selectQueryFilters);
  const QFBuilder = useQFBuilder();
  const definitions = useQueryFiltersDefinitions();
  const qfilter = QFBuilder.toQFString(
    filters.filter(
      (f) =>
        !f.is_suspended &&
        definitions[f.key]?.category === FilterCategory.EVENT &&
        !startsWithOneOf(f.key, ['alert.', 'stamus.', 'discovery.']),
    ),
  );
  const params = useGlobalQueryParams(['dates', 'tenant']);

  const qfString = `(flow_id:* AND NOT event_type:(alert OR stamus OR discovery)) ${qfilter ? `AND ${qfilter}` : ''}`;

  const { data, totalCount, isFetching } = useGetEventsTailQuery(
    {
      ...params,
      ...pagination,
      qfilter: qfString,
    },
    {
      selectFromResult: (result) => ({
        ...result,
        totalCount: result?.data?.count || 0,
        data: (groupByFlow
          ? {
              type: 'grouped',
              data: Object.values(
                result?.data?.results?.reduce(
                  (acc, curr) => {
                    if (acc[curr.flow_id!]) {
                      acc[curr.flow_id!].push(curr);
                    } else {
                      acc[curr.flow_id!] = [curr];
                    }
                    return acc;
                  },
                  {} as Record<string, Event[]>,
                ) || {},
              ),
            }
          : { type: 'single', data: result?.data?.results ?? [] }) satisfies
          | { type: 'single'; data: Event[] }
          | { type: 'grouped'; data: Event[][] },
      }),
    },
  );
  const pageCount = Math.ceil(totalCount / pagination.pageSize);

  return (
    <DefaultPage
      title="Network Events"
      description="Explore detailed network activity with transaction cards that help you investigate and correlate related NSM events, making it easier to follow key flows and gain meaningful context for effective incident analysis."
    >
      <EventsCountTimeline qfilter={qfString} />
      <Row className="mb-2 h-8 justify-between gap-4">
        <Row className="items-center gap-2">
          <UILabel>Group by Flow</UILabel>
          <Switch
            checked={groupByFlow}
            onCheckedChange={setGroupByFlow}
          />
        </Row>
      </Row>
      {isFetching ? (
        <Spin />
      ) : data.data.length === 0 ? (
        <DataTableEmpty
          Icon={ArrowUpDown}
          entity="network events"
          className="border"
        />
      ) : data.type === 'grouped' ? (
        <GroupedList data={data.data} />
      ) : data.type === 'single' ? (
        <List data={data.data} />
      ) : null}
      <div className="mt-4">
        <Pagination
          areSomeRowsSelected={false}
          selectedRowsCount={0}
          rowsCount={totalCount}
          totalCount={totalCount}
          pageSize={pagination.pageSize}
          pageIndex={pagination.pageIndex}
          onPageSizeChange={(newPageSize) =>
            setPagination({ ...pagination, pageSize: newPageSize })
          }
          onPageIndexChange={(newIndex) =>
            setPagination({ ...pagination, pageIndex: newIndex })
          }
          isPreviousPage={pagination.pageIndex > 0}
          isNextPage={pagination.pageIndex < pageCount - 1}
          pageCount={pageCount}
        />
      </div>
    </DefaultPage>
  );
};

const List = ({ data }: { data: Event[] }) => (
  <Column className="gap-2">
    {data?.map((row, i) => (
      <Card
        key={i}
        className="flex flex-col gap-4 p-3"
      >
        <TransactionCard
          key={i}
          row={row}
        />
      </Card>
    ))}
  </Column>
);

const GroupedList = ({ data }: { data: Event[][] }) => (
  <Column className="gap-2">
    {data?.map((flowIdEvents, i) => (
      <Card
        key={i}
        className="flex flex-col gap-4 p-3"
      >
        {flowIdEvents.map((row, j) => (
          <TransactionCard
            key={j}
            row={row}
          />
        ))}
      </Card>
    ))}
  </Column>
);

export const TransactionCard = ({ row }: { row: Event }) => {
  const [open, setOpen] = useState(false);
  return (
    <CardContent className="p-0">
      <Grid className="grid-cols-[1.25rem_2fr_3rem_3fr] items-center justify-between gap-4 text-sm">
        <Button
          variant="outline"
          onClick={() => setOpen(!open)}
          className="size-5 p-0"
        >
          {open ? '-' : '+'}
        </Button>
        <Column className="max-w-full truncate">
          <Row className="items-center gap-2">
            <p className="whitespace-nowrap">
              {row.event_type === 'flow' ? (
                <Row className="flex-wrap gap-1">
                  {row.flow?.start && <DateTime date={row.flow.start} />}
                  {'-'}
                  {row.flow?.end && <DateTime date={row.flow.end} />} {'('}
                  {row.flow?.start && row.flow?.end
                    ? getDuration(
                        new Date(row.flow.start),
                        new Date(row.flow.end),
                      ) || 'less than a second'
                    : 'less than a second'}
                  )
                </Row>
              ) : (
                <DateTime date={row.timestamp} />
              )}
            </p>
          </Row>
          <Grid className="grid-cols-[1fr_2rem_1fr] items-center gap-2">
            <Column className="gap-1 truncate">
              <EventValue
                query_key="src_ip"
                value={row.src_ip!}
              />
              <Hostname
                host={row.src_ip!}
                size="small"
              />
              <Network
                host={row.src_ip!}
                size="small"
              />
            </Column>
            <span>{'->'}</span>
            <Column className="gap-1 truncate">
              <EventValue
                query_key="dest_ip"
                value={row.dest_ip!}
              />
              <Hostname
                host={row.dest_ip!}
                size="small"
              />
              <Network
                host={row.dest_ip!}
                size="small"
              />
            </Column>
          </Grid>
        </Column>
        <EventValue
          query_key="event_type"
          value={row.event_type}
        />
        {row.event_type === 'flow' ? (
          <Row className="items-center gap-4">
            <Column className="gap-2 truncate">
              <Grid className="grid grid-cols-[4rem_5rem_5rem] items-center gap-2">
                <UILabel className="w-16">Packets</UILabel>
                <Row className="gap-1">
                  <HardDriveUpload />
                  {formatNumber(row.flow?.pkts_toserver ?? 0)}
                </Row>
                <Row className="gap-1">
                  <HardDriveDownload />
                  {formatNumber(row.flow?.pkts_toclient ?? 0)}
                </Row>
              </Grid>
              <Grid className="grid grid-cols-[4rem_5rem_5rem] items-center gap-2">
                <UILabel>Bytes</UILabel>
                <Row className="gap-1">
                  <HardDriveUpload />
                  {formatBytes(row.flow?.bytes_toserver ?? 0)}
                </Row>
                <Row className="gap-1">
                  <HardDriveDownload />
                  {formatBytes(row.flow?.bytes_toclient ?? 0)}
                </Row>
              </Grid>
            </Column>
            <Column>
              <Label query_key="app_proto" />
              <EventValue
                query_key="app_proto"
                value={row.app_proto}
              />
            </Column>
            <Column>
              <Label query_key="proto" />
              <EventValue
                query_key="proto"
                value={row.proto}
              />
            </Column>
          </Row>
        ) : row.event_type === 'alert' ? (
          <Column>
            <EventValue
              query_key="alert.signature"
              value={row.alert?.signature}
            />
            <EventValue
              query_key="alert.category"
              value={row.alert?.category}
            />
          </Column>
        ) : row.event_type === 'http' ? (
          <Row className="flex-wrap gap-4">
            {row.http?.url && (
              <Column className="max-w-80">
                <Label query_key="http.url" />
                <EventValue
                  query_key="http.url"
                  className="line-clamp-3 text-wrap break-all"
                  value={row.http?.url}
                />
              </Column>
            )}
            {row.http?.http_method && (
              <Column>
                <Label query_key="http.http_method" />
                <EventValue
                  query_key="http.http_method"
                  value={row.http?.http_method}
                />
              </Column>
            )}
            {row.http?.http_content_type && (
              <Column>
                <Label query_key="http.http_content_type" />
                <EventValue
                  query_key="http.http_content_type"
                  value={row.http?.http_content_type}
                />
              </Column>
            )}
            {row.http?.status && (
              <Column className="max-w-24 truncate">
                <Label query_key="http.status" />
                <EventValue
                  query_key="http.status"
                  value={row.http?.status}
                />
              </Column>
            )}
            {row.http?.protocol && (
              <Column className="truncate">
                <Label query_key="http.protocol" />
                <EventValue
                  query_key="http.protocol"
                  value={row.http?.protocol}
                />
              </Column>
            )}
            {row.http?.server && (
              <Column className="truncate">
                <Label query_key="http.server" />
                <EventValue
                  query_key="http.server"
                  value={row.http?.server}
                />
              </Column>
            )}
            {row.http?.http_user_agent && (
              <Column className="max-w-80 truncate">
                <Label query_key="http.http_user_agent" />
                <EventValue
                  query_key="http.http_user_agent"
                  className="line-clamp-3 text-wrap"
                  value={row.http?.http_user_agent}
                />
              </Column>
            )}
          </Row>
        ) : row.event_type === 'stamus' ? (
          <Row className="gap-4">
            {row.stamus?.threat_id !== undefined && (
              <ThreatTag threat_id={row.stamus.threat_id} />
            )}
            {row.stamus?.kill_chain && (
              <KillchainTag
                kc={row.stamus.kill_chain as keyof typeof killChainsConfig}
              />
            )}
          </Row>
        ) : row.event_type === 'tls' ? (
          <Row className="gap-4">
            {row.tls?.sni && (
              <Column>
                <Label query_key="tls.sni" />
                <EventValue
                  query_key="tls.sni"
                  value={row.tls?.sni}
                />
              </Column>
            )}
            {row.tls?.ja3?.hash && (
              <Column className="max-w-80">
                <Label query_key="tls.ja3.hash" />
                <EventValue
                  query_key="tls.ja3.hash"
                  className="line-clamp-3 text-wrap break-all"
                  value={
                    Array.isArray(row.tls.ja3.hash)
                      ? row.tls.ja3.hash[0]
                      : row.tls.ja3.hash
                  }
                />
              </Column>
            )}
            {row.tls?.ja3s && (
              <Column>
                <Label query_key="tls.ja3s" />
                <EventValue
                  query_key="tls.ja3s"
                  value={row.tls?.ja3s.hash}
                />
              </Column>
            )}
            {row.tls?.ja4 && (
              <Column>
                <Label query_key="tls.ja4" />
                <EventValue
                  query_key="tls.ja4"
                  value={row.tls?.ja4}
                />
              </Column>
            )}
          </Row>
        ) : row.event_type === 'fileinfo' ? (
          <Row className="gap-4">
            <Column className="max-w-80 wrap-break-word">
              <Label query_key="fileinfo.filename" />
              <EventValue
                query_key="fileinfo.filename"
                value={row.fileinfo?.filename}
              />
            </Column>
            <Column className="max-w-24 truncate">
              <Label query_key="fileinfo.size" />
              <EventValue
                query_key="fileinfo.size"
                value={row.fileinfo?.size}
              >
                {formatBytes(row.fileinfo?.size ?? 0)}
              </EventValue>
            </Column>
            <Column className="max-w-48 truncate">
              <Label query_key="fileinfo.sha256" />
              <EventValue
                query_key="fileinfo.sha256"
                value={row.fileinfo?.sha256}
              />
            </Column>
            <Column className="max-w-48 truncate">
              <Label query_key="fileinfo.mimetype" />
              <EventValue
                query_key="fileinfo.mimetype"
                value={row.fileinfo?.mimetype}
              />
            </Column>
          </Row>
        ) : row.event_type === 'anomaly' ? (
          <Row className="gap-4">
            <Column className="max-w-80 wrap-break-word">
              <Label query_key="anomaly.app_proto" />
              <EventValue
                query_key="anomaly.app_proto"
                value={row.anomaly?.app_proto ?? ''}
              />
            </Column>
            <Column className="max-w-24 truncate">
              <Label query_key="anomaly.layer" />
              <EventValue
                query_key="anomaly.layer"
                value={row.anomaly?.layer}
              />
            </Column>
            <Column className="max-w-96 truncate">
              <Label query_key="anomaly.event" />
              <EventValue
                query_key="anomaly.event"
                value={row.anomaly?.event}
              />
            </Column>
          </Row>
        ) : row.event_type === 'smb' ? (
          <Row className="gap-4">
            {row.smb?.command && (
              <Column className="max-w-80 wrap-break-word">
                <Label query_key="smb.command" />
                <EventValue
                  query_key="smb.command"
                  value={row.smb?.command}
                />
              </Column>
            )}
            {row.smb?.dcerpc?.endpoint && (
              <Column className="wrap-break-word">
                <Label query_key="smb.dcerpc.endpoint" />
                <EventValue
                  query_key="smb.dcerpc.endpoint"
                  value={row.smb?.dcerpc?.endpoint}
                />
              </Column>
            )}
            {row.smb?.dcerpc?.interface && (
              <Column className="max-w-80 wrap-break-word">
                <Label query_key="smb.dcerpc.interface.name" />
                <EventValue
                  query_key="smb.dcerpc.interface.name"
                  value={row.smb?.dcerpc?.interface?.name}
                />
              </Column>
            )}
          </Row>
        ) : row.event_type === 'dns' ? (
          <Row className="gap-4">
            {row.dns?.rrname && (
              <Column className="max-w-80 wrap-break-word">
                <Label query_key="dns.rrname" />
                <EventValue
                  query_key="dns.rrname"
                  value={row.dns?.rrname}
                />
              </Column>
            )}
            {row.dns?.rrtype && (
              <Column className="max-w-80 wrap-break-word">
                <Label query_key="dns.rrtype" />
                <EventValue
                  query_key="dns.rrtype"
                  value={row.dns?.rrtype}
                />
              </Column>
            )}
          </Row>
        ) : (
          <div></div>
        )}
      </Grid>

      {open && (
        <div className="mt-4">
          <ExpandedRow row={row} />
        </div>
      )}
    </CardContent>
  );
};

const ExpandedRow = ({ row }: { row: Event }) => {
  const defaultTab = useAppSelector(selectDefaultEventDetailTab);
  return (
    <EventDetailTabs
      event={row}
      variant="pill"
      defaultTab={defaultTab}
    >
      <MetaViewTab event={row} />
      <SyntheticTab event={row} />
      <JsonTab event={row} />
      <RelatedEventsTabs />
      <PcapTab event={row} />
      <FilesTab />
    </EventDetailTabs>
  );
};

const Label = ({ query_key }: { query_key: string }) => (
  <FilterLabel
    query_key={query_key}
    className="text-xs"
  />
);

export const EventsCountTimeline = ({ qfilter }: { qfilter: string }) => {
  const params = useGlobalQueryParams(['dates', 'tenant']);

  const { data } = useGetEventsTimelineQuery(
    { ...params, qfilter },
    {
      selectFromResult: (result) => {
        return {
          data: {
            from_date: params.start_date || 0,
            to_date: params.end_date || new Date().getTime(),
            interval: result.data
              ? result.data[1].time - result.data[0].time
              : 0,
            events: {
              entries: result.data,
            },
          },
        };
      },
    },
  );

  const dispatch = useAppDispatch();
  const handleBarClick = (obj: { time: number }) => {
    dispatch(
      setDates({
        type: 'range',
        start_date: obj.time,
        end_date: obj.time + (data?.interval || 0),
      }),
    );
  };

  return (
    <BarChartTimeline
      data={data as unknown as CountsTimeline}
      className="h-[250px]"
      onBarClick={handleBarClick}
    />
  );
};
