import { esEscape } from '@/common/lib/strings';
import {
  useGetEventsQuery,
  useGetEventsTailQuery,
} from '@/features/events/common/events.api';
import { useGetSightingEventsQuery } from '@/features/events/sightings/common/sightings.api';

import { TaggedEvent, TimelineEventType } from '../hunting-trail.model';

interface UseHuntingTrailParams {
  asset: string;
  startDate: number | undefined;
  endDate: number | undefined;
}

export function useHuntingTrail({
  asset,
  startDate,
  endDate,
}: UseHuntingTrailParams) {
  const ipFilter = `src_ip:${esEscape(asset)} OR dest_ip:${esEscape(asset)}`;
  const common = { start_date: startDate, end_date: endDate, page_size: 100 };
  const alertParams = { ...common, alert: true as const };

  // --- Alert queries (alerts_tail) ---

  const nrd = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND metadata.flowbits:stamus.nrd*`,
  });

  const hunting = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND alert.metadata.stamus_type:hunting`,
  });

  const lateral = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND alert.lateral:* AND alert.metadata.source:smb_lateral AND alert.metadata.signature_severity:critical`,
  });

  const remoteAdmin = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND alert.metadata.lateral_function.keyword:OpenLocalMachine`,
  });

  const remoteRegistry = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND alert.metadata.lateral_function.keyword:OpenClassesRoot`,
  });

  const postExploit = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND alert.signature:*attack_response*`,
  });

  const ipDownload = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND alert.signature:*dotted* AND alert.signature:*quad* AND alert.signature:*request* AND alert.signature:*host*`,
  });

  const rawProtocol = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND alert.signature:*raw* AND alert.signature:*Hunt*`,
  });

  const userEnum = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND alert.signature:*EnumerateUsers* AND alert.metadata.provider.keyword:Stamus AND alert.metadata.source.keyword:smb_lateral`,
  });

  const powershell = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND alert.signature:*Powershell* AND alert.signature:*Hunt*`,
  });

  const newServers = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND alert.signature:Server AND metadata.flowbits:stamus.sightings`,
  });

  const smbSightings = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND alert.signature:SMB AND metadata.flowbits:stamus.sightings`,
  });

  const torrent = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND alert.signature:*torrent*`,
  });

  const smtpExe = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND alert.signature:SUSPICIOUS AND alert.signature:SMTP AND alert.signature:EXE`,
  });

  const base64Encoding = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND alert.signature:encoded AND alert.signature:*base64*`,
  });

  const maliciousFilenames = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND alert.signature:Observed AND alert.signature:Filename`,
  });

  const suspiciousFilenames = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND alert.signature:Suspicious AND alert.signature:Filename`,
  });

  const longDomains = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND (dns.query.rrname.keyword:/.{70}.*/) AND dns.query.rrtype:*`,
  });

  const shortDomains = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND (-dns.query.rrname.keyword:/.{10}.*/) AND dns.query.rrtype:*`,
  });

  const exeSightings = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND alert.signature:*exe* AND metadata.flowbits:stamus.sightings`,
  });

  const dynamicDns = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND alert.signature:*dns* AND alert.signature:*dynamic*`,
  });

  const tor = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND alert.signature:tor`,
  });

  const publicDns = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND NOT dest_ip:"10.0.0.0/8" AND NOT dest_ip:"192.168.0.0/16" AND NOT dest_ip:"172.16.0.0/12" AND dns.query.rrname:*`,
  });

  const smtpUnencrypted = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND app_proto:smtp`,
  });

  const base64Decoding = useGetEventsQuery({
    ...alertParams,
    qfilter: `(${ipFilter}) AND payload_printable:*base64_decode*`,
  });

  // --- Events tail queries ---

  const file = useGetEventsTailQuery({
    ...common,
    qfilter: `(${ipFilter}) AND (metadata.flowbits:stamus.file.identification OR metadata.flowbits:stamus.file.store OR metadata.flowbits:stamus.dga.smbfilename) AND event_type:fileinfo`,
  });

  const ssh = useGetEventsTailQuery({
    ...common,
    qfilter: `(${ipFilter}) AND event_type.raw:"flow" AND app_proto.raw:"ssh"`,
  });

  const longerSsh = useGetEventsTailQuery({
    ...common,
    qfilter: `(${ipFilter}) AND event_type.raw:"flow" AND app_proto.raw:"ssh" AND (flow.age:>1200)`,
  });

  const rdp = useGetEventsTailQuery({
    ...common,
    qfilter: `(${ipFilter}) AND event_type.raw:"flow" AND app_proto.raw:"rdp"`,
  });

  const rfbVnc = useGetEventsTailQuery({
    ...common,
    qfilter: `(${ipFilter}) AND event_type.raw:"flow" AND app_proto.raw:"rfb"`,
  });

  const biggerTcp = useGetEventsTailQuery({
    ...common,
    qfilter: `(${ipFilter}) AND event_type.raw:"flow" AND proto.raw:"TCP" AND ((flow.bytes_toclient:>1000000 OR flow.bytes_toserver:>1000000) AND flow.bytes_toclient:>0 AND flow.bytes_toserver:>0)`,
  });

  const longerTcp = useGetEventsTailQuery({
    ...common,
    qfilter: `(${ipFilter}) AND event_type.raw:"flow" AND proto.raw:"TCP" AND (flow.age:>1200)`,
  });

  const biggerUdp = useGetEventsTailQuery({
    ...common,
    qfilter: `(${ipFilter}) AND event_type.raw:"flow" AND proto.raw:"UDP" AND ((flow.bytes_toclient:>1000000 OR flow.bytes_toserver:>1000000) AND flow.bytes_toclient:>0 AND flow.bytes_toserver:>0)`,
  });

  const longerUdp = useGetEventsTailQuery({
    ...common,
    qfilter: `(${ipFilter}) AND event_type.raw:"flow" AND proto.raw:"UDP" AND (flow.age:>1200)`,
  });

  // --- Sighting query ---

  const sightings = useGetSightingEventsQuery({
    ...common,
    qfilter: `discovery.asset:${esEscape(asset)}`,
  });

  // --- Combine results ---

  const allQueries = [
    nrd,
    sightings,
    file,
    lateral,
    hunting,
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
    ssh,
    longerSsh,
    rdp,
    rfbVnc,
    biggerTcp,
    longerTcp,
    biggerUdp,
    longerUdp,
  ];
  const isLoading = allQueries.some((q) => q.isLoading);
  const isError = allQueries.every((q) => q.isError);

  const tag = (
    type: TimelineEventType,
    results: { timestamp: string }[] | undefined,
  ): TaggedEvent[] =>
    (results ?? []).map((e) => ({ ...e, timelineType: type }) as TaggedEvent);

  const taggedEvents: TaggedEvent[] = [
    ...tag('nrd', nrd.data?.results),
    ...tag('sightings', sightings.data?.results),
    ...tag('file', file.data?.results),
    ...tag('lateral', lateral.data?.results),
    ...tag('hunting', hunting.data?.results),
    ...tag('remoteAdmin', remoteAdmin.data?.results),
    ...tag('remoteRegistry', remoteRegistry.data?.results),
    ...tag('postExploit', postExploit.data?.results),
    ...tag('ipDownload', ipDownload.data?.results),
    ...tag('rawProtocol', rawProtocol.data?.results),
    ...tag('userEnum', userEnum.data?.results),
    ...tag('powershell', powershell.data?.results),
    ...tag('newServers', newServers.data?.results),
    ...tag('smbSightings', smbSightings.data?.results),
    ...tag('torrent', torrent.data?.results),
    ...tag('smtpExe', smtpExe.data?.results),
    ...tag('base64Encoding', base64Encoding.data?.results),
    ...tag('maliciousFilenames', maliciousFilenames.data?.results),
    ...tag('suspiciousFilenames', suspiciousFilenames.data?.results),
    ...tag('longDomains', longDomains.data?.results),
    ...tag('shortDomains', shortDomains.data?.results),
    ...tag('exeSightings', exeSightings.data?.results),
    ...tag('dynamicDns', dynamicDns.data?.results),
    ...tag('tor', tor.data?.results),
    ...tag('publicDns', publicDns.data?.results),
    ...tag('smtpUnencrypted', smtpUnencrypted.data?.results),
    ...tag('base64Decoding', base64Decoding.data?.results),
    ...tag('ssh', ssh.data?.results),
    ...tag('longerSsh', longerSsh.data?.results),
    ...tag('rdp', rdp.data?.results),
    ...tag('rfbVnc', rfbVnc.data?.results),
    ...tag('biggerTcp', biggerTcp.data?.results),
    ...tag('longerTcp', longerTcp.data?.results),
    ...tag('biggerUdp', biggerUdp.data?.results),
    ...tag('longerUdp', longerUdp.data?.results),
  ];

  return {
    taggedEvents,
    isLoading,
    isError,
    isEmpty: !isLoading && taggedEvents.length === 0 && !isError,
  };
}
