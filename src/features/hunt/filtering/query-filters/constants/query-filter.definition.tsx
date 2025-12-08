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

export const QueryFilters: QueryFilterDefinition[] = [
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
    category: FilterCategory.EVENT,
  },
  {
    label: 'Attacker Network',
    key: 'alert.source.net_info_agg',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Victim Network',
    key: 'alert.target.net_info_agg',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Method',
    key: 'alert.signature',
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
    category: FilterCategory.EVENT,
    toDisplayValue: (value: string) =>
      value !== '' ? value || 'Unknown' : 'Unknown',
    toQueryValue: (value: string) => (value === 'Unknown' ? '' : value),
  },
  {
    label: 'Revision',
    key: 'alert.rev',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Tagged',
    key: 'alert.tag',
    category: FilterCategory.EVENT,
  },
  {
    label: 'X-Forwarded-For',
    key: 'alert.xff',
    category: FilterCategory.EVENT,
    entity: FilterType.IP,
  },
  {
    label: 'Source Net',
    key: 'net_info.src_agg',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Event Type',
    key: 'event_type',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Data Stream Source IP',
    key: 'src_ip',
    category: FilterCategory.EVENT,
    entity: FilterType.IP,
  },
  {
    label: 'Data Stream Source Port',
    key: 'src_port',
    category: FilterCategory.EVENT,
    entity: FilterType.PORT,
    inputType: FilterInputType.NUMBER,
  },
  {
    label: 'Port',
    key: 'port',
    category: FilterCategory.EVENT,
    entity: FilterType.PORT,
    inputType: FilterInputType.NUMBER,
    validationType: FilterValidationType.POSITIVE_INT,
    toQFString: ({ value, negated }) =>
      `(${negated ? 'NOT ' : ''}(src_port: "${value}" OR dest_port: "${value}"))`,
  },
  {
    label: 'Destination Net',
    key: 'net_info.dest_agg',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Data Stream Destination IP',
    key: 'dest_ip',
    category: FilterCategory.EVENT,
    entity: FilterType.IP,
  },
  {
    label: 'Data Stream Destination Port',
    key: 'dest_port',
    category: FilterCategory.EVENT,
    entity: FilterType.PORT,
    inputType: FilterInputType.NUMBER,
  },
  {
    label: 'IP Protocol',
    key: 'proto',
    category: FilterCategory.EVENT,
    entity: FilterType.PROTO,
  },
  {
    label: 'IP Protocol',
    key: 'host_id.services.proto',
    category: FilterCategory.HOST,
    entity: FilterType.PROTO,
  },
  {
    label: 'App Protocol',
    key: 'app_proto',
    category: FilterCategory.EVENT,
    entity: FilterType.APP_PROTO,
  },
  {
    label: 'App Protocol',
    key: 'host_id.services.values.app_proto',
    category: FilterCategory.HOST,
    entity: FilterType.APP_PROTO,
  },
  {
    label: 'Original application protocol',
    key: 'app_proto_orig',
    category: FilterCategory.EVENT,
    entity: FilterType.APP_PROTO,
  },
  {
    label: 'Probe',
    key: 'host',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Network Interface',
    key: 'in_iface',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Vlan',
    key: 'vlan',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Tunnel Source IP',
    key: 'tunnel.src_ip',
    category: FilterCategory.EVENT,
    entity: FilterType.IP,
  },
  {
    label: 'Tunnel Destination IP',
    key: 'tunnel.dest_ip',
    category: FilterCategory.EVENT,
    entity: FilterType.IP,
  },
  {
    label: 'Tunnel Protocol',
    key: 'tunnel.proto',
    category: FilterCategory.EVENT,
    entity: FilterType.PROTO,
  },
  {
    label: 'Tunnel Depth',
    key: 'tunnel.depth',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Attacker IP',
    key: 'alert.source.ip',
    category: FilterCategory.EVENT,
    entity: FilterType.IP,
  },
  {
    label: 'Attacker Port',
    key: 'alert.source.port',
    category: FilterCategory.EVENT,
    entity: FilterType.PORT,
    inputType: FilterInputType.NUMBER,
  },
  {
    label: 'Victim IP',
    key: 'alert.target.ip',
    category: FilterCategory.EVENT,
    entity: FilterType.IP,
  },
  {
    label: 'Victim Port',
    key: 'alert.target.port',
    category: FilterCategory.EVENT,
    entity: FilterType.PORT,
    inputType: FilterInputType.NUMBER,
  },
  {
    label: 'Lateral movement',
    key: 'alert.lateral',
    category: FilterCategory.EVENT,
  },
  {
    label: 'FQDN Source',
    key: 'fqdn.src',
    category: FilterCategory.EVENT,
  },
  {
    label: 'FQDN Destination',
    key: 'fqdn.dest',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Queried Name',
    key: 'dns.query.rrname',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Queried Type',
    key: 'dns.query.rrtype',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Queried Name',
    key: 'dns.queries.rrname',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Queried Type',
    key: 'dns.queries.rrtype',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Flow start',
    key: 'flow.start',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Source IP',
    key: 'flow.src_ip',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Destination IP',
    key: 'flow.dest_ip',
    category: FilterCategory.EVENT,
    entity: FilterType.IP,
  },
  {
    label: 'Source Port',
    key: 'flow.src_port',
    category: FilterCategory.EVENT,
    entity: FilterType.PORT,
    inputType: FilterInputType.NUMBER,
  },
  {
    label: 'Destination Port',
    key: 'flow.dest_port',
    category: FilterCategory.EVENT,
    inputType: FilterInputType.NUMBER,
  },
  {
    label: 'Bytes to server',
    key: 'flow.bytes_toserver',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Bytes to client',
    key: 'flow.bytes_toclient',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Pkts to server',
    key: 'flow.pkts_toserver',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Pkts to client',
    key: 'flow.pkts_toclient',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Flow ID',
    key: 'flow_id',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Community ID',
    key: 'community_id',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Country',
    key: 'geoip.country_name',
    category: FilterCategory.EVENT,
  },
  {
    label: 'City',
    key: 'geoip.city_name',
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
    category: FilterCategory.EVENT,
    entity: FilterType.ASNUMBER,
  },
  {
    label: 'AS Organization',
    key: 'geoip.provider.autonomous_system_organization',
    category: FilterCategory.EVENT,
  },
  {
    label: 'HTTP Host',
    key: 'http.hostname',
    category: FilterCategory.EVENT,
    entity: FilterType.HOSTNAME,
  },
  {
    label: 'URL',
    key: 'http.url',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Status',
    key: 'http.status',
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
    category: FilterCategory.EVENT,
    entity: FilterType.USER_AGENT,
  },
  {
    label: 'HTTP User Agent',
    key: 'host_id.http.user_agent.agent',
    category: FilterCategory.HOST,
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
    category: FilterCategory.EVENT,
  },
  {
    label: 'HTTP Server',
    key: 'host_id.services.values.http.server',
    category: FilterCategory.HOST,
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
    category: FilterCategory.EVENT,
    convertible: ['host_id.services.values.tls.subject'],
  },
  {
    label: 'Subject DN',
    key: 'host_id.services.values.tls.subject',
    category: FilterCategory.HOST,
    convertible: ['tls.subject'],
  },
  {
    label: 'Issuer DN',
    key: 'tls.issuerdn',
    category: FilterCategory.EVENT,
    convertible: ['host_id.services.values.tls.issuerdn'],
  },
  {
    label: 'Issuer DN',
    key: 'host_id.services.values.tls.issuerdn',
    category: FilterCategory.HOST,
    convertible: ['tls.issuerdn'],
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
    category: FilterCategory.EVENT,
    convertible: ['host_id.tls.ja4.hash'],
  },
  {
    label: 'JA4',
    key: 'host_id.tls.ja4.hash',
    category: FilterCategory.HOST,
    convertible: ['tls.ja4'],
  },
  {
    label: 'Serial',
    key: 'tls.serial',
    category: FilterCategory.EVENT,
  },
  {
    label: 'JA3 User-Agent',
    key: 'tls.ja3.agent',
    category: FilterCategory.EVENT,
  },
  {
    label: 'JA4 User-Agent',
    key: 'tls.ja4.agent',
    category: FilterCategory.EVENT,
    convertible: ['host_id.tls.ja4.agent'],
  },
  {
    label: 'JA4 User-Agent',
    key: 'host_id.tls.ja4.agent',
    category: FilterCategory.HOST,
    convertible: ['tls.ja4.agent'],
  },
  {
    label: 'Fingerprint',
    key: 'tls.fingerprint',
    category: FilterCategory.EVENT,
    convertible: ['host_id.services.values.tls.fingerprint'],
  },
  {
    label: 'Fingerprint',
    key: 'host_id.services.values.tls.fingerprint',
    category: FilterCategory.HOST,
    convertible: ['tls.fingerprint'],
  },
  {
    label: 'JA3S',
    key: 'tls.ja3s.hash',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Version',
    key: 'tls.version',
    category: FilterCategory.EVENT,
  },
  {
    key: 'tls.cipher_suite',
    label: 'Cipher Suite',
    category: FilterCategory.EVENT,
    entity: FilterType.CIPHER,
  },
  {
    label: 'Cipher Security',
    key: 'tls.cipher_security',
    category: FilterCategory.EVENT,
  },
  {
    key: 'smtp.mail_from',
    label: 'From',
    category: FilterCategory.EVENT,
    entity: FilterType.USERNAME,
  },
  {
    key: 'smtp.rcpt_to',
    label: 'To',
    category: FilterCategory.EVENT,
    entity: FilterType.USERNAME,
  },
  {
    label: 'Client Software',
    key: 'ssh.client.software_version',
    category: FilterCategory.EVENT,
    convertible: ['host_id.ssh.client.software_version'],
  },
  {
    label: 'Client Software',
    key: 'host_id.ssh.client.software_version',
    category: FilterCategory.HOST,
    convertible: ['ssh.client.software_version'],
  },
  {
    key: 'ssh.client.proto_version',
    label: 'Client Version',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Server Software',
    key: 'ssh.server.software_version',
    category: FilterCategory.EVENT,
    convertible: ['host_id.ssh.server.software_version'],
  },
  {
    label: 'Server Software',
    key: 'host_id.ssh.server.software_version',
    category: FilterCategory.HOST,
    convertible: ['ssh.server.software_version'],
  },
  {
    label: 'Server Version',
    key: 'ssh.server.proto_version',
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
    key: 'stamus.asset',
    label: 'Entity',
    category: FilterCategory.EVENT,
    entity: FilterType.STAMUS_ASSET,
    type: 'ip',
  },
  {
    label: 'Offender',
    key: 'stamus.source',
    category: FilterCategory.EVENT,
    entity: FilterType.STAMUS_ASSET,
  },
  {
    label: 'Threat',
    key: 'stamus.threat_name',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Family',
    key: 'stamus.family_name',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Kill Chain Phase',
    key: 'stamus.kill_chain',
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
    category: FilterCategory.EVENT,
  },
  {
    label: 'Event ID',
    key: 'stamus.event_id',
    category: FilterCategory.EVENT,
  },
  {
    label: 'IP',
    key: 'ip',
    category: FilterCategory.EVENT,
    entity: FilterType.IP,
    validationType: FilterValidationType.IP,
    toQFString: ({ value, negated }) =>
      `(${negated ? 'NOT ' : ''}(src_ip: "${value}" OR dest_ip: "${value}"))`,
  },
  {
    label: 'Host IP',
    key: 'host_id.ip',
    category: FilterCategory.HOST,
    entity: FilterType.IP,
    validationType: FilterValidationType.IP,
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
    category: FilterCategory.EVENT,
    entity: FilterType.MITRE_TACTIC_ID,
  },
  {
    label: 'Mitre Technique ID',
    key: 'alert.metadata.mitre_technique_id',
    category: FilterCategory.EVENT,
    entity: FilterType.MITRE_TECHNIQUE_ID,
  },
  {
    key: 'alert.metadata.mitre_tactic_name',
    label: 'Mitre Tactic Name',
    category: FilterCategory.EVENT,
    entity: FilterType.MITRE_TACTIC_NAME,
    toDisplayValue: (value: string) => value?.replaceAll('_', ' ') || '',
  },
  {
    label: 'Mitre Technique Name',
    key: 'alert.metadata.mitre_technique_name',
    category: FilterCategory.EVENT,
    entity: FilterType.MITRE_TECHNIQUE_NAME,
    toDisplayValue: (value: string) => value?.replaceAll('_', ' ') || '',
  },
  {
    label: 'Method Severity',
    key: 'alert.metadata.signature_severity',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Attack Target',
    key: 'alert.metadata.attack_target',
    category: FilterCategory.EVENT,
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
  },
  {
    label: 'Malware Family',
    key: 'alert.metadata.malware_family',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Host Domain',
    key: 'hostname_info.domain',
    category: FilterCategory.EVENT,
    entity: FilterType.HOSTNAME,
  },
  {
    label: 'Host Subdomain',
    key: 'hostname_info.subdomain',
    category: FilterCategory.EVENT,
    toDisplayValue: (value: string) =>
      value !== '' ? value || 'Unknown' : 'Unknown',
    toQueryValue: (value: string) => (value === 'Unknown' ? '' : value),
  },
  {
    label: 'Host TLD',
    key: 'hostname_info.tld',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Host Domain Without TLD',
    key: 'hostname_info.domain_without_tld',
    category: FilterCategory.EVENT,
  },
  {
    label: 'HTTP Refer Domain',
    key: 'http.http_refer_info.domain',
    category: FilterCategory.EVENT,
    entity: FilterType.DOMAIN,
  },
  {
    key: 'http.http_refer_info.subdomain',
    label: 'HTTP Refer Subdomain',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Referrer TLD',
    key: 'http.http_refer_info.tld',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Referrer Resource Path',
    key: 'http.http_refer_info.resource_path',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Referrer Schema',
    key: 'http.http_refer_info.scheme',
    category: FilterCategory.EVENT,
  },
  {
    label: 'HTTP Refer Domain Without TLD',
    key: 'http.http_refer_info.domain_without_tld',
    category: FilterCategory.EVENT,
  },
  {
    label: 'TLS SNI',
    key: 'tls.sni',
    category: FilterCategory.EVENT,
    entity: FilterType.HOSTNAME,
  },
  {
    key: 'http.http_refer_info.host',
    label: 'HTTP Refer Host',
    category: FilterCategory.EVENT,
    entity: FilterType.HOSTNAME,
  },
  {
    label: 'SMTP Helo',
    key: 'smtp.helo',
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
    category: FilterCategory.EVENT,
  },
  {
    key: 'smb.status',
    label: 'Status',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Filename',
    key: 'smb.filename',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Share',
    key: 'smb.share',
    category: FilterCategory.EVENT,
  },
  {
    label: 'DCERPC Interface',
    key: 'smb.dcerpc.interfaces.name',
    category: FilterCategory.EVENT,
  },
  {
    label: 'ES Filter',
    key: 'es_filter',
    category: FilterCategory.EVENT,
    toQFString: ({ value, negated }) => `${negated ? 'NOT ' : ''}(${value})`,
  },
  {
    label: 'Filename',
    key: 'files.filename',
    category: FilterCategory.EVENT,
  },
  {
    label: 'SHA256',
    key: 'files.sha256',
    category: FilterCategory.EVENT,
    entity: [FilterType.SHA256, FilterType.FILE_HASH],
  },
  {
    key: 'files.mimetype',
    label: 'Mimetype',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Stored',
    key: 'files.stored',
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
  },
  {
    label: 'Services count max',
    key: 'host_id.services_count.max',
    category: FilterCategory.HOST,
    inputType: FilterInputType.NUMBER,
    validationType: FilterValidationType.POSITIVE_INT,
  },
  {
    label: 'Hostnames count min',
    key: 'host_id.hostname_count.min',
    category: FilterCategory.HOST,
    inputType: FilterInputType.NUMBER,
    validationType: FilterValidationType.POSITIVE_INT,
  },
  {
    label: 'Hostnames count max',
    key: 'host_id.hostname_count.max',
    category: FilterCategory.HOST,
    inputType: FilterInputType.NUMBER,
    validationType: FilterValidationType.POSITIVE_INT,
  }, //
  {
    label: 'TLS JA4 count min',
    key: 'host_id.tls.ja4_count.min',
    category: FilterCategory.HOST,
    inputType: FilterInputType.NUMBER,
    validationType: FilterValidationType.POSITIVE_INT,
  },
  {
    label: 'TLS JA4 count max',
    key: 'host_id.tls.ja4_count.max',
    category: FilterCategory.HOST,
    inputType: FilterInputType.NUMBER,
    validationType: FilterValidationType.POSITIVE_INT,
  },
  {
    label: 'User-Agents count min',
    key: 'host_id.http.user_agent_count.min',
    category: FilterCategory.HOST,
    inputType: FilterInputType.NUMBER,
    validationType: FilterValidationType.POSITIVE_INT,
  },
  {
    label: 'User-Agents count max',
    key: 'host_id.http.user_agent_count.max',
    category: FilterCategory.HOST,
    inputType: FilterInputType.NUMBER,
    validationType: FilterValidationType.POSITIVE_INT,
  },
  {
    label: 'Clients count min',
    key: 'host_id.ssh.client_count.min',
    category: FilterCategory.HOST,
    inputType: FilterInputType.NUMBER,
    validationType: FilterValidationType.POSITIVE_INT,
  },
  {
    label: 'Clients count max',
    key: 'host_id.ssh.client_count.max',
    category: FilterCategory.HOST,
    inputType: FilterInputType.NUMBER,
    validationType: FilterValidationType.POSITIVE_INT,
  },
  {
    label: 'Usernames count min',
    key: 'host_id.username_count.min',
    category: FilterCategory.HOST,
    inputType: FilterInputType.NUMBER,
    validationType: FilterValidationType.POSITIVE_INT,
  },
  {
    label: 'Usernames count max',
    key: 'host_id.username_count.max',
    category: FilterCategory.HOST,
    inputType: FilterInputType.NUMBER,
    validationType: FilterValidationType.POSITIVE_INT,
  },
  {
    label: 'Role',
    key: 'host_id.roles.name',
    category: FilterCategory.HOST,
    entity: FilterType.ROLE,
    toDisplayValue: (value: string) => ROLES[value as Role]?.name,
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
  {
    label: 'Sighting Entity Role',
    key: 'discovery.asset_role',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Sighting Entity',
    key: 'discovery.asset',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Sighting Entity Net',
    key: 'discovery.asset_net',
    category: FilterCategory.EVENT,
  },
  {
    label: 'Sighting Key',
    key: 'discovery.key',
    category: FilterCategory.EVENT,
  },
  {
    key: 'discovery.value',
    label: 'Sighting Value',
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
    category: FilterCategory.EVENT,
    inputType: FilterInputType.NUMBER,
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
