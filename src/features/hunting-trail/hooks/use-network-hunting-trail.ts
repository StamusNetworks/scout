import {
  useGetEventsQuery,
  useGetEventsTailQuery,
} from '@/features/events/common/events.api';
import {
  PURPOSE_SLUG_MAP,
  PURPOSE_SLUGS,
  PurposeSlug,
  TaggedEvent,
  TimelineEventType,
} from '@/features/hunting-trail/hunting-trail.model';

interface UseNetworkHuntingTrailParams {
  startDate: number | undefined;
  endDate: number | undefined;
}

export type PurposeGroupData = {
  events: TaggedEvent[];
  count: number;
  isLoading: boolean;
  isError: boolean;
};

export function useNetworkHuntingTrail({
  startDate,
  endDate,
}: UseNetworkHuntingTrailParams) {
  const common = { start_date: startDate, end_date: endDate, page_size: 100 };
  const alertParams = { ...common, alert: true as const };

  // --- Alert queries (25) ---

  const nrd = useGetEventsQuery({
    ...alertParams,
    qfilter: `metadata.flowbits:stamus.nrd*`,
  });

  const hunting = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.metadata.stamus_type:hunting`,
  });

  const lateral = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.lateral:* AND alert.metadata.source:smb_lateral AND alert.metadata.signature_severity:critical`,
  });

  const remoteAdmin = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.metadata.lateral_function.keyword:OpenLocalMachine`,
  });

  const remoteRegistry = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.metadata.lateral_function.keyword:OpenClassesRoot`,
  });

  const postExploit = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.signature:*attack_response*`,
  });

  const ipDownload = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.signature:*dotted* AND alert.signature:*quad* AND alert.signature:*request* AND alert.signature:*host*`,
  });

  const rawProtocol = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.signature:*raw* AND alert.signature:*Hunt*`,
  });

  const userEnum = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.signature:*EnumerateUsers* AND alert.metadata.provider.keyword:Stamus AND alert.metadata.source.keyword:smb_lateral`,
  });

  const powershell = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.signature:*Powershell* AND alert.signature:*Hunt*`,
  });

  const newServers = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.signature:Server AND metadata.flowbits:stamus.sightings`,
  });

  const smbSightings = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.signature:SMB AND metadata.flowbits:stamus.sightings`,
  });

  const torrent = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.signature:*torrent*`,
  });

  const smtpExe = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.signature:SUSPICIOUS AND alert.signature:SMTP AND alert.signature:EXE`,
  });

  const base64Encoding = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.signature:encoded AND alert.signature:*base64*`,
  });

  const maliciousFilenames = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.signature:Observed AND alert.signature:Filename`,
  });

  const suspiciousFilenames = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.signature:Suspicious AND alert.signature:Filename`,
  });

  const longDomains = useGetEventsQuery({
    ...alertParams,
    qfilter: `(dns.query.rrname.keyword:/.{70}.*/) AND dns.query.rrtype:*`,
  });

  const shortDomains = useGetEventsQuery({
    ...alertParams,
    qfilter: `(-dns.query.rrname.keyword:/.{10}.*/) AND dns.query.rrtype:*`,
  });

  const exeSightings = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.signature:*exe* AND metadata.flowbits:stamus.sightings`,
  });

  const dynamicDns = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.signature:*dns* AND alert.signature:*dynamic*`,
  });

  const tor = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.signature:tor`,
  });

  const publicDns = useGetEventsQuery({
    ...alertParams,
    qfilter: `NOT dest_ip:"10.0.0.0/8" AND NOT dest_ip:"192.168.0.0/16" AND NOT dest_ip:"172.16.0.0/12" AND dns.query.rrname:*`,
  });

  const smtpUnencrypted = useGetEventsQuery({
    ...alertParams,
    qfilter: `app_proto:smtp`,
  });

  const base64Decoding = useGetEventsQuery({
    ...alertParams,
    qfilter: `payload_printable:*base64_decode*`,
  });

  // --- Events tail queries (8) ---

  const file = useGetEventsTailQuery({
    ...common,
    qfilter: `(metadata.flowbits:stamus.file.identification OR metadata.flowbits:stamus.file.store OR metadata.flowbits:stamus.dga.smbfilename) AND event_type:fileinfo`,
  });

  const ssh = useGetEventsTailQuery({
    ...common,
    qfilter: `event_type.raw:"flow" AND app_proto.raw:"ssh"`,
  });

  const longerSsh = useGetEventsTailQuery({
    ...common,
    qfilter: `event_type.raw:"flow" AND app_proto.raw:"ssh" AND (flow.age:>1200)`,
  });

  const rdp = useGetEventsTailQuery({
    ...common,
    qfilter: `event_type.raw:"flow" AND app_proto.raw:"rdp"`,
  });

  const rfbVnc = useGetEventsTailQuery({
    ...common,
    qfilter: `event_type.raw:"flow" AND app_proto.raw:"rfb"`,
  });

  const biggerTcp = useGetEventsTailQuery({
    ...common,
    qfilter: `event_type.raw:"flow" AND proto.raw:"TCP" AND ((flow.bytes_toclient:>1000000 OR flow.bytes_toserver:>1000000) AND flow.bytes_toclient:>0 AND flow.bytes_toserver:>0)`,
  });

  const longerTcp = useGetEventsTailQuery({
    ...common,
    qfilter: `event_type.raw:"flow" AND proto.raw:"TCP" AND (flow.age:>1200)`,
  });

  const biggerUdp = useGetEventsTailQuery({
    ...common,
    qfilter: `event_type.raw:"flow" AND proto.raw:"UDP" AND ((flow.bytes_toclient:>1000000 OR flow.bytes_toserver:>1000000) AND flow.bytes_toclient:>0 AND flow.bytes_toserver:>0)`,
  });

  const longerUdp = useGetEventsTailQuery({
    ...common,
    qfilter: `event_type.raw:"flow" AND proto.raw:"UDP" AND (flow.age:>1200)`,
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

  return { groups };
}
