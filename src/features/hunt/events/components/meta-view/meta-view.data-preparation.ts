import { groupBy, toPairs } from 'ramda';

import { getDuration } from '@/common/lib/duration';
import { formatBytes, formatNumber } from '@/common/lib/numbers';
import { killChainsConfig } from '@/features/hunt/killchain/killchain';

import { DnsEvent } from '../../model/app-proto/dns.schema';
import { HttpEvent } from '../../model/app-proto/http.schema';
import { SmbEvent } from '../../model/app-proto/smb.schema';
import { TlsEvent } from '../../model/app-proto/tls.schema';
import { AlertEvent } from '../../model/event-types/alert.schema';
import { FileinfoEvent } from '../../model/event-types/fileinfo.schema';
import { FlowEvent } from '../../model/event-types/flow.schema';
import { StamusEvent } from '../../model/event-types/stamus.schema';
import { FlowEvents } from '../../model/flowEvent.schema';

type FlowEventArray = NonNullable<FlowEvents[keyof FlowEvents]>;
type AnyFlowEvent = FlowEventArray[number];
type AnyFlowEventWithTxId = AnyFlowEvent & { tx_id?: number };

export type Direction = 'to_server' | 'to_client' | undefined;

export type MetaViewFlow = {
  start: string;
  end: string | undefined;
  duration: string | undefined;
  pkts_toserver: string;
  bytes_toserver: string;
  pkts_toclient: string;
  bytes_toclient: string;
};

export type MetaViewHttp = {
  host: string | undefined;
  method: string | undefined;
  url: string | undefined;
  protocol: string | undefined;
  response_body: string | undefined;
  request_body: string | undefined;
  payload_printable: string | undefined;
};

export type MetaViewSmb = {
  command: string | undefined;
  endpoint: string | undefined;
  interface: string | undefined;
  status: string | undefined;
};

export type MetaViewTls = {
  sni: string | undefined;
  version: string | undefined;
  subject: string | undefined;
};

export type MetaViewStamus = {
  signature: string | undefined;
  threat_id: number;
  kill_chain: keyof typeof killChainsConfig;
  kill_chain_offender: keyof typeof killChainsConfig;
};

export type MetaViewFileinfo = {
  filename: string;
  mimetype: string;
  sha256: string;
  size: number;
};

export type MetaViewAlert = {
  signature: string | undefined;
  uuid: string | undefined;
};

export type MetaViewDns = {
  id: number;
  type: 'query' | 'answer';
  rrtype?: string;
  queries?: {
    rrname: string;
    rrtype: string;
    opcode: number;
    version?: number;
    tx_id: number;
    type: string;
  }[];
  answers?: {
    rrname: string;
    rrtype: string;
    ttl: number;
    rdata: string;
  }[];
};

export type MetaViewTransactionItem = {
  type: 'transaction';
  txId: string;
  direction: Direction;
  start: string | undefined;
  fileinfo: MetaViewFileinfo[];
  stamus: MetaViewStamus[];
  alerts: MetaViewAlert[];
  http?: MetaViewHttp;
  tls?: MetaViewTls;
  smb?: MetaViewSmb;
  dns?: MetaViewDns;
};

export type MetaViewAlertItem = {
  type: 'alert';
  signature: string | undefined;
  uuid: string | undefined;
  start: string;
  direction: Direction;
  alert: AlertEvent;
};

export type MetaViewStamusItem = {
  type: 'stamus';
  signature: string | undefined;
  uuid: string | undefined;
  start: string;
  direction: Direction;
  stamus: MetaViewStamus[];
};

export type MetaViewDnsAnswerItem = {
  type: 'dns-answer';
  index: number;
  id: number;
  start: string;
  direction: Direction;
  dns: MetaViewDns;
};

export type MetaViewItem =
  | MetaViewTransactionItem
  | MetaViewAlertItem
  | MetaViewStamusItem
  | MetaViewDnsAnswerItem;

export type MetaViewModel = {
  flow: MetaViewFlow | undefined;
  items: MetaViewItem[];
  noTxId: AnyFlowEventWithTxId[] | undefined;
};

const isDefined = <T>(value: T | null | undefined): value is T =>
  value !== null && value !== undefined;

const isFlowAlert = (event: AnyFlowEvent): event is AlertEvent =>
  event.event_type === 'alert';

const isStamusEvent = (event: AnyFlowEvent): event is StamusEvent =>
  event.event_type === 'stamus';

const isFileinfoEvent = (event: AnyFlowEvent): event is FileinfoEvent =>
  event.event_type === 'fileinfo' && 'fileinfo' in event;

const isDnsEvent = (event: AnyFlowEvent): event is DnsEvent =>
  event.event_type === 'dns' && 'dns' in event;

const isHttpEvent = (event: AnyFlowEvent): event is HttpEvent =>
  'http' in event;
const isSmbEvent = (event: AnyFlowEvent): event is SmbEvent =>
  event.event_type === 'smb' && 'smb' in event;
const isTlsEvent = (event: AnyFlowEvent): event is TlsEvent =>
  event.event_type === 'tls' && 'tls' in event;

export function getViewModel(events: FlowEvents): MetaViewModel {
  const allEvents: AnyFlowEventWithTxId[] = Object.values(events)
    .flat()
    .filter(isDefined)
    .map((ev) => {
      // fileinfo and dns events have the tx_id in the fileinfo / dns object, we lift it up for the aggregation by tx_id
      if (isFileinfoEvent(ev)) {
        return { ...ev, tx_id: ev.fileinfo.tx_id };
      }
      if (isDnsEvent(ev) && ev.dns.type === 'query') {
        return { ...ev, tx_id: ev.dns.tx_id };
      }
      return ev;
    });

  const byTxId = groupBy(
    (event) => event?.tx_id?.toString() || 'no_tx_id',
    allEvents,
  );

  // TLS Protocol events have no tx_id and all their alerts have tx_id 0
  if (allEvents[0]?.app_proto === 'tls' && events.Tls?.[0]) {
    if (!byTxId[0]) {
      byTxId[0] = [];
    }
    byTxId[0]?.push(events.Tls[0]);
  }

  const transactions =
    toPairs(byTxId)
      .filter(
        ([txId, events]) => txId !== 'no_tx_id' && events && events?.length > 0,
      )
      ?.map(([txId, events]) => {
        if (!events || events.length === 0) return undefined;

        return {
          type: 'transaction',
          txId,
          direction: getDirection(events),
          start: events?.[0]?.timestamp,
          ...extractEventsData(events),
        } satisfies MetaViewTransactionItem;
      })
      .filter(isDefined) || [];

  const alerts = (byTxId['no_tx_id']?.filter(isFlowAlert) || [])?.map(
    (alert) =>
      ({
        type: 'alert',
        signature: alert.alert?.signature,
        uuid: alert.uuid,
        start: alert.timestamp,
        direction: alert.direction,
        alert,
      }) satisfies MetaViewAlertItem,
  );

  const stamus = (byTxId['no_tx_id']?.filter(isStamusEvent) || [])?.map(
    (stamus) =>
      ({
        type: 'stamus',
        signature: stamus.alert?.signature,
        uuid: stamus.uuid,
        start: stamus.timestamp,
        direction: getDirection([stamus]),
        stamus: [extractStamusData(stamus)],
      }) satisfies MetaViewStamusItem,
  );

  // DNS Protocol answers have no tx_id. We will display the ID and set them as to_client events.
  const dnsAnswers = (byTxId['no_tx_id']?.filter(isDnsEvent) || [])?.map(
    (ev, i) =>
      ({
        type: 'dns-answer',
        index: i,
        id: ev.dns.id,
        start: ev.timestamp,
        direction: 'to_client',
        dns: extractDnsData(ev),
      }) satisfies MetaViewDnsAnswerItem,
  );

  return {
    flow: events.Flow?.[0]?.flow
      ? extractFlowData(events.Flow?.[0]?.flow)
      : undefined,
    items: [...transactions, ...alerts, ...dnsAnswers, ...stamus].sort(
      (a, b) =>
        a.start && b.start
          ? new Date(a.start).getTime() - new Date(b.start).getTime()
          : 0,
    ),
    noTxId: byTxId['no_tx_id'],
  };
}

const extractFlowData = (flow: FlowEvent['flow']): MetaViewFlow => ({
  start: flow.start,
  end: flow.end,
  duration: flow.end
    ? getDuration(new Date(flow.start), new Date(flow.end)) ||
      flow.age + ' second'
    : undefined,
  pkts_toserver: flow.pkts_toserver ? formatNumber(flow.pkts_toserver) : 'n/a',
  bytes_toserver: flow.bytes_toserver
    ? formatBytes(flow.bytes_toserver)
    : 'n/a',
  pkts_toclient: flow.pkts_toclient ? formatNumber(flow.pkts_toclient) : 'n/a',
  bytes_toclient: flow.bytes_toclient
    ? formatBytes(flow.bytes_toclient)
    : 'n/a',
});
const extractHttpData = (event: HttpEvent): MetaViewHttp => ({
  host: event.http?.hostname,
  method: event.http?.http_method,
  url: event.http?.url,
  protocol: event.http?.protocol,
  response_body: event.http?.http_response_body_printable,
  request_body: event.http?.http_request_body_printable,
  payload_printable: undefined,
});
const extractSmbData = (event: SmbEvent): MetaViewSmb => ({
  command: event.smb?.command,
  endpoint: event.smb?.dcerpc?.endpoint,
  interface:
    event.smb?.dcerpc?.interface?.name ?? event.smb?.dcerpc?.interface?.uuid,
  status: event.smb?.status,
});
const extractStamusData = (event: StamusEvent): MetaViewStamus => ({
  signature: event.alert?.signature,
  threat_id: event.stamus.threat_id,
  kill_chain: event.stamus.kill_chain,
  kill_chain_offender: event.stamus.kill_chain_offender,
});
const extractFileinfoData = (event: FileinfoEvent): MetaViewFileinfo => ({
  filename: event.fileinfo.filename,
  mimetype: event.fileinfo.mimetype,
  sha256: event.fileinfo.sha256,
  size: event.fileinfo.size,
});
const extractTlsData = (event: TlsEvent): MetaViewTls => ({
  sni: event.tls?.sni,
  version: event.tls?.version,
  subject: event.tls?.subject,
});
const extractAlertData = (event: AlertEvent): MetaViewAlert => ({
  signature: event.alert?.signature,
  uuid: event.uuid,
});
const extractDnsData = (event: DnsEvent): MetaViewDns => {
  if (event.dns.type === 'query') {
    return {
      id: event.dns.id,
      type: 'query',
      queries: [
        {
          rrname: event.dns.rrname,
          rrtype: event.dns.rrtype,
          opcode: event.dns.opcode,
          version: event.dns.version,
          tx_id: event.dns.tx_id,
          type: event.dns.type,
        },
      ],
    };
  }

  return {
    id: event.dns.id,
    type: 'answer',
    rrtype: event.dns.rrtype,
    answers: event.dns.answers.map((answer) => ({
      rrname: answer.rrname,
      rrtype: answer.rrtype,
      ttl: answer.ttl,
      rdata: answer.rdata,
    })),
  };
};
const extractEventData = (event: AnyFlowEvent | undefined) => {
  if (!event) return {};

  if (isHttpEvent(event)) return { http: extractHttpData(event) };
  if (isSmbEvent(event)) return { smb: extractSmbData(event) };
  if (isTlsEvent(event)) return { tls: extractTlsData(event) };
  if (isDnsEvent(event)) return { dns: extractDnsData(event) };

  return {};
};

const extractEventsData = (
  events: AnyFlowEventWithTxId[],
): Omit<MetaViewTransactionItem, 'type' | 'txId' | 'direction' | 'start'> => {
  const alerts = events.filter(isFlowAlert);
  const stamus = events.filter(isStamusEvent);
  const fileinfo = events.filter(isFileinfoEvent);
  const protoEvent = events.find(
    (event) =>
      isHttpEvent(event) ||
      isSmbEvent(event) ||
      isTlsEvent(event) ||
      isDnsEvent(event),
  );

  return {
    fileinfo: fileinfo.map((fileinfo) => extractFileinfoData(fileinfo)),
    stamus: stamus.map((stamus) => extractStamusData(stamus)),
    alerts: alerts.map((alert) => extractAlertData(alert)),
    ...extractEventData(protoEvent || alerts[0] || stamus[0]),
  };
};
const getDirection = (events: AnyFlowEventWithTxId[]): Direction => {
  if (!events || events.length === 0) {
    return 'to_server';
  }
  const alert = events.find(isFlowAlert);
  if (alert) {
    return alert.direction;
  }
  const protoEvent = events.find(
    (event) => isHttpEvent(event) || isSmbEvent(event),
  );

  if (protoEvent && isHttpEvent(protoEvent)) {
    if (
      ['POST', 'PUT', 'PATCH', 'DELETE'].includes(
        protoEvent.http.http_method || '',
      )
    ) {
      return 'to_server';
    }
    return 'to_client';
  }

  if (protoEvent && isSmbEvent(protoEvent)) {
    if (protoEvent.dest_port === 445) {
      return 'to_server';
    }
    return 'to_client';
  }
  return 'to_server';
};
