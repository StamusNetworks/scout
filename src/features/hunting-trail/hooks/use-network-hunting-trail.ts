import { FETCH_ALL } from '@/common/fetching/fetching.types';
import { useGetEventsQuery, useGetEventsTailQuery } from '@/features/events';

import {
  ALERT_QFILTERS,
  EVENTS_TAIL_QFILTERS,
} from '../definitions/hunting-trail.qfilters';
import {
  PURPOSE_SLUG_MAP,
  PURPOSE_SLUGS,
  PurposeGroupData,
  PurposeSlug,
  TaggedEvent,
  TimelineEventType,
} from '../model/hunting-trail';
import { computeRunStats } from '../model/run-stats';

interface UseNetworkHuntingTrailParams {
  from: number | undefined;
  to: number | undefined;
}

export function useNetworkHuntingTrail({
  from,
  to,
}: UseNetworkHuntingTrailParams) {
  const common = { from, to, ...FETCH_ALL };
  const alertParams = { ...common, alert: true as const };

  // --- Alert queries (25) ---

  const nrd = useGetEventsQuery({
    ...alertParams,
    qfilter: ALERT_QFILTERS.nrd,
  });

  const hunting = useGetEventsQuery({
    ...alertParams,
    qfilter: ALERT_QFILTERS.hunting,
  });

  const lateral = useGetEventsQuery({
    ...alertParams,
    qfilter: ALERT_QFILTERS.lateral,
  });

  const remoteAdmin = useGetEventsQuery({
    ...alertParams,
    qfilter: ALERT_QFILTERS.remoteAdmin,
  });

  const remoteRegistry = useGetEventsQuery({
    ...alertParams,
    qfilter: ALERT_QFILTERS.remoteRegistry,
  });

  const postExploit = useGetEventsQuery({
    ...alertParams,
    qfilter: ALERT_QFILTERS.postExploit,
  });

  const ipDownload = useGetEventsQuery({
    ...alertParams,
    qfilter: ALERT_QFILTERS.ipDownload,
  });

  const rawProtocol = useGetEventsQuery({
    ...alertParams,
    qfilter: ALERT_QFILTERS.rawProtocol,
  });

  const userEnum = useGetEventsQuery({
    ...alertParams,
    qfilter: ALERT_QFILTERS.userEnum,
  });

  const powershell = useGetEventsQuery({
    ...alertParams,
    qfilter: ALERT_QFILTERS.powershell,
  });

  const newServers = useGetEventsQuery({
    ...alertParams,
    qfilter: ALERT_QFILTERS.newServers,
  });

  const smbSightings = useGetEventsQuery({
    ...alertParams,
    qfilter: ALERT_QFILTERS.smbSightings,
  });

  const torrent = useGetEventsQuery({
    ...alertParams,
    qfilter: ALERT_QFILTERS.torrent,
  });

  const smtpExe = useGetEventsQuery({
    ...alertParams,
    qfilter: ALERT_QFILTERS.smtpExe,
  });

  const base64Encoding = useGetEventsQuery({
    ...alertParams,
    qfilter: ALERT_QFILTERS.base64Encoding,
  });

  const maliciousFilenames = useGetEventsQuery({
    ...alertParams,
    qfilter: ALERT_QFILTERS.maliciousFilenames,
  });

  const suspiciousFilenames = useGetEventsQuery({
    ...alertParams,
    qfilter: ALERT_QFILTERS.suspiciousFilenames,
  });

  const longDomains = useGetEventsQuery({
    ...alertParams,
    qfilter: ALERT_QFILTERS.longDomains,
  });

  const shortDomains = useGetEventsQuery({
    ...alertParams,
    qfilter: ALERT_QFILTERS.shortDomains,
  });

  const exeSightings = useGetEventsQuery({
    ...alertParams,
    qfilter: ALERT_QFILTERS.exeSightings,
  });

  const dynamicDns = useGetEventsQuery({
    ...alertParams,
    qfilter: ALERT_QFILTERS.dynamicDns,
  });

  const tor = useGetEventsQuery({
    ...alertParams,
    qfilter: ALERT_QFILTERS.tor,
  });

  const publicDns = useGetEventsQuery({
    ...alertParams,
    qfilter: ALERT_QFILTERS.publicDns,
  });

  const smtpUnencrypted = useGetEventsQuery({
    ...alertParams,
    qfilter: ALERT_QFILTERS.smtpUnencrypted,
  });

  const base64Decoding = useGetEventsQuery({
    ...alertParams,
    qfilter: ALERT_QFILTERS.base64Decoding,
  });

  // --- Events tail queries (11) ---

  const file = useGetEventsTailQuery({
    ...common,
    qfilter: EVENTS_TAIL_QFILTERS.file,
  });

  const ssh = useGetEventsTailQuery({
    ...common,
    qfilter: EVENTS_TAIL_QFILTERS.ssh,
  });

  const longerSsh = useGetEventsTailQuery({
    ...common,
    qfilter: EVENTS_TAIL_QFILTERS.longerSsh,
  });

  const rdp = useGetEventsTailQuery({
    ...common,
    qfilter: EVENTS_TAIL_QFILTERS.rdp,
  });

  const rfbVnc = useGetEventsTailQuery({
    ...common,
    qfilter: EVENTS_TAIL_QFILTERS.rfbVnc,
  });

  const biggerTcp = useGetEventsTailQuery({
    ...common,
    qfilter: EVENTS_TAIL_QFILTERS.biggerTcp,
  });

  const longerTcp = useGetEventsTailQuery({
    ...common,
    qfilter: EVENTS_TAIL_QFILTERS.longerTcp,
  });

  const biggerUdp = useGetEventsTailQuery({
    ...common,
    qfilter: EVENTS_TAIL_QFILTERS.biggerUdp,
  });

  const longerUdp = useGetEventsTailQuery({
    ...common,
    qfilter: EVENTS_TAIL_QFILTERS.longerUdp,
  });

  const biggerIcmp = useGetEventsTailQuery({
    ...common,
    qfilter: EVENTS_TAIL_QFILTERS.biggerIcmp,
  });

  const longerIcmp = useGetEventsTailQuery({
    ...common,
    qfilter: EVENTS_TAIL_QFILTERS.longerIcmp,
  });

  // --- Map query results by type ---

  const queryResults: Record<
    Exclude<TimelineEventType, 'sightings'>,
    ReturnType<typeof useGetEventsQuery>
  > = {
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
  };

  // --- Group by purpose ---

  const groups = Object.fromEntries(
    PURPOSE_SLUGS.map(({ slug }) => {
      const purposeGroup = PURPOSE_SLUG_MAP[slug];
      const relevantTypes = purposeGroup.types.filter(
        (t): t is Exclude<TimelineEventType, 'sightings'> => t !== 'sightings',
      );

      const queries = relevantTypes.map((t) => queryResults[t]);
      const isLoading = queries.some((q) => q.isLoading);
      const isError = queries.length > 0 && queries.every((q) => q.isError);

      const events: TaggedEvent[] = relevantTypes.flatMap((type) => {
        const results = queryResults[type].data?.results ?? [];
        return results.map(
          (e: Record<string, unknown>) =>
            ({ ...e, timelineType: type }) as TaggedEvent,
        );
      });

      return [
        slug,
        {
          events,
          count: events.length,
          isLoading,
          isError,
        },
      ];
    }),
  ) as Record<PurposeSlug, PurposeGroupData>;

  const runStats = computeRunStats(
    Object.values(queryResults).map((q) => ({
      data: q.data as { results?: unknown[] } | undefined,
      isLoading: q.isLoading,
      isError: q.isError,
    })),
  );

  return { groups, runStats };
}
