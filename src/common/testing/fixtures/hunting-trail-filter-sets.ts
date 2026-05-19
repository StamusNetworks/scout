// Wire-shape FilterSetDto fixtures matching the IDs referenced by
// HUNTING_TRAIL_CONFIG. Names match the production filter-set catalog so
// integration tests can assert on real card titles. Content values use the
// existing markers from the Slice A qfilter catalog where present so tests
// that match on qfilter substrings continue to work.

type FilterSetFixture = {
  id: number;
  name: string;
  page: string;
  description: string;
  imported: boolean;
  share: 'static';
  content: Array<{
    id: string;
    label: string;
    value: string;
    negated: boolean;
    fullString: boolean;
  }>;
};

const SESSION_EVENTS_IDS = new Set([
  -107, -105, -108, -106, -103, -104, -102, -101, -99, -100,
]);

type Spec = {
  name: string;
  contentKey: string;
  contentValue: string;
};

const SPECS: Record<number, Spec> = {
  [-149]: {
    name: 'Hunt: Stamus critical lateral SMB, DCERPC',
    contentKey: 'alert.metadata.source',
    contentValue: 'smb_lateral',
  },
  [-151]: {
    name: 'Hunt: Remote Administration Console OpenLocalMachine',
    contentKey: 'alert.metadata.lateral_function',
    contentValue: 'OpenLocalMachine',
  },
  [-152]: {
    name: 'Hunt: Remote Administration Registry HKEY_CLASSES_ROOT',
    contentKey: 'alert.metadata.lateral_function',
    contentValue: 'OpenClassesRoot',
  },
  [-81]: {
    name: 'Hunt: Lateral SMB user enumeration activities',
    contentKey: 'alert.signature',
    contentValue: 'EnumerateUsers',
  },
  [-85]: {
    name: 'Hunt: Attack Response',
    contentKey: 'alert.signature',
    contentValue: 'attack_response',
  },
  [-82]: {
    name: 'Hunt: Powershell specific',
    contentKey: 'alert.signature',
    contentValue: 'Powershell',
  },
  [-47]: {
    name: 'Hunt: base64 encoding functions',
    contentKey: 'alert.signature',
    contentValue: 'base64',
  },
  [-39]: {
    name: 'Hunt: base64 decoding functions in payloads',
    contentKey: 'es_filter',
    contentValue: 'payload_printable:*base64_decode*',
  },
  [-34]: {
    name: 'Hunt: Malicious filenames in  payloads',
    contentKey: 'alert.signature',
    contentValue: 'Observed',
  },
  [-37]: {
    name: 'Hunt: Suspicious filenames in payloads',
    contentKey: 'alert.signature',
    contentValue: 'Suspicious',
  },
  [-78]: {
    name: 'Hunt: Suspicious SMTP EXE attachments',
    contentKey: 'alert.signature',
    contentValue: 'SMTP',
  },
  [-73]: {
    name: 'Hunt: New executables seen',
    contentKey: 'alert.signature',
    contentValue: 'exe',
  },
  [-84]: {
    name: 'Hunt: Dotted Quad Host Request',
    contentKey: 'alert.signature',
    contentValue: 'dotted',
  },
  [-83]: {
    name: 'Hunt: Raw TCP files transfers',
    contentKey: 'alert.signature',
    contentValue: 'raw',
  },
  [-79]: {
    name: 'Policy: Torrent present in the traffic',
    contentKey: 'alert.signature',
    contentValue: 'torrent',
  },
  [-70]: {
    name: 'Policy: Possible TOR traffic',
    contentKey: 'alert.signature',
    contentValue: 'tor',
  },
  [-127]: {
    name: 'Policy: SMTP clear text events',
    contentKey: 'app_proto',
    contentValue: 'smtp',
  },
  [-88]: {
    name: 'Hunt: Newly Registered Domains (NRD)',
    contentKey: 'alert.signature',
    contentValue: 'stamus.nrd',
  },
  [-67]: {
    name: 'Hunt: Longer domain dns requests',
    contentKey: 'dns.query.rrtype',
    contentValue: '*',
  },
  [-68]: {
    name: 'Hunt: Shorter domain dns requests',
    contentKey: 'dns.query.rrtype',
    contentValue: '*',
  },
  [-76]: {
    name: 'Policy: Public DNS queries',
    contentKey: 'dns.query.rrname',
    contentValue: '*',
  },
  [-90]: {
    name: 'Hunt: Server SIGHTINGS',
    contentKey: 'alert.signature',
    contentValue: 'Server',
  },
  [-89]: {
    name: 'Hunt: SMB SIGHTINGS',
    contentKey: 'alert.signature',
    contentValue: 'SMB',
  },
  [-77]: {
    name: 'Hunt: Stamus Advanced Hunting',
    contentKey: 'alert.metadata.stamus_type',
    contentValue: 'hunting',
  },
  [-107]: {
    name: 'Investigate: SSH flows',
    contentKey: 'app_proto',
    contentValue: 'ssh',
  },
  [-105]: {
    name: 'Investigate: SSH flows longer than 20 min',
    contentKey: 'app_proto',
    contentValue: 'ssh',
  },
  [-108]: {
    name: 'Investigate: RDP flows',
    contentKey: 'app_proto',
    contentValue: 'rdp',
  },
  [-106]: {
    name: 'Investigate: RFB/VNC flows',
    contentKey: 'app_proto',
    contentValue: 'rfb',
  },
  [-103]: {
    name: 'Investigate: TCP flows bigger than 10 MB',
    contentKey: 'proto',
    contentValue: 'TCP',
  },
  [-104]: {
    name: 'Investigate: TCP flows longer than 20 min',
    contentKey: 'proto',
    contentValue: 'TCP',
  },
  [-102]: {
    name: 'Investigate: UDP flows bigger than 10 MB',
    contentKey: 'proto',
    contentValue: 'UDP',
  },
  [-101]: {
    name: 'Investigate: UDP flows longer than 20 min',
    contentKey: 'proto',
    contentValue: 'UDP',
  },
  [-99]: {
    name: 'Investigate: ICMP flows bigger than 1 MB',
    contentKey: 'proto',
    contentValue: 'ICMP',
  },
  [-100]: {
    name: 'Investigate: ICMP flows longer than 20 min',
    contentKey: 'proto',
    contentValue: 'ICMP',
  },
};

export const huntingTrailFilterSetsFixture: FilterSetFixture[] = Object.entries(
  SPECS,
).map(([idStr, spec]) => {
  const id = Number(idStr);
  return {
    id,
    name: spec.name,
    description: `Description for ${spec.name}`,
    imported: false,
    share: 'static',
    page: SESSION_EVENTS_IDS.has(id) ? 'SESSION_EVENTS' : 'DASHBOARDS',
    content: [
      {
        id: spec.contentKey,
        label: '',
        value: spec.contentValue,
        negated: false,
        fullString: false,
      },
    ],
  };
});
