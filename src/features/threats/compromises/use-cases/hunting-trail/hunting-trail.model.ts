import { Event } from '@/features/events/common/events.model';

export type TimelineEventType =
  | 'sightings'
  | 'hunting'
  | 'file'
  | 'lateral'
  | 'nrd'
  | 'remoteAdmin'
  | 'remoteRegistry'
  | 'postExploit'
  | 'ipDownload'
  | 'rawProtocol'
  | 'userEnum'
  | 'powershell'
  | 'newServers'
  | 'smbSightings'
  | 'torrent'
  | 'smtpExe'
  | 'base64Encoding'
  | 'maliciousFilenames'
  | 'suspiciousFilenames'
  | 'longDomains'
  | 'shortDomains'
  | 'exeSightings'
  | 'dynamicDns'
  | 'tor'
  | 'publicDns'
  | 'smtpUnencrypted'
  | 'base64Decoding';

export const TIMELINE_TYPE_PRIORITY: Record<TimelineEventType, number> = {
  nrd: 0,
  sightings: 1,
  file: 2,
  lateral: 3,
  hunting: 4,
  remoteAdmin: 5,
  remoteRegistry: 6,
  postExploit: 7,
  ipDownload: 8,
  rawProtocol: 9,
  userEnum: 10,
  powershell: 11,
  newServers: 12,
  smbSightings: 13,
  torrent: 14,
  smtpExe: 15,
  base64Encoding: 16,
  maliciousFilenames: 17,
  suspiciousFilenames: 18,
  longDomains: 19,
  shortDomains: 20,
  exeSightings: 21,
  dynamicDns: 22,
  tor: 23,
  publicDns: 24,
  smtpUnencrypted: 25,
  base64Decoding: 26,
};

export type TaggedEvent = Event & { timelineType: TimelineEventType };

export type TimelineGroup = {
  type: TimelineEventType;
  events: TaggedEvent[];
  startTime: string;
  endTime: string;
};

export const TYPE_LABEL: Record<TimelineEventType, string> = {
  sightings: 'Sightings',
  hunting: 'Hunting',
  file: 'Fileinfo',
  lateral: 'Lateral',
  nrd: 'NRD',
  remoteAdmin: 'Remote Administration',
  remoteRegistry: 'Remote Registry',
  postExploit: 'Post Exploit',
  ipDownload: 'IP Download',
  rawProtocol: 'Raw Protocol Transfer',
  userEnum: 'User Enumeration',
  powershell: 'Powershell',
  newServers: 'New Servers',
  smbSightings: 'SMB Sightings',
  torrent: 'Torrent',
  smtpExe: 'SMTP EXE',
  base64Encoding: 'Base64 Encoding',
  maliciousFilenames: 'Malicious Filenames',
  suspiciousFilenames: 'Suspicious Filenames',
  longDomains: 'Long Domain Names',
  shortDomains: 'Short Domain Names',
  exeSightings: 'Exe Sightings',
  dynamicDns: 'Dynamic DNS',
  tor: 'Tor',
  publicDns: 'Public DNS Queries',
  smtpUnencrypted: 'SMTP Unencrypted',
  base64Decoding: 'Base64 Decoding',
};

export type TypeColorConfig = {
  border: string;
  text: string;
  bg: string;
};

const color = (border: string, text: string, bg: string): TypeColorConfig => ({
  border,
  text,
  bg,
});

const RED = color('border-red-500', 'text-red-400', 'bg-red-500/10');
const ROSE = color('border-rose-500', 'text-rose-400', 'bg-rose-500/10');
const ORANGE = color(
  'border-orange-500',
  'text-orange-400',
  'bg-orange-500/10',
);
const SKY = color('border-sky-500', 'text-sky-400', 'bg-sky-500/10');
const TEAL = color('border-teal-500', 'text-teal-400', 'bg-teal-500/10');
const PURPLE = color(
  'border-purple-500',
  'text-purple-400',
  'bg-purple-500/10',
);
const GREEN = color('border-green-500', 'text-green-400', 'bg-green-500/10');

export const PURPOSE_GROUPS: {
  label: string;
  color: TypeColorConfig;
  types: TimelineEventType[];
}[] = [
  {
    label: 'Lateral Movement',
    color: RED,
    types: ['lateral', 'remoteAdmin', 'remoteRegistry', 'userEnum'],
  },
  {
    label: 'Exploitation & Post-Exploit',
    color: ROSE,
    types: ['postExploit', 'powershell', 'base64Encoding', 'base64Decoding'],
  },
  {
    label: 'File Activity',
    color: ORANGE,
    types: [
      'file',
      'maliciousFilenames',
      'suspiciousFilenames',
      'smtpExe',
      'exeSightings',
    ],
  },
  {
    label: 'Network Anomalies',
    color: SKY,
    types: ['ipDownload', 'rawProtocol', 'torrent', 'tor', 'smtpUnencrypted'],
  },
  {
    label: 'DNS & Domains',
    color: TEAL,
    types: ['nrd', 'longDomains', 'shortDomains', 'dynamicDns', 'publicDns'],
  },
  {
    label: 'Sightings & Discovery',
    color: PURPLE,
    types: ['sightings', 'newServers', 'smbSightings'],
  },
  { label: 'Hunting Signals', color: GREEN, types: ['hunting'] },
];

export const TYPE_COLOR: Record<TimelineEventType, TypeColorConfig> =
  Object.fromEntries(
    PURPOSE_GROUPS.flatMap(({ color, types }) =>
      types.map((type) => [type, color]),
    ),
  ) as Record<TimelineEventType, TypeColorConfig>;
