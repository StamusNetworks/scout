// Alert qfilters — used with useGetEventsQuery({ alert: true, qfilter })
export const ALERT_QFILTERS = {
  nrd: 'metadata.flowbits:stamus.nrd*',
  hunting: 'alert.metadata.stamus_type:hunting',
  lateral:
    'alert.lateral:* AND alert.metadata.source:smb_lateral AND alert.metadata.signature_severity:critical',
  remoteAdmin: 'alert.metadata.lateral_function.keyword:OpenLocalMachine',
  remoteRegistry: 'alert.metadata.lateral_function.keyword:OpenClassesRoot',
  postExploit: 'alert.signature:*attack_response*',
  ipDownload:
    'alert.signature:*dotted* AND alert.signature:*quad* AND alert.signature:*request* AND alert.signature:*host*',
  rawProtocol: 'alert.signature:*raw* AND alert.signature:*Hunt*',
  userEnum:
    'alert.signature:*EnumerateUsers* AND alert.metadata.provider.keyword:Stamus AND alert.metadata.source.keyword:smb_lateral',
  powershell: 'alert.signature:*Powershell* AND alert.signature:*Hunt*',
  newServers: 'alert.signature:Server AND metadata.flowbits:stamus.sightings',
  smbSightings: 'alert.signature:SMB AND metadata.flowbits:stamus.sightings',
  torrent: 'alert.signature:*torrent*',
  smtpExe:
    'alert.signature:SUSPICIOUS AND alert.signature:SMTP AND alert.signature:EXE',
  base64Encoding: 'alert.signature:encoded AND alert.signature:*base64*',
  maliciousFilenames: 'alert.signature:Observed AND alert.signature:Filename',
  suspiciousFilenames:
    'alert.signature:Suspicious AND alert.signature:Filename',
  longDomains: '(dns.query.rrname.keyword:/.{70}.*/) AND dns.query.rrtype:*',
  shortDomains: '(-dns.query.rrname.keyword:/.{10}.*/) AND dns.query.rrtype:*',
  exeSightings: 'alert.signature:*exe* AND metadata.flowbits:stamus.sightings',
  dynamicDns: 'alert.signature:*dns* AND alert.signature:*dynamic*',
  tor: 'alert.signature:tor',
  publicDns:
    'NOT dest_ip:"10.0.0.0/8" AND NOT dest_ip:"192.168.0.0/16" AND NOT dest_ip:"172.16.0.0/12" AND dns.query.rrname:*',
  smtpUnencrypted: 'app_proto:smtp',
  base64Decoding: 'payload_printable:*base64_decode*',
} as const;

// Events tail qfilters — used with useGetEventsTailQuery({ qfilter })
export const EVENTS_TAIL_QFILTERS = {
  file: '(metadata.flowbits:stamus.file.identification OR metadata.flowbits:stamus.file.store OR metadata.flowbits:stamus.dga.smbfilename) AND event_type:fileinfo',
  ssh: 'event_type.raw:"flow" AND app_proto.raw:"ssh"',
  longerSsh:
    'event_type.raw:"flow" AND app_proto.raw:"ssh" AND (flow.age:>1200)',
  rdp: 'event_type.raw:"flow" AND app_proto.raw:"rdp"',
  rfbVnc: 'event_type.raw:"flow" AND app_proto.raw:"rfb"',
  biggerTcp:
    'event_type.raw:"flow" AND proto.raw:"TCP" AND ((flow.bytes_toclient:>10000000 OR flow.bytes_toserver:>10000000) AND flow.bytes_toclient:>0 AND flow.bytes_toserver:>0)',
  longerTcp: 'event_type.raw:"flow" AND proto.raw:"TCP" AND (flow.age:>1200)',
  biggerUdp:
    'event_type.raw:"flow" AND proto.raw:"UDP" AND ((flow.bytes_toclient:>10000000 OR flow.bytes_toserver:>10000000) AND flow.bytes_toclient:>0 AND flow.bytes_toserver:>0)',
  longerUdp: 'event_type.raw:"flow" AND proto.raw:"UDP" AND (flow.age:>1200)',
  biggerIcmp:
    'proto:*ICMP* AND event_type:"flow" AND ((flow.bytes_toclient:>1000000 OR flow.bytes_toserver:>1000000) AND flow.bytes_toclient:>0 AND flow.bytes_toserver:>0)',
  longerIcmp:
    'proto:*ICMP* AND event_type:"flow" AND ((flow.age:>1200) AND flow.bytes_toclient:>0 AND flow.bytes_toserver:>0)',
} as const;
