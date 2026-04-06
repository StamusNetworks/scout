import { esEscape } from '@/common/lib/strings';
import {
  useGetEventsQuery,
  useGetEventsTailQuery,
} from '@/features/events/common/events.api';
import { useGetSightingEventsQuery } from '@/features/events/sightings/common/sightings.api';
import {
  PURPOSE_SLUG_MAP,
  PURPOSE_SLUGS,
  PurposeGroupData,
  PurposeSlug,
  TaggedEvent,
  TimelineEventType,
} from '@/features/hunting-trail/hunting-trail.model';
import {
  ALERT_QFILTERS,
  EVENTS_TAIL_QFILTERS,
} from '@/features/hunting-trail/hunting-trail.queries';

interface UseHostHuntingTrailParams {
  asset: string;
  startDate: number | undefined;
  endDate: number | undefined;
}

export function useHostHuntingTrail({
  asset,
  startDate,
  endDate,
}: UseHostHuntingTrailParams) {
  const ipFilter = `src_ip:${esEscape(asset)} OR dest_ip:${esEscape(asset)}`;
  const common = { start_date: startDate, end_date: endDate, page_size: 10000 };
  const alertParams = { ...common, alert: true as const };

  // --- Alert queries (alerts_tail) ---

  const nrd = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND ${ALERT_QFILTERS.nrd}`,
  });

  const hunting = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND ${ALERT_QFILTERS.hunting}`,
  });

  const lateral = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND ${ALERT_QFILTERS.lateral}`,
  });

  const remoteAdmin = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND ${ALERT_QFILTERS.remoteAdmin}`,
  });

  const remoteRegistry = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND ${ALERT_QFILTERS.remoteRegistry}`,
  });

  const postExploit = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND ${ALERT_QFILTERS.postExploit}`,
  });

  const ipDownload = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND ${ALERT_QFILTERS.ipDownload}`,
  });

  const rawProtocol = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND ${ALERT_QFILTERS.rawProtocol}`,
  });

  const userEnum = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND ${ALERT_QFILTERS.userEnum}`,
  });

  const powershell = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND ${ALERT_QFILTERS.powershell}`,
  });

  const newServers = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND ${ALERT_QFILTERS.newServers}`,
  });

  const smbSightings = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND ${ALERT_QFILTERS.smbSightings}`,
  });

  const torrent = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND ${ALERT_QFILTERS.torrent}`,
  });

  const smtpExe = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND ${ALERT_QFILTERS.smtpExe}`,
  });

  const base64Encoding = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND ${ALERT_QFILTERS.base64Encoding}`,
  });

  const maliciousFilenames = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND ${ALERT_QFILTERS.maliciousFilenames}`,
  });

  const suspiciousFilenames = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND ${ALERT_QFILTERS.suspiciousFilenames}`,
  });

  const longDomains = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND ${ALERT_QFILTERS.longDomains}`,
  });

  const shortDomains = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND ${ALERT_QFILTERS.shortDomains}`,
  });

  const exeSightings = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND ${ALERT_QFILTERS.exeSightings}`,
  });

  const dynamicDns = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND ${ALERT_QFILTERS.dynamicDns}`,
  });

  const tor = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND ${ALERT_QFILTERS.tor}`,
  });

  const publicDns = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND ${ALERT_QFILTERS.publicDns}`,
  });

  const smtpUnencrypted = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND ${ALERT_QFILTERS.smtpUnencrypted}`,
  });

  const base64Decoding = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND ${ALERT_QFILTERS.base64Decoding}`,
  });

  // --- Events tail queries ---

  const file = useGetEventsTailQuery({
    ...common,
    qfilter: `(${ipFilter}) AND ${EVENTS_TAIL_QFILTERS.file}`,
  });

  const ssh = useGetEventsTailQuery({
    ...common,
    qfilter: `(${ipFilter}) AND ${EVENTS_TAIL_QFILTERS.ssh}`,
  });

  const longerSsh = useGetEventsTailQuery({
    ...common,
    qfilter: `(${ipFilter}) AND ${EVENTS_TAIL_QFILTERS.longerSsh}`,
  });

  const rdp = useGetEventsTailQuery({
    ...common,
    qfilter: `(${ipFilter}) AND ${EVENTS_TAIL_QFILTERS.rdp}`,
  });

  const rfbVnc = useGetEventsTailQuery({
    ...common,
    qfilter: `(${ipFilter}) AND ${EVENTS_TAIL_QFILTERS.rfbVnc}`,
  });

  const biggerTcp = useGetEventsTailQuery({
    ...common,
    qfilter: `(${ipFilter}) AND ${EVENTS_TAIL_QFILTERS.biggerTcp}`,
  });

  const longerTcp = useGetEventsTailQuery({
    ...common,
    qfilter: `(${ipFilter}) AND ${EVENTS_TAIL_QFILTERS.longerTcp}`,
  });

  const biggerUdp = useGetEventsTailQuery({
    ...common,
    qfilter: `(${ipFilter}) AND ${EVENTS_TAIL_QFILTERS.biggerUdp}`,
  });

  const longerUdp = useGetEventsTailQuery({
    ...common,
    qfilter: `(${ipFilter}) AND ${EVENTS_TAIL_QFILTERS.longerUdp}`,
  });

  const biggerIcmp = useGetEventsTailQuery({
    ...common,
    qfilter: `(${ipFilter}) AND ${EVENTS_TAIL_QFILTERS.biggerIcmp}`,
  });

  const longerIcmp = useGetEventsTailQuery({
    ...common,
    qfilter: `(${ipFilter}) AND ${EVENTS_TAIL_QFILTERS.longerIcmp}`,
  });

  // --- Sighting query ---

  const sightings = useGetSightingEventsQuery({
    ...common,
    qfilter: `discovery.asset:${esEscape(asset)}`,
  });

  // --- Build query results map ---

  // We need a minimal common shape for the query result map
  type QueryResult = {
    data?: { results?: { timestamp: string }[] };
    isLoading: boolean;
    isError: boolean;
  };

  const queryResults: Record<TimelineEventType, QueryResult> = {
    nrd,
    hunting,
    lateral,
    remoteAdmin,
    remoteRegistry,
    postExploit,
    ipDownload,
    rawProtocol,
    userEnum,
    powershell,
    newServers,
    smbSightings,
    torrent,
    smtpExe,
    base64Encoding,
    maliciousFilenames,
    suspiciousFilenames,
    longDomains,
    shortDomains,
    exeSightings,
    dynamicDns,
    tor,
    publicDns,
    smtpUnencrypted,
    base64Decoding,
    file,
    ssh,
    longerSsh,
    rdp,
    rfbVnc,
    biggerTcp,
    longerTcp,
    biggerUdp,
    longerUdp,
    biggerIcmp,
    longerIcmp,
    sightings,
  };

  // --- Group by purpose ---

  const allQueries = Object.values(queryResults);
  const isLoading = allQueries.some((q) => q.isLoading);
  const isError = allQueries.every((q) => q.isError);

  const groups = Object.fromEntries(
    PURPOSE_SLUGS.map(({ slug }) => {
      const purposeGroup = PURPOSE_SLUG_MAP[slug];
      const queries = purposeGroup.types.map((t) => queryResults[t]);
      const groupLoading = queries.some((q) => q.isLoading);
      const groupError = queries.length > 0 && queries.every((q) => q.isError);

      const events: TaggedEvent[] = purposeGroup.types.flatMap((type) => {
        const results = queryResults[type].data?.results ?? [];
        return results.map(
          (e) => ({ ...e, timelineType: type }) as TaggedEvent,
        );
      });

      return [
        slug,
        {
          events,
          count: events.length,
          isLoading: groupLoading,
          isError: groupError,
        },
      ];
    }),
  ) as Record<PurposeSlug, PurposeGroupData>;

  const isEmpty =
    !isLoading && !isError && Object.values(groups).every((g) => g.count === 0);

  return { groups, isLoading, isError, isEmpty };
}
