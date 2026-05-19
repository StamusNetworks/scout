import { Event } from '@/features/events';

import { HUNTING_TRAIL_CONFIG } from '../definitions/hunting-trail.config';

// TODO: replace with the real Hunting Trail documentation URL once it ships.
export const HUNTING_TRAIL_DOCS_URL =
  'https://docs.stamus-networks.com/42.0.0/index.html';

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
  | 'base64Decoding'
  | 'ssh'
  | 'longerSsh'
  | 'rdp'
  | 'rfbVnc'
  | 'biggerTcp'
  | 'longerTcp'
  | 'biggerUdp'
  | 'longerUdp'
  | 'biggerIcmp'
  | 'longerIcmp'
  | 'unencryptedSmtpService'
  | 'unencryptedSmtpUsage'
  | 'ftpApplication'
  | 'ftpNetworkServices';

export type TaggedEvent = Event & { timelineType: TimelineEventType };

export type TimelineGroup = {
  type: TimelineEventType;
  events: TaggedEvent[];
  startTime: string;
  endTime: string;
};

export type TypeColorConfig = {
  border: string;
  text: string;
  bg: string;
};

export type PurposeSlug =
  | 'lateral-movement'
  | 'exploitation'
  | 'file-activity'
  | 'network-anomalies'
  | 'dns-domains'
  | 'sightings-discovery'
  | 'hunting-signals'
  | 'network-sessions'
  | 'network-services';

export type PurposeGroupData = {
  events: TaggedEvent[];
  count: number;
  isLoading: boolean;
  isError: boolean;
};

// --- Derivations from HUNTING_TRAIL_CONFIG ---

export const TYPE_COLOR = Object.fromEntries(
  HUNTING_TRAIL_CONFIG.groups.flatMap((g) =>
    g.queries.map((q) => [q.id, g.color]),
  ),
) as Record<TimelineEventType, TypeColorConfig>;

export const PURPOSE_SLUG_MAP = Object.fromEntries(
  HUNTING_TRAIL_CONFIG.groups.map((g) => [
    g.slug,
    {
      label: g.label,
      color: g.color,
      types: g.queries.map((q) => q.id as TimelineEventType),
    },
  ]),
) as Record<
  PurposeSlug,
  { label: string; color: TypeColorConfig; types: TimelineEventType[] }
>;

export const PURPOSE_SLUGS: { slug: PurposeSlug; label: string }[] =
  HUNTING_TRAIL_CONFIG.groups.map((g) => ({ slug: g.slug, label: g.label }));
