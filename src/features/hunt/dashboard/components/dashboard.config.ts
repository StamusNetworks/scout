export type DashboardItem = {
  i: string;
  title: string;
  weight?: number;
  format?: (value: string) => string;
};

export type DashboardPanel = {
  title: string;
  cols?: number;
  items: DashboardItem[];
  tooltip: string;
};

export const CEdashboard: Record<string, DashboardPanel> = {
  basic: {
    title: 'Basic Information',
    tooltip:
      'Core security event information including detection methods, categories, severities, and monitoring probes',
    items: [
      {
        i: 'alert.signature',
        title: 'Detection Methods',
        weight: 8,
      },
      {
        i: 'alert.category',
        title: 'Categories',
        weight: 4,
      },
      {
        i: 'alert.severity',
        title: 'Severities',
        weight: 3,
      },
      {
        i: 'host',
        title: 'Probes',
        weight: 3,
      },
    ],
  },
  metadata: {
    title: 'Metadata',
    tooltip:
      'Additional contextual information about security events including severity, targets, and threat classifications',
    items: [
      {
        i: 'alert.metadata.signature_severity',
        title: 'Signature Severities',
      },
      {
        i: 'alert.metadata.attack_target',
        title: 'Attack Targets',
      },
      {
        i: 'alert.metadata.affected_product',
        title: 'Affected Products',
      },
      {
        i: 'alert.metadata.malware_family',
        title: 'Malware Families',
      },
    ],
  },
  mitre: {
    title: 'MITRE ATT&CK Information',
    tooltip:
      'MITRE ATT&CK framework mapping showing adversary tactics and techniques used in the attack',
    items: [
      {
        i: 'alert.metadata.mitre_tactic_id',
        title: 'Tactic IDs',
      },
      {
        i: 'alert.metadata.mitre_tactic_name',
        title: 'Tactic Names',
      },
      {
        i: 'alert.metadata.mitre_technique_id',
        title: 'Technique IDs',
      },
      {
        i: 'alert.metadata.mitre_technique_name',
        title: 'Technique Names',
      },
    ],
  },
  organizational: {
    title: 'Organizational Information',
    cols: 5,
    tooltip:
      'Inventory and network information related to attack sources and targets',
    items: [
      {
        i: 'alert.source.ip',
        title: 'Attackers',
      },
      {
        i: 'alert.target.ip',
        title: 'Victims',
      },
    ],
  },
  geoip: {
    title: 'GeoIP Information',
    tooltip:
      'Geographic location data derived from IP addresses involved in security events',
    items: [
      {
        i: 'geoip.country_name',
        title: 'Country Names',
      },
      {
        i: 'geoip.city_name',
        title: 'City Names',
      },
    ],
  },
  ip: {
    title: 'IP Information',
    tooltip:
      'Network layer information including IP addresses, ports, protocols, and tunneling details',
    items: [
      {
        i: 'src_ip',
        title: 'Data Stream Source IPs',
      },
      {
        i: 'dest_ip',
        title: 'Data Stream Destinations IPs',
      },
      {
        i: 'src_port',
        title: 'Data Stream Source Ports',
      },
      {
        i: 'dest_port',
        title: 'Data Stream Destinations Ports',
      },
      {
        i: 'alert.xff',
        title: 'X-Forwarded-For',
      },
      {
        i: 'proto',
        title: 'IP Protocols',
      },
      {
        i: 'vlan',
        title: 'VLAN',
      },
      {
        i: 'tunnel.src_ip',
        title: 'Tunnel Source IPs',
      },
      {
        i: 'tunnel.dest_ip',
        title: 'Tunnel Destination IPs',
      },
      {
        i: 'tunnel.proto',
        title: 'Tunnel Protocols',
      },
      {
        i: 'tunnel.depth',
        title: 'Tunnel Depths',
      },
    ],
  },
  client_server: {
    title: 'Clients and Servers',
    cols: 5,
    tooltip:
      'Client-server communication patterns including IP addresses, ports, and application protocols',
    items: [
      {
        i: 'flow.src_ip',
        title: 'Source IPs',
      },
      {
        i: 'flow.dest_ip',
        title: 'Destination IPs',
      },
      {
        i: 'flow.src_port',
        title: 'Source Ports',
      },
      {
        i: 'flow.dest_port',
        title: 'Destination Ports',
      },
      {
        i: 'app_proto',
        title: 'App Protocols',
      },
    ],
  },
  http: {
    title: 'HTTP Information',
    tooltip:
      'HTTP protocol details including hostnames, URLs, status codes, and client information',
    cols: 4,
    items: [
      {
        i: 'http.hostname',
        title: 'Hostnames',
        weight: 4,
      },
      {
        i: 'http.url',
        title: 'URLs',
        weight: 4,
      },
      {
        i: 'http.status',
        title: 'Statuses',
        weight: 2,
      },
      {
        i: 'http.http_refer',
        title: 'Referrers',
        weight: 4,
      },
      {
        i: 'http.http_user_agent',
        title: 'Useragents',
        weight: 6,
      },
      {
        i: 'http.server',
        title: 'Server',
      },
    ],
  },
  dns: {
    title: 'DNS Information',
    tooltip:
      'Domain Name System queries and responses including domain names and record types',
    items: [
      {
        i: 'dns.query.rrname',
        title: 'Names',
      },
      {
        i: 'dns.query.rrtype',
        title: 'Types',
      },
    ],
  },
  tls: {
    title: 'TLS Information',
    cols: 3,
    tooltip:
      'Transport Layer Security details including certificates, fingerprints, and client identification',
    items: [
      {
        i: 'tls.sni',
        title: 'Server Names Indication',
      },
      {
        i: 'tls.subject',
        title: 'Subject DNs',
      },
      {
        i: 'tls.issuerdn',
        title: 'Issuer DNs',
      },
      {
        i: 'tls.fingerprint',
        title: 'Fingerprints',
      },
      {
        i: 'tls.ja4',
        title: 'JA4 fingerprints',
      },
      {
        i: 'tls.ja3.hash',
        title: 'JA3 Hashes',
      },
      {
        i: 'tls.ja3.agent',
        title: 'JA3 User-Agents',
      },
      {
        i: 'tls.ja3s.hash',
        title: 'JA3S Hashes',
      },
    ],
  },
  smtp: {
    title: 'SMTP Information',
    tooltip:
      'Simple Mail Transfer Protocol details including sender, recipient, and server information',
    items: [
      {
        i: 'smtp.mail_from',
        title: 'Mail From',
      },
      {
        i: 'smtp.rcpt_to',
        title: 'RCPT To',
      },
      {
        i: 'smtp.helo',
        title: 'Helo',
      },
    ],
  },
  smb: {
    title: 'SMB Information',
    tooltip:
      'Server Message Block protocol details including commands, file access, and network shares',
    items: [
      {
        i: 'smb.command',
        title: 'Commands',
      },
      {
        i: 'smb.status',
        title: 'Statuses',
      },
      {
        i: 'smb.filename',
        title: 'Filenames',
      },
      {
        i: 'smb.share',
        title: 'Shares',
      },
    ],
  },
  ssh: {
    title: 'SSH Information',
    tooltip:
      'Secure Shell protocol details including client and server software versions',
    cols: 4,
    items: [
      {
        i: 'ssh.client.software_version',
        title: 'Client Software',
      },
      {
        i: 'ssh.client.proto_version',
        title: 'Client Version',
      },
      {
        i: 'ssh.server.software_version',
        title: 'Server Software',
      },
      {
        i: 'ssh.server.proto_version',
        title: 'Server Version',
      },
      {
        i: 'ssh.client.hassh.hash',
        weight: 12,
        title: 'Client Hassh Hash',
      },
      {
        i: 'ssh.server.hassh.hash',
        weight: 12,
        title: 'Server Hassh Hash',
      },
      {
        i: 'ssh.client.hassh.string',
        weight: 12,
        title: 'Client Hassh String',
      },
      {
        i: 'ssh.server.hassh.string',
        weight: 12,
        title: 'Server Hassh String',
      },
    ],
  },
  fileinfo: {
    title: 'File Info',
    tooltip:
      'Information about files transferred or accessed during network communications',
    cols: 2,
    items: [
      {
        i: 'files.filename',
        weight: 6,
        title: 'Filename',
      },
      {
        i: 'files.mimetype',
        weight: 4,
        title: 'Mimetype',
      },
      {
        i: 'files.sha256',
        title: 'Sha256',
      },
      {
        i: 'files.state',
        title: 'State',
      },
    ],
  },
} as const;

export const dashboard: Record<string, DashboardPanel> = {
  basic: CEdashboard.basic,
  stamus: {
    title: 'Stamus Threat Information',
    tooltip:
      'Advanced threat intelligence and entity information provided by Stamus Networks',
    items: [
      {
        i: 'stamus.asset',
        title: 'Entities',
      },
      {
        i: 'stamus.source',
        title: 'Offenders',
      },
      {
        i: 'stamus.threat_name',
        title: 'Threats',
      },
      {
        i: 'stamus.family_name',
        title: 'Families',
      },
      {
        i: 'stamus.kill_chain',
        title: 'Kill Chain Phases',
      },
      {
        i: 'stamus.incidents_id',
        title: 'Incident IDs',
      },
    ],
  },
  discovery: {
    title: 'Sightings Information',
    cols: 5,
    tooltip:
      'Entity discovery and network reconnaissance data from passive monitoring',
    items: [
      {
        i: 'discovery.asset_role',
        title: 'Entity Role',
      },
      {
        i: 'discovery.asset',
        title: 'Entity',
      },
      {
        i: 'discovery.asset_net',
        title: 'Entity Net',
      },
      {
        i: 'discovery.key',
        title: 'Key',
      },
      {
        i: 'discovery.value',
        title: 'Value',
      },
    ],
  },
  hostname_info: {
    title: 'FQDN breakdown for HTTP, TLS and DNS',
    cols: 5,
    tooltip:
      'Detailed breakdown of Fully Qualified Domain Names into their constituent parts',
    items: [
      {
        i: 'hostname_info.subdomain',
        title: 'Subdomain',
      },
      {
        i: 'hostname_info.domain',
        title: 'Domains',
      },
      {
        i: 'hostname_info.tld',
        title: 'TLD',
      },
      {
        i: 'hostname_info.domain_without_tld',
        title: 'Domain Without TLD',
      },
      {
        i: 'hostname_info.host',
        title: 'Host',
      },
    ],
  },
  metadata: CEdashboard.metadata,
  mitre: CEdashboard.mitre,
  organizational: {
    ...CEdashboard.organizational,
    items: [
      ...CEdashboard.organizational.items,
      {
        i: 'alert.lateral',
        title: 'Laterals',
      },
      {
        i: 'alert.source.net_info_agg',
        title: 'Offender Networks',
      },
      {
        i: 'alert.target.net_info_agg',
        title: 'Victim Networks',
      },
      {
        i: 'fqdn.src',
        title: 'FQDN Sources',
      },
      {
        i: 'fqdn.dest',
        title: 'FQDN Destinations',
      },
    ],
  },
  geoip: {
    ...CEdashboard.geoip,
    items: [
      ...CEdashboard.geoip.items,
      {
        i: 'geoip.provider.autonomous_system_number',
        title: 'AS Numbers',
      },
      {
        i: 'geoip.provider.autonomous_system_organization',
        title: 'AS Organizations',
      },
    ],
  },
  ip: CEdashboard.ip,
  client_server: CEdashboard.client_server,
  http: {
    ...CEdashboard.http,
    items: [
      ...CEdashboard.http.items,
      {
        i: 'http.http_refer_info.host',
        title: 'Referrer Hosts',
      },
      {
        i: 'http.http_refer_info.subdomain',
        title: 'Referrer Subdomains',
      },
      {
        i: 'http.http_refer_info.resource_path',
        title: 'Referrer Resource Paths',
      },
      {
        i: 'http.http_refer_info.domain',
        title: 'Referrer Domains',
      },
      {
        i: 'http.http_refer_info.scheme',
        title: 'Referrer Schemas',
      },
      {
        i: 'http.http_refer_info.tld',
        title: 'Referrer TLDs',
      },
      {
        i: 'http.http_refer_info.domain_without_tld',
        title: 'Referrer Domains Without TLD',
      },
    ],
  },
  dns: CEdashboard.dns,
  tls: {
    ...CEdashboard.tls,
    items: [
      ...CEdashboard.tls.items,
      {
        i: 'tls.version',
        title: 'Version',
      },
      {
        i: 'tls.cipher_suite',
        title: 'Cipher Suite',
      },
      {
        i: 'tls.cipher_security',
        title: 'Cipher Security',
      },
      {
        i: 'tls.alpn_tc',
        title: 'Proposed Protocols',
      },
    ],
  },
  smtp: CEdashboard.smtp,
  smb: {
    ...CEdashboard.smb,
    items: [
      ...CEdashboard.smb.items.slice(0, 2),
      {
        i: 'smb.dcerpc.interfaces.name',
        title: 'DCERPC Interfaces',
      },
      {
        i: 'smb.dcerpc.endpoint',
        title: 'DCERPC Endpoints',
      },
      ...CEdashboard.smb.items.slice(2),
    ],
  },
  ssh: CEdashboard.ssh,
  file: CEdashboard.fileinfo,
} as const;
