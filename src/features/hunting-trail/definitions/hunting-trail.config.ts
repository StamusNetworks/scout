import { PurposeSlug, TypeColorConfig } from '../model/hunting-trail';

export type HuntingTrailQuery =
  | { id: string; kind: 'filterset'; filtersetId: number }
  | {
      id: string;
      kind: 'static';
      qfilter: string;
      endpoint: 'alerts_tail' | 'events_tail';
      name: string;
      description: string;
    };

export type HuntingTrailGroup = {
  slug: PurposeSlug;
  label: string;
  color: TypeColorConfig;
  queries: HuntingTrailQuery[];
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
const BLUE = color('border-blue-500', 'text-blue-400', 'bg-blue-500/10');

const SIGHTINGS_DESCRIPTION =
  'New previously unseen communication artifacts, never observed before in the environment, such as a HTTP User-Agent, HTTP Servers, a domain name, a SMB file transfer, SSH software, a JA3S, a JA4 hash, TLS fingerprint, TLS SNI and so on. It can highlight unexpected communication from or to a host. It is valuable piece of metadata in a hunt as it allows to generically highlight new occurrences of communication.\n\nExample: New HTTP server detected that serves internal hosts from untrusted source.';

const FILE_DESCRIPTION =
  'Generic file transfer identification of Executables, Scripts, Archives, DOCs, PDFs, Excel, Power Point files over HTTP/HTTP2/SMB/SMTP/FTP. This granular visibility enables hunters to monitor the movement of high-risk file types across multiple protocols, making it much easier to spot unauthorized **data exfiltration** or the delivery of malicious payloads. By centralizing these diverse transfers into a single view, security teams can quickly correlate suspicious file activity with specific users or assets to disrupt an ongoing attack.\n\nExample: A security analyst identifies a series of encrypted ZIP archives being moved over an unusual SMB share, allowing them to stop a ransomware actor during the staging phase of an attack.';

const DYNAMIC_DNS_DESCRIPTION =
  'Dynamic DNS services. Hunting for traffic involving Dynamic DNS (DDNS) services which are frequently abused, helps identify **evasive command-and-control (C2)** infrastructure that frequently changes IP addresses to bypass static firewall blocks. By monitoring these services, security teams can pinpoint internal hosts communicating with volatile, often non-reputable domains typically favored by malware authors for their low cost and anonymity.\n\nExample: A hunt reveals an internal server making persistent outbound calls to a `duckdns.org` subdomain, leading to the discovery of a backdoor that was rotating through various compromised home IP addresses.';

export const HUNTING_TRAIL_CONFIG: { groups: HuntingTrailGroup[] } = {
  groups: [
    {
      slug: 'lateral-movement',
      label: 'Lateral Movement',
      color: RED,
      queries: [
        { id: 'lateral', kind: 'filterset', filtersetId: -149 },
        { id: 'remoteAdmin', kind: 'filterset', filtersetId: -151 },
        { id: 'remoteRegistry', kind: 'filterset', filtersetId: -152 },
        { id: 'userEnum', kind: 'filterset', filtersetId: -81 },
      ],
    },
    {
      slug: 'exploitation',
      label: 'Exploitation & Post-Exploit',
      color: ROSE,
      queries: [
        { id: 'postExploit', kind: 'filterset', filtersetId: -85 },
        { id: 'powershell', kind: 'filterset', filtersetId: -82 },
        { id: 'base64Encoding', kind: 'filterset', filtersetId: -47 },
        { id: 'base64Decoding', kind: 'filterset', filtersetId: -39 },
      ],
    },
    {
      slug: 'file-activity',
      label: 'File Activity',
      color: ORANGE,
      queries: [
        {
          id: 'file',
          kind: 'static',
          endpoint: 'events_tail',
          qfilter:
            '(metadata.flowbits:stamus.file.identification OR metadata.flowbits:stamus.file.store OR metadata.flowbits:stamus.dga.smbfilename) AND event_type:fileinfo',
          name: 'Fileinfo',
          description: FILE_DESCRIPTION,
        },
        { id: 'maliciousFilenames', kind: 'filterset', filtersetId: -34 },
        { id: 'suspiciousFilenames', kind: 'filterset', filtersetId: -37 },
        { id: 'smtpExe', kind: 'filterset', filtersetId: -78 },
        { id: 'exeSightings', kind: 'filterset', filtersetId: -73 },
      ],
    },
    {
      slug: 'network-anomalies',
      label: 'Network Anomalies',
      color: SKY,
      queries: [
        { id: 'ipDownload', kind: 'filterset', filtersetId: -84 },
        { id: 'rawProtocol', kind: 'filterset', filtersetId: -83 },
        { id: 'torrent', kind: 'filterset', filtersetId: -79 },
        { id: 'tor', kind: 'filterset', filtersetId: -70 },
        { id: 'smtpUnencrypted', kind: 'filterset', filtersetId: -127 },
      ],
    },
    {
      slug: 'dns-domains',
      label: 'DNS & Domains',
      color: TEAL,
      queries: [
        { id: 'nrd', kind: 'filterset', filtersetId: -88 },
        { id: 'longDomains', kind: 'filterset', filtersetId: -67 },
        { id: 'shortDomains', kind: 'filterset', filtersetId: -68 },
        {
          id: 'dynamicDns',
          kind: 'static',
          endpoint: 'alerts_tail',
          qfilter: 'alert.signature:*dns* AND alert.signature:*dynamic*',
          name: 'Dynamic DNS',
          description: DYNAMIC_DNS_DESCRIPTION,
        },
        { id: 'publicDns', kind: 'filterset', filtersetId: -76 },
      ],
    },
    {
      slug: 'sightings-discovery',
      label: 'Sightings & Discovery',
      color: PURPLE,
      queries: [
        {
          id: 'sightings',
          kind: 'static',
          endpoint: 'alerts_tail',
          qfilter: 'discovery:*',
          name: 'Sightings',
          description: SIGHTINGS_DESCRIPTION,
        },
        { id: 'newServers', kind: 'filterset', filtersetId: -90 },
        { id: 'smbSightings', kind: 'filterset', filtersetId: -89 },
      ],
    },
    {
      slug: 'hunting-signals',
      label: 'Hunting Signals',
      color: GREEN,
      queries: [{ id: 'hunting', kind: 'filterset', filtersetId: -77 }],
    },
    {
      slug: 'network-sessions',
      label: 'Network Sessions',
      color: BLUE,
      queries: [
        { id: 'ssh', kind: 'filterset', filtersetId: -107 },
        { id: 'longerSsh', kind: 'filterset', filtersetId: -105 },
        { id: 'rdp', kind: 'filterset', filtersetId: -108 },
        { id: 'rfbVnc', kind: 'filterset', filtersetId: -106 },
        { id: 'biggerTcp', kind: 'filterset', filtersetId: -103 },
        { id: 'longerTcp', kind: 'filterset', filtersetId: -104 },
        { id: 'biggerUdp', kind: 'filterset', filtersetId: -102 },
        { id: 'longerUdp', kind: 'filterset', filtersetId: -101 },
        { id: 'biggerIcmp', kind: 'filterset', filtersetId: -99 },
        { id: 'longerIcmp', kind: 'filterset', filtersetId: -100 },
      ],
    },
  ],
};
