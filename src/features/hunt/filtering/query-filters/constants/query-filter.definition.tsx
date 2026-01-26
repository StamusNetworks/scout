import { formatDuration } from 'date-fns';

import { formatBytes } from '@/common/lib/numbers';
import { Role, ROLES } from '@/features/analytics/hosts/hosts.config';

import { QueryFilterDefinition, QueryFilterType } from '../model/query-filter';
import {
  FilterCategory,
  FilterInputType,
  FilterType,
  FilterValidationType,
  KillChainStepsEnum,
} from './query-filter.config';

export const getFilterDef = (key: string) => QueryFiltersRecord[key];

export const CEQueryFilters: QueryFilterDefinition[] = [
  /* Signature filters */
  {
    label: 'Events min',
    key: 'hits_min',
    category: FilterCategory.SIGNATURE,
    inputType: FilterInputType.NUMBER,
    validationType: FilterValidationType.POSITIVE_INT,
  },
  {
    label: 'Events max',
    key: 'hits_max',
    category: FilterCategory.SIGNATURE,
    inputType: FilterInputType.NUMBER,
    validationType: FilterValidationType.POSITIVE_INT,
  },
  {
    label: 'Signature Message',
    key: 'msg',
    category: FilterCategory.SIGNATURE,
    entity: FilterType.SIGNATURE,
  },
  {
    key: 'content',
    label: 'Content',
    category: FilterCategory.SIGNATURE,
  },
  {
    label: 'Severity',
    key: 'alert.severity',
    description:
      'Alert severity levels: Severe (1), Suspicious (2), Contextual (3). Severity level 1 (Severe) is assigned by default if not specified in the detection method',
    category: FilterCategory.EVENT,
    toDisplayValue: (value: string) => {
      switch (value?.toString()) {
        case '1':
          return 'Severe';
        case '2':
          return 'Suspicious';
        case '3':
          return 'Contextual';
        default:
          return value?.toString() || '';
      }
    },
    toQueryValue: (value: string) => {
      switch (value?.toString().trim().toLowerCase()) {
        case 'severe':
          return '1';
        case 'suspicious':
          return '2';
        case 'contextual':
          return '3';
        default:
          return value?.toString() || '';
      }
    },
    inputType: FilterInputType.NUMBER,
  },
  {
    label: 'Filename',
    key: 'filename',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Share',
    key: 'share',
    category: FilterCategory.EVENT,
  },
  {
    key: 'smb.session_id',
    label: 'Session ID',
    description: 'Session IDs for SMB protocol',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Attacker Network',
    key: 'alert.source.net_info_agg',
    description: 'Network information aggregated for attack source addresses',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Victim Network',
    key: 'alert.target.net_info_agg',
    description: 'Network information aggregated for attack target addresses',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Method',
    key: 'alert.signature',
    description: 'Detection methods that triggered the alerts',
    category: FilterCategory.EVENT,
    entity: FilterType.SIGNATURE,
  },
  {
    label: 'Method ID',
    key: 'alert.signature_id',
    category: FilterCategory.EVENT,
    inputType: FilterInputType.NUMBER,
    validationType: FilterValidationType.POSITIVE_INT,
  },
  {
    label: 'Category',
    key: 'alert.category',
    description: 'Classification categories for security events',
    category: FilterCategory.EVENT,
    toDisplayValue: (value: string) =>
      value !== '' ? value || 'Unknown' : 'Unknown',
    toQueryValue: (value: string) => (value === 'Unknown' ? '' : value),
  },
  {
    label: 'Revision',
    key: 'alert.rev',
    description: 'Revision of the alert',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Tag',
    key: 'alert.tag',
    description: 'Tag for the alert (informational, relevant)',
    category: FilterCategory.EVENT,
  },
  {
    label: 'X-Forwarded-For',
    key: 'alert.xff',
    description:
      'Original client IP addresses when traffic passes through proxies or load balancers',
    category: FilterCategory.EVENT,
    entity: FilterType.IP,
  },
  {
    label: 'Source Net',
    key: 'net_info.src_agg',
    description: 'Source network information aggregated',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Event Type',
    key: 'event_type',
    description: 'Type of the event (Stamus, Alert, Sighting...)',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Data Stream Source IP',
    key: 'src_ip',
    description: 'Source IP addresses in network communications',
    category: FilterCategory.EVENT,
    entity: FilterType.IP,
  },
  {
    label: 'Data Stream Source Port',
    key: 'src_port',
    description: 'Source port numbers used in network connections',
    category: FilterCategory.EVENT,
    entity: FilterType.PORT,
    inputType: FilterInputType.NUMBER,
  },
  {
    label: 'Port',
    key: 'port',
    description: 'Port numbers used in network communications',
    category: FilterCategory.EVENT,
    entity: FilterType.PORT,
    inputType: FilterInputType.NUMBER,
    validationType: FilterValidationType.POSITIVE_INT,
    toQFString: ({ value, negated }) =>
      `(${negated ? 'NOT ' : ''}(src_port: "${value}" OR dest_port: "${value}"))`,
  },
  {
    label: 'Network',
    key: 'net_info.agg',
    category: FilterCategory.EVENT,
    entity: FilterType.NETWORK_INFO,
    toQFString: ({ value, negated }) =>
      `(${negated ? 'NOT ' : ''}(net_info.src_agg: "${value}" OR net_info.dest_agg: "${value}"))`,
  },
  {
    label: 'Destination Net',
    key: 'net_info.dest_agg',
    description: 'Destination network information aggregated',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Data Stream Destination IP',
    key: 'dest_ip',
    description: 'Destination IP addresses in network communications',
    category: FilterCategory.EVENT,
    entity: FilterType.IP,
  },
  {
    label: 'Data Stream Destination Port',
    key: 'dest_port',
    description: 'Destination port numbers used in network connections',
    category: FilterCategory.EVENT,
    entity: FilterType.PORT,
    inputType: FilterInputType.NUMBER,
  },
  {
    label: 'IP Protocol',
    key: 'proto',
    description: 'Internet Protocol types',
    category: FilterCategory.EVENT,
    entity: FilterType.PROTO,
  },
  {
    label: 'App Protocol',
    key: 'app_proto',
    description: 'Application protocol (HTTP, SMB, DNS, etc.)',
    category: FilterCategory.EVENT,
    entity: FilterType.APP_PROTO,
  },
  {
    label: 'Original application protocol',
    key: 'app_proto_orig',
    description: 'Original application protocol',
    category: FilterCategory.EVENT,
    entity: FilterType.APP_PROTO,
  },
  {
    label: 'Probe',
    key: 'host',
    category: FilterCategory.EVENT,
    description: 'Stamus Networks probes and sensors that detected the events',
  },
  {
    label: 'Capture Interface',
    key: 'in_iface',
    description: 'Virtual LAN identifiers for network segmentation',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Vlan',
    key: 'vlan',
    description: 'Virtual LAN identifiers for network segmentation',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Tunnel Source IP',
    key: 'tunnel.src_ip',
    description: 'Source IP addresses in tunneled network traffic',
    category: FilterCategory.EVENT,
    entity: FilterType.IP,
  },
  {
    label: 'Tunnel Destination IP',
    key: 'tunnel.dest_ip',
    description: 'Destination IP addresses in tunneled network traffic',
    category: FilterCategory.EVENT,
    entity: FilterType.IP,
  },
  {
    label: 'Tunnel Protocol',
    key: 'tunnel.proto',
    description: 'Protocols used for network tunneling',
    category: FilterCategory.EVENT,
    entity: FilterType.PROTO,
  },
  {
    label: 'Tunnel Depth',
    key: 'tunnel.depth',
    description: 'Number of nested tunnel layers in the network traffic',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Attacker IP',
    key: 'alert.source.ip',
    description:
      'IP addresses identified as sources of malicious activity. Might be reversed depending on the detection method. Client IPs is a better indicator for this field',
    category: FilterCategory.EVENT,
    entity: FilterType.IP,
  },
  {
    label: 'Attacker Port',
    key: 'alert.source.port',
    description:
      'Source port of identified attacker. Might be reversed depending on the detection method.',
    category: FilterCategory.EVENT,
    entity: FilterType.PORT,
    inputType: FilterInputType.NUMBER,
  },
  {
    label: 'Victim IP',
    key: 'alert.target.ip',
    description:
      'IP addresses identified as targets of attacks. Might be reversed depending on the detection method. Server IPs is a better indicator for this field',
    category: FilterCategory.EVENT,
    entity: FilterType.IP,
  },
  {
    label: 'Victim Port',
    key: 'alert.target.port',
    description: 'Destination port numbers used in network connections',
    category: FilterCategory.EVENT,
    entity: FilterType.PORT,
    inputType: FilterInputType.NUMBER,
  },
  {
    label: 'Lateral movement',
    key: 'alert.lateral',
    description:
      'Lateral movement indicators showing internal network traversal attempts',
    category: FilterCategory.EVENT,
  },
  {
    label: 'FQDN Source',
    key: 'fqdn.src',
    description:
      'Fully Qualified Domain Names associated with source addresses',
    category: FilterCategory.EVENT,
  },
  {
    label: 'FQDN Destination',
    key: 'fqdn.dest',
    description:
      'Fully Qualified Domain Names associated with destination addresses',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Queried Name',
    key: 'dns.query.rrname',
    description: 'Domain names queried in DNS requests',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Queried Type',
    key: 'dns.query.rrtype',
    description: 'DNS record types',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Queried Name',
    key: 'dns.queries.rrname',
    description: 'Domain names queried in DNS requests',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Queried Type',
    key: 'dns.queries.rrtype',
    description: 'DNS record types',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Flow start',
    key: 'flow.start',
    description: 'Start time of the flow',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Source IP',
    key: 'flow.src_ip',
    description: 'Source IP addresses in network communications',
    category: FilterCategory.EVENT,
    entity: FilterType.IP,
  },
  {
    label: 'Destination IP',
    key: 'flow.dest_ip',
    description: 'Destination IP addresses in network communications',
    category: FilterCategory.EVENT,
    entity: FilterType.IP,
  },
  {
    label: 'Source Port',
    key: 'flow.src_port',
    description: 'Source port numbers used in network connections',
    category: FilterCategory.EVENT,
    entity: FilterType.PORT,
    inputType: FilterInputType.NUMBER,
  },
  {
    label: 'Destination Port',
    key: 'flow.dest_port',
    description: 'Destination port numbers used in network connections',
    category: FilterCategory.EVENT,
    inputType: FilterInputType.NUMBER,
  },
  {
    label: 'Bytes to server',
    key: 'flow.bytes_toserver',
    description: 'Bytes sent to the server',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Bytes to client',
    key: 'flow.bytes_toclient',
    description: 'Bytes sent to the client',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Pkts to server',
    key: 'flow.pkts_toserver',
    description: 'Packets sent to the server',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Pkts to client',
    key: 'flow.pkts_toclient',
    description: 'Packets sent to the client',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Flow ID',
    key: 'flow_id',
    description:
      'Always unique value. Correlates the network protocol, alert, flow, file, anomaly logs and any network evidence from the same flow/session.',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Flow Duration',
    key: 'flow.age',
    category: FilterCategory.EVENT,
    toDisplayValue: (value: number) => formatDuration({ seconds: value }),
  },
  {
    label: 'Community ID',
    key: 'community_id',
    description:
      'Not always unique, this id that can be used to correlate to other systems.',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Country',
    key: 'geoip.country_name',
    description: 'Countries associated with IP addresses in security events',
    category: FilterCategory.EVENT,
  },
  {
    label: 'City',
    key: 'geoip.city_name',
    description: 'Cities associated with IP addresses in security events',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Country Code',
    key: 'geoip.country.iso_code',
    category: FilterCategory.EVENT,
  },
  {
    label: 'AS Number',
    key: 'geoip.provider.autonomous_system_number',
    description:
      'Autonomous System Numbers identifying internet service providers and organizations',
    category: FilterCategory.EVENT,
    entity: FilterType.ASNUMBER,
  },
  {
    label: 'AS Organization',
    key: 'geoip.provider.autonomous_system_organization',
    description: 'Organizations that own and operate the Autonomous Systems',
    category: FilterCategory.EVENT,
  },
  {
    label: 'HTTP Host',
    key: 'http.hostname',
    description: 'Domain names accessed in HTTP requests',
    category: FilterCategory.EVENT,
    entity: FilterType.HOSTNAME,
  },
  {
    label: 'URL',
    key: 'http.url',
    description: 'Complete URLs requested in HTTP traffic',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Status',
    key: 'http.status',
    description: 'HTTP response status codes',
    category: FilterCategory.EVENT,
    inputType: FilterInputType.NUMBER,
    validationType: FilterValidationType.POSITIVE_INT,
  },
  {
    label: 'HTTP Method',
    key: 'http.http_method',
    category: FilterCategory.EVENT,
  },
  {
    label: 'HTTP User Agent',
    key: 'http.http_user_agent',
    description: 'Browser and client application identifiers',
    category: FilterCategory.EVENT,
    entity: FilterType.USER_AGENT,
  },
  {
    label: 'Referrer',
    key: 'http.http_refer',
    category: FilterCategory.EVENT,
  },
  {
    label: 'HTTP Port',
    key: 'http.http_port',
    category: FilterCategory.EVENT,
    entity: FilterType.PORT,
    inputType: FilterInputType.NUMBER,
  },
  {
    label: 'Content Type',
    key: 'http.http_content_type',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Length',
    key: 'http.length',
    category: FilterCategory.EVENT,
    inputType: FilterInputType.NUMBER,
    validationType: FilterValidationType.POSITIVE_INT,
  },
  {
    label: 'HTTP Server',
    key: 'http.server',
    description: 'Web server software and version information',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Accept Language',
    key: 'http.accept_language',
    category: FilterCategory.EVENT,
  },
  {
    key: 'http.protocol',
    label: 'Protocol',
    category: FilterCategory.EVENT,
    entity: FilterType.PROTO,
  },
  {
    label: 'Subject DN',
    key: 'tls.subject',
    description: 'Distinguished Names of certificate subjects',
    category: FilterCategory.EVENT,
    convertible: ['host_id.services.values.tls.subject'],
  },

  {
    label: 'Issuer DN',
    key: 'tls.issuerdn',
    description: 'Distinguished Names of certificate issuers',
    category: FilterCategory.EVENT,
    convertible: ['host_id.services.values.tls.issuerdn'],
  },
  {
    label: 'Not Before',
    key: 'tls.notbefore',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Not After',
    key: 'tls.notafter',
    category: FilterCategory.EVENT,
  },
  {
    label: 'JA3',
    key: 'tls.ja3.hash',
    category: FilterCategory.EVENT,
  },
  {
    label: 'JA4',
    key: 'tls.ja4',
    description: 'JA4 fingerprints for TLS client and server identification',
    category: FilterCategory.EVENT,
    convertible: ['host_id.tls.ja4.hash'],
  },
  {
    label: 'Serial',
    key: 'tls.serial',
    category: FilterCategory.EVENT,
  },
  {
    label: 'JA3 User-Agent',
    key: 'tls.ja3.agent',
    description: 'User-Agent strings associated with JA3 fingerprints',
    category: FilterCategory.EVENT,
  },
  {
    label: 'JA4 User-Agent',
    key: 'tls.ja4.agent',
    category: FilterCategory.EVENT,
    convertible: ['host_id.tls.ja4.agent'],
  },
  {
    label: 'Fingerprint',
    key: 'tls.fingerprint',
    description: 'Unique cryptographic fingerprints of TLS certificates',
    category: FilterCategory.EVENT,
    convertible: ['host_id.services.values.tls.fingerprint'],
  },
  {
    label: 'JA3S',
    key: 'tls.ja3s.hash',
    description:
      'JA3S fingerprints for TLS server identification based on handshake parameters',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Version',
    key: 'tls.version',
    description: 'TLS protocol versions',
    category: FilterCategory.EVENT,
  },
  {
    key: 'tls.cipher_suite',
    label: 'Cipher Suite',
    description: 'Cryptographic cipher suites negotiated in TLS handshakes',
    category: FilterCategory.EVENT,
    entity: FilterType.CIPHER,
  },
  {
    label: 'Cipher Security',
    key: 'tls.cipher_security',
    description:
      'Security strength of the cipher suite used in TLS connections',
    category: FilterCategory.EVENT,
  },
  {
    key: 'smtp.mail_from',
    label: 'From',
    description: 'Email addresses specified in SMTP MAIL FROM commands',
    category: FilterCategory.EVENT,
    entity: FilterType.USERNAME,
  },
  {
    key: 'smtp.rcpt_to',
    label: 'To',
    description: 'Email addresses specified in SMTP RCPT TO commands',
    category: FilterCategory.EVENT,
    entity: FilterType.USERNAME,
  },
  {
    label: 'Client Software',
    key: 'ssh.client.software_version',
    description: 'SSH client software names and versions',
    category: FilterCategory.EVENT,
    convertible: ['host_id.ssh.client.software_version'],
  },
  {
    key: 'ssh.client.proto_version',
    label: 'Client Version',
    description: 'SSH protocol versions supported by clients',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Client HASSH',
    key: 'ssh.client.hassh.hash',
    description: 'SSH client Hassh hash',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Client HASSH String',
    key: 'ssh.client.hassh.string',
    description: 'SSH client Hassh string',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Server HASSH',
    key: 'ssh.server.hassh.hash',
    description: 'SSH server Hassh hash',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Server HASSH String',
    key: 'ssh.server.hassh.string',
    description: 'SSH server Hassh string',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Server Software',
    key: 'ssh.server.software_version',
    description: 'SSH server software names and versions',
    category: FilterCategory.EVENT,
    convertible: ['host_id.ssh.server.software_version'],
  },
  {
    label: 'Server Version',
    key: 'ssh.server.proto_version',
    description: 'SSH protocol versions supported by servers',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Source MAC',
    key: 'ether.src_mac',
    category: FilterCategory.EVENT,
    entity: FilterType.MACADDRESS,
  },
  {
    label: 'Destination MAC',
    key: 'ether.dest_mac',
    category: FilterCategory.EVENT,
    entity: FilterType.MACADDRESS,
  },
  {
    label: 'IP',
    key: 'ip',
    description: 'IP addresses involved in security events',
    category: FilterCategory.EVENT,
    entity: FilterType.IP,
    validationType: FilterValidationType.IP,
    toQFString: ({ value, negated }) =>
      `(${negated ? 'NOT ' : ''}(src_ip: "${value}" OR dest_ip: "${value}"))`,
    convertible: ['stamus.asset', 'stamus.source'],
  },
  {
    label: 'DNS rdata',
    key: 'dns.rdata',
    category: FilterCategory.EVENT,
    entity: FilterType.IP,
  },
  {
    label: 'DNS answers rdata',
    key: 'dns.answers.rdata',
    category: FilterCategory.EVENT,
    entity: FilterType.IP,
  },
  {
    label: 'DNS grouped A',
    key: 'dns.grouped.A',
    category: FilterCategory.EVENT,
    entity: FilterType.IP,
  },
  {
    label: 'DNS grouped AAAA',
    key: 'dns.grouped.AAAA',
    category: FilterCategory.EVENT,
    entity: FilterType.IP,
  },
  {
    label: 'Mitre Tactic ID',
    key: 'alert.metadata.mitre_tactic_id',
    description:
      'MITRE ATT&CK tactic identifiers. See the whole list of tactics at https://attack.mitre.org/tactics/enterprise/',
    category: FilterCategory.EVENT,
    entity: FilterType.MITRE_TACTIC_ID,
  },
  {
    label: 'Mitre Technique ID',
    key: 'alert.metadata.mitre_technique_id',
    description:
      'MITRE ATT&CK technique identifiers. See the whole list of techniques at https://attack.mitre.org/techniques/enterprise/',
    category: FilterCategory.EVENT,
    entity: FilterType.MITRE_TECHNIQUE_ID,
  },
  {
    key: 'alert.metadata.mitre_tactic_name',
    label: 'Mitre Tactic Name',
    description:
      'MITRE ATT&CK tactic names. See the whole list of tactics at https://attack.mitre.org/tactics/enterprise/',
    category: FilterCategory.EVENT,
    entity: FilterType.MITRE_TACTIC_NAME,
    toDisplayValue: (value: string) => value?.replaceAll('_', ' ') || '',
  },
  {
    label: 'Mitre Technique Name',
    key: 'alert.metadata.mitre_technique_name',
    description:
      'MITRE ATT&CK technique names. See the whole list of techniques at https://attack.mitre.org/techniques/enterprise/',
    category: FilterCategory.EVENT,
    entity: FilterType.MITRE_TECHNIQUE_NAME,
    toDisplayValue: (value: string) => value?.replaceAll('_', ' ') || '',
  },
  {
    label: 'Method Severity',
    key: 'alert.metadata.signature_severity',
    description:
      'Severity levels assigned to detection methods by threat intelligence sources',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Attack Target',
    key: 'alert.metadata.attack_target',
    category: FilterCategory.EVENT,
    description: 'Types of systems or services targeted by the attack',
  },
  {
    label: 'Deployment',
    key: 'alert.metadata.deployment',
    category: FilterCategory.EVENT,
  },
  {
    key: 'alert.metadata.updated_at',
    label: 'Updated At',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Created At',
    key: 'alert.metadata.created_at',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Tag',
    key: 'alert.metadata.tag',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Affected Product',
    key: 'alert.metadata.affected_product',
    category: FilterCategory.EVENT,
    description: 'Software products or services affected by the security event',
  },
  {
    label: 'Malware Family',
    key: 'alert.metadata.malware_family',
    category: FilterCategory.EVENT,
    description:
      'Classification of malware into known families based on behavior, characteristics and threat intelligence',
  },
  {
    label: 'TLS SNI',
    key: 'tls.sni',
    description:
      'Domain names specified in TLS Server Name Indication extension',
    category: FilterCategory.EVENT,
    entity: FilterType.HOSTNAME,
  },
  {
    key: 'http.http_refer_info.host',
    label: 'HTTP Refer Host',
    description: 'Host portions of HTTP referrer URLs',
    category: FilterCategory.EVENT,
    entity: FilterType.HOSTNAME,
  },
  {
    label: 'SMTP Helo',
    key: 'smtp.helo',
    description:
      'Domain names or IP addresses specified in SMTP HELO/EHLO commands',
    category: FilterCategory.EVENT,
    entity: FilterType.HOSTNAME,
  },
  {
    label: 'Hostname Host',
    key: 'hostname_info.host',
    category: FilterCategory.EVENT,
    entity: FilterType.HOSTNAME,
  },
  {
    label: 'Command',
    key: 'smb.command',
    description: 'SMB protocol commands executed',
    category: FilterCategory.EVENT,
  },
  {
    key: 'smb.status',
    label: 'Status',
    description: 'SMB operation status codes and results',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Filename',
    key: 'smb.filename',
    description: 'Names of files accessed through SMB protocol',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Share',
    key: 'smb.share',
    description: 'Network share names accessed through SMB protocol',
    category: FilterCategory.EVENT,
  },
  {
    label: 'DCERPC Interface',
    key: 'smb.dcerpc.interfaces.name',
    description:
      'Distributed Computing Environment Remote Procedure Call interface names',
    category: FilterCategory.EVENT,
  },
  {
    label: 'DCERPC Endpoint',
    key: 'smb.dcerpc.endpoint',
    description: 'DCERPC service endpoints accessed through SMB connections',
    category: FilterCategory.EVENT,
  },
  {
    label: 'ES Filter',
    key: 'es_filter',
    category: FilterCategory.EVENT,
    toQFString: ({ value, negated }) => `${negated ? 'NOT ' : ''}(${value})`,
  },
  {
    label: 'File Size',
    key: 'fileinfo.size',
    description: 'File sizes in bytes',
    category: FilterCategory.EVENT,
    toDisplayValue: (value: number) => formatBytes(value),
  },
  {
    label: 'Filename',
    key: 'files.filename',
    description: 'Names of files transferred or accessed',
    category: FilterCategory.EVENT,
  },
  {
    label: 'SHA256',
    key: 'files.sha256',
    description:
      'SHA-256 cryptographic hashes of file contents for integrity verification',
    category: FilterCategory.EVENT,
    entity: [FilterType.SHA256, FilterType.FILE_HASH],
  },
  {
    key: 'files.mimetype',
    label: 'Mimetype',
    description: 'MIME types indicating file content types',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Stored',
    key: 'files.stored',
    description: 'Indicates whether the file was stored in the database',
    category: FilterCategory.EVENT, // formatFn: (value) => (value ? "Yes" : "No"),
  },
  {
    label: 'Filename',
    key: 'fileinfo.filename',
    description: 'Names of files transferred or accessed',
    category: FilterCategory.EVENT,
  },
  {
    label: 'SHA256',
    key: 'fileinfo.sha256',
    description:
      'SHA-256 cryptographic hashes of file contents for integrity verification',
    category: FilterCategory.EVENT,
    entity: [FilterType.SHA256, FilterType.FILE_HASH],
  },
  {
    key: 'fileinfo.mimetype',
    label: 'Mimetype',
    description: 'MIME types indicating file content types',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Stored',
    key: 'fileinfo.stored',
    description: 'Indicates whether the file was stored in the database',
    category: FilterCategory.EVENT, // formatFn: (value) => (value ? "Yes" : "No"),
  },
  /* HISTORY */
  {
    label: 'User',
    key: 'username',
    category: FilterCategory.HISTORY,
    entity: FilterType.USERNAME,
  },
  {
    label: 'Comment',
    key: 'comment',
    category: FilterCategory.HISTORY,
  },
  {
    label: 'Client IP',
    key: 'client_ip',
    category: FilterCategory.HISTORY,
    entity: FilterType.IP,
    validationType: FilterValidationType.IP,
  },
  {
    label: 'Action Type',
    key: 'action_type',
    category: FilterCategory.HISTORY,
  },
  {
    label: 'Proposed Layer',
    key: 'tls.alpn_ts',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Negociated Layer',
    key: 'tls.alpn_tc',
    category: FilterCategory.EVENT,
  },
];

export const QueryFilters: QueryFilterDefinition[] = [
  ...CEQueryFilters,
  {
    label: 'In home network',
    key: 'host_id.in_home_net',
    category: FilterCategory.HOST,
  },
  {
    label: 'HTTP Server',
    key: 'host_id.services.values.http.server',
    category: FilterCategory.HOST,
  },
  {
    label: 'Subject DN',
    key: 'host_id.services.values.tls.subject',
    category: FilterCategory.HOST,
    convertible: ['tls.subject'],
  },
  {
    label: 'Server Software',
    key: 'host_id.ssh.server.software_version',
    category: FilterCategory.HOST,
    convertible: ['ssh.server.software_version'],
  },
  {
    label: 'IP Protocol',
    key: 'host_id.services.proto',
    category: FilterCategory.HOST,
    entity: FilterType.PROTO,
  },
  {
    label: 'App Protocol',
    key: 'host_id.services.values.app_proto',
    category: FilterCategory.HOST,
    entity: FilterType.APP_PROTO,
  },
  {
    label: 'HTTP User Agent',
    key: 'host_id.http.user_agent.agent',
    category: FilterCategory.HOST,
    entity: FilterType.USER_AGENT,
  },
  {
    label: 'Host IP',
    key: 'host_id.ip',
    category: FilterCategory.HOST,
    entity: FilterType.IP,
    validationType: FilterValidationType.IP,
    type: 'ip',
    toQFString: ({ value, negated }) =>
      `(${negated ? 'NOT ' : ''}ip:"${value}")`,
  },
  {
    label: 'Hostname',
    key: 'host_id.hostname.host',
    category: FilterCategory.HOST,
    entity: FilterType.HOSTNAME,
  },
  {
    label: 'Service Port',
    key: 'host_id.services.port',
    category: FilterCategory.HOST,
    entity: FilterType.PORT,
    inputType: FilterInputType.NUMBER,
    validationType: FilterValidationType.POSITIVE_INT,
  },
  {
    label: 'Username',
    key: 'host_id.username.user',
    category: FilterCategory.HOST,
    entity: FilterType.USERNAME,
  },
  {
    label: 'Network',
    key: 'host_id.net_info.agg',
    category: FilterCategory.HOST,
    entity: FilterType.NETWORK_INFO,
  },
  {
    label: 'Services count min',
    key: 'host_id.services_count.min',
    category: FilterCategory.HOST,
    inputType: FilterInputType.NUMBER,
    validationType: FilterValidationType.POSITIVE_INT,
    type: 'long',
    toQFString: ({ value, negated }) =>
      `(${negated ? 'NOT ' : ''}(host_id.services_count:>=${value}))`,
  },
  {
    label: 'Services count max',
    key: 'host_id.services_count.max',
    category: FilterCategory.HOST,
    inputType: FilterInputType.NUMBER,
    validationType: FilterValidationType.POSITIVE_INT,
    type: 'long',
    toQFString: ({ value, negated }) =>
      `(${negated ? 'NOT ' : ''}(host_id.services_count:<=${value}))`,
  },
  {
    label: 'Hostnames count min',
    key: 'host_id.hostname_count.min',
    category: FilterCategory.HOST,
    inputType: FilterInputType.NUMBER,
    validationType: FilterValidationType.POSITIVE_INT,
    type: 'long',
    toQFString: ({ value, negated }) =>
      `(${negated ? 'NOT ' : ''}(host_id.hostname_count:>=${value}))`,
  },
  {
    label: 'Hostnames count max',
    key: 'host_id.hostname_count.max',
    category: FilterCategory.HOST,
    inputType: FilterInputType.NUMBER,
    validationType: FilterValidationType.POSITIVE_INT,
    type: 'long',
    toQFString: ({ value, negated }) =>
      `(${negated ? 'NOT ' : ''}(host_id.hostname_count:>=${value}))`,
  },
  {
    label: 'TLS JA4 count min',
    key: 'host_id.tls.ja4_count.min',
    category: FilterCategory.HOST,
    inputType: FilterInputType.NUMBER,
    validationType: FilterValidationType.POSITIVE_INT,
    type: 'long',
    toQFString: ({ value, negated }) =>
      `(${negated ? 'NOT ' : ''}(host_id.tls.ja4_count:>=${value}))`,
  },
  {
    label: 'TLS JA4 count max',
    key: 'host_id.tls.ja4_count.max',
    category: FilterCategory.HOST,
    inputType: FilterInputType.NUMBER,
    validationType: FilterValidationType.POSITIVE_INT,
    type: 'long',
    toQFString: ({ value, negated }) =>
      `(${negated ? 'NOT ' : ''}(host_id.tls.ja4_count:<=${value}))`,
  },
  {
    label: 'User-Agents count min',
    key: 'host_id.http.user_agent_count.min',
    category: FilterCategory.HOST,
    inputType: FilterInputType.NUMBER,
    validationType: FilterValidationType.POSITIVE_INT,
    type: 'long',
    toQFString: ({ value, negated }) =>
      `(${negated ? 'NOT ' : ''}(host_id.http.user_agent_count:>=${value}))`,
  },
  {
    label: 'User-Agents count max',
    key: 'host_id.http.user_agent_count.max',
    category: FilterCategory.HOST,
    inputType: FilterInputType.NUMBER,
    validationType: FilterValidationType.POSITIVE_INT,
    type: 'long',
    toQFString: ({ value, negated }) =>
      `(${negated ? 'NOT ' : ''}(host_id.http.user_agent_count:>=${value}))`,
  },
  {
    label: 'Clients count min',
    key: 'host_id.ssh.client_count.min',
    category: FilterCategory.HOST,
    inputType: FilterInputType.NUMBER,
    validationType: FilterValidationType.POSITIVE_INT,
    type: 'long',
    toQFString: ({ value, negated }) =>
      `(${negated ? 'NOT ' : ''}(host_id.ssh.client_count:>=${value}))`,
  },
  {
    label: 'Clients count max',
    key: 'host_id.ssh.client_count.max',
    category: FilterCategory.HOST,
    inputType: FilterInputType.NUMBER,
    validationType: FilterValidationType.POSITIVE_INT,
    type: 'long',
    toQFString: ({ value, negated }) =>
      `(${negated ? 'NOT ' : ''}(host_id.ssh.client_count:<=${value}))`,
  },
  {
    label: 'Usernames count min',
    key: 'host_id.username_count.min',
    category: FilterCategory.HOST,
    inputType: FilterInputType.NUMBER,
    validationType: FilterValidationType.POSITIVE_INT,
    type: 'long',
    toQFString: ({ value, negated }) =>
      `(${negated ? 'NOT ' : ''}(host_id.username_count:>=${value}))`,
  },
  {
    label: 'Usernames count max',
    key: 'host_id.username_count.max',
    category: FilterCategory.HOST,
    inputType: FilterInputType.NUMBER,
    validationType: FilterValidationType.POSITIVE_INT,
    type: 'long',
    toQFString: ({ value, negated }) =>
      `(${negated ? 'NOT ' : ''}(host_id.username_count:<=${value}))`,
  },
  {
    label: 'Role',
    key: 'host_id.roles.name',
    category: FilterCategory.HOST,
    entity: FilterType.ROLE,
    toDisplayValue: (value: string) => ROLES[value as Role]?.name,
    toQFString: ({ value, negated, wildcarded }) =>
      value === 'unclassified'
        ? `${negated ? '' : 'NOT '}host_id.roles.name: *`
        : wildcarded
          ? `host_id.roles.name:${value}`
          : `(${negated ? 'NOT ' : ''}(host_id.roles.name.raw:"${value}"))`,
  },
  {
    label: 'Issuer DN',
    key: 'host_id.services.values.tls.issuerdn',
    category: FilterCategory.HOST,
    convertible: ['tls.issuerdn'],
  },
  {
    label: 'JA4',
    key: 'host_id.tls.ja4.hash',
    category: FilterCategory.HOST,
    convertible: ['tls.ja4'],
  },
  {
    label: 'JA4 User-Agent',
    key: 'host_id.tls.ja4.agent',
    category: FilterCategory.HOST,
    convertible: ['tls.ja4.agent'],
  },
  {
    label: 'Fingerprint',
    key: 'host_id.services.values.tls.fingerprint',
    category: FilterCategory.HOST,
    convertible: ['tls.fingerprint'],
  },
  {
    label: 'Client Software',
    key: 'host_id.ssh.client.software_version',
    category: FilterCategory.HOST,
    convertible: ['ssh.client.software_version'],
  },
  {
    key: 'stamus.asset',
    label: 'Entity',
    description: 'Entities identified by Stamus threat intelligence',
    category: FilterCategory.EVENT,
    entity: FilterType.STAMUS_ASSET,
    type: 'ip',
    convertible: ['ip'],
  },
  {
    label: 'Offender',
    key: 'stamus.source',
    description:
      'Threat actors and malicious sources identified by Stamus intelligence',
    category: FilterCategory.EVENT,
    entity: FilterType.STAMUS_ASSET,
    convertible: ['ip'],
  },
  {
    label: 'Threat',
    key: 'stamus.threat_name',
    description:
      'Named threats and attack campaigns identified by Stamus intelligence',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Family',
    key: 'stamus.family_name',
    description:
      'Malware and threat families classified by Stamus intelligence',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Kill Chain Phase',
    key: 'stamus.kill_chain',
    description: 'Cyber kill chain phases mapped by Stamus threat analysis',
    category: FilterCategory.EVENT,
    toDisplayValue: (value: string) =>
      KillChainStepsEnum[value as keyof typeof KillChainStepsEnum] || value,
    inputType: FilterInputType.SELECT,
    options: [
      { value: 'reconnaissance', label: 'Reconnaissance' },
      { value: 'weaponization', label: 'Weaponization' },
      { value: 'delivery', label: 'Delivery' },
      { value: 'exploitation', label: 'Exploitation' },
      { value: 'installation', label: 'Installation' },
      { value: 'command_and_control', label: 'Command and Control' },
      { value: 'actions_on_objectives', label: 'Actions on Objectives' },
      { value: 'pre_condition', label: 'Policy Violation' },
    ],
  },
  {
    label: 'Method ID',
    key: 'stamus.threat_id',
    description: 'Unique identifiers for security incidents tracked by Stamus',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Event ID',
    key: 'stamus.event_id',
    description: 'Unique identifiers for security incidents tracked by Stamus',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Sighting Entity Role',
    key: 'discovery.asset_role',
    description: 'Roles assigned to discovered network entities',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Sighting Entity',
    key: 'discovery.asset',
    description: 'Network assets discovered through passive monitoring',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Sighting Entity Net',
    key: 'discovery.asset_net',
    description: 'Network segments where entities were discovered',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Sighting Key',
    key: 'discovery.key',
    description: 'Discovery attribute keys',
    category: FilterCategory.EVENT,
  },
  {
    key: 'discovery.value',
    label: 'Sighting Value',
    description: 'Discovery attribute values corresponding to the keys',
    category: FilterCategory.EVENT,
  },
  {
    key: 'host_id.in_home_net',
    label: 'In home network',
    category: FilterCategory.HOST,
  },
  {
    key: 'stamus.incidents_id',
    label: 'Incident ID',
    description: 'Unique identifiers for security incidents tracked by Stamus',
    category: FilterCategory.EVENT,
    inputType: FilterInputType.NUMBER,
  },
  {
    label: 'Host Domain',
    key: 'hostname_info.domain',
    description: 'Complete domain names including TLD',
    category: FilterCategory.EVENT,
    entity: FilterType.HOSTNAME,
  },
  {
    label: 'Host Subdomain',
    key: 'hostname_info.subdomain',
    description: 'Subdomain portions of FQDNs',
    category: FilterCategory.EVENT,
    toDisplayValue: (value: string) =>
      value !== '' ? value || 'Unknown' : 'Unknown',
    toQueryValue: (value: string) => (value === 'Unknown' ? '' : value),
  },
  {
    label: 'Host TLD',
    key: 'hostname_info.tld',
    description: 'Top-Level Domains',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Host Domain Without TLD',
    key: 'hostname_info.domain_without_tld',
    description: 'Domain names excluding the top-level domain suffix',
    category: FilterCategory.EVENT,
  },
  {
    label: 'HTTP Refer Domain',
    key: 'http.http_refer_info.domain',
    description:
      'Domain names or IP addresses specified in HTTP Referrer header',
    category: FilterCategory.EVENT,
    entity: FilterType.DOMAIN,
  },
  {
    key: 'http.http_refer_info.subdomain',
    label: 'HTTP Refer Subdomain',
    description: 'Subdomain portions of HTTP referrer URLs',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Referrer TLD',
    key: 'http.http_refer_info.tld',
    description: 'Top-Level Domains of HTTP referrer URLs',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Referrer Resource Path',
    key: 'http.http_refer_info.resource_path',
    description: 'Path portions of HTTP referrer URLs',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Referrer Schema',
    key: 'http.http_refer_info.scheme',
    description: 'URL schemes of HTTP referrer URLs',
    category: FilterCategory.EVENT,
  },
  {
    label: 'HTTP Refer Domain Without TLD',
    key: 'http.http_refer_info.domain_without_tld',
    description: 'Domain names excluding the top-level domain suffix',
    category: FilterCategory.EVENT,
  },
];

export function isNegatable(filter: string) {
  return !['hits_min', 'hits_max'].includes(filter);
}

export function isWildcardable(type: string) {
  return (
    QueryFilterType[type]?.match.includes('word') &&
    QueryFilterType[type]?.match.length > 1
  );
}

export const QueryFiltersRecord = QueryFilters.reduce(
  (acc, curr) => {
    acc[curr.key] = curr;
    return acc;
  },
  {} as Record<string, QueryFilterDefinition>,
);

export const CEQueryFiltersRecord = CEQueryFilters.reduce(
  (acc, curr) => {
    acc[curr.key] = curr;
    return acc;
  },
  {} as Record<string, QueryFilterDefinition>,
);
