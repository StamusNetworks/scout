export type DashboardItem = {
  i: string;
  title: string;
  weight?: number;
  format?: (value: string) => string;
  tooltip: string;
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
        tooltip: 'Detection methods that triggered the alerts',
      },
      {
        i: 'alert.category',
        title: 'Categories',
        weight: 4,
        tooltip: 'Classification categories for security events',
      },
      {
        i: 'alert.severity',
        title: 'Severities',
        weight: 3,
        tooltip:
          'Alert severity levels: Severe (1), Suspicious (2), Contextual (3). Severity level 1 (Severe) is assigned by default if not specified in the detection method',
        format: (value: string) => {
          switch (value) {
            case '1':
              return 'Severe';
            case '2':
              return 'Suspicious';
            case '3':
              return 'Contextual';
            default:
              return value;
          }
        },
      },
      {
        i: 'host',
        title: 'Probes',
        weight: 3,
        tooltip: 'Stamus Networks probes and sensors that detected the events',
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
        tooltip:
          'Severity levels assigned to detection methods by threat intelligence sources',
      },
      {
        i: 'alert.metadata.attack_target',
        title: 'Attack Targets',
        tooltip: 'Types of systems or services targeted by the attack',
      },
      {
        i: 'alert.metadata.affected_product',
        title: 'Affected Products',
        tooltip: 'Software products or services affected by the security event',
      },
      {
        i: 'alert.metadata.malware_family',
        title: 'Malware Families',
        tooltip:
          'Classification of malware into known families based on behavior, characteristics and threat intelligence',
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
        tooltip:
          'MITRE ATT&CK tactic identifiers. See the whole list of tactics at https://attack.mitre.org/tactics/enterprise/',
      },
      {
        i: 'alert.metadata.mitre_tactic_name',
        title: 'Tactic Names',
        tooltip:
          'Human-readable names of MITRE ATT&CK tactics describing adversary goals',
      },
      {
        i: 'alert.metadata.mitre_technique_id',
        title: 'Technique IDs',
        tooltip:
          'MITRE ATT&CK technique identifiers. See the whole list of techniques at https://attack.mitre.org/techniques/enterprise/',
      },
      {
        i: 'alert.metadata.mitre_technique_name',
        title: 'Technique Names',
        tooltip:
          'Human-readable names of MITRE ATT&CK techniques describing specific attack methods',
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
        tooltip:
          'IP addresses identified as sources of malicious activity. Might be reversed depending on the detection method. Client IPs is a better indicator for this field',
      },
      {
        i: 'alert.target.ip',
        title: 'Victims',
        tooltip:
          'IP addresses identified as targets of attacks. Might be reversed depending on the detection method. Server IPs is a better indicator for this field',
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
        tooltip: 'Countries associated with IP addresses in security events',
      },
      {
        i: 'geoip.city_name',
        title: 'City Names',
        tooltip: 'Cities associated with IP addresses in security events',
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
        tooltip: 'Source IP addresses in network communications',
      },
      {
        i: 'dest_ip',
        title: 'Data Stream Destinations IPs',
        tooltip: 'Destination IP addresses in network communications',
      },
      {
        i: 'src_port',
        title: 'Data Stream Source Ports',
        tooltip: 'Source port numbers used in network connections',
      },
      {
        i: 'dest_port',
        title: 'Data Stream Destinations Ports',
        tooltip: 'Destination port numbers used in network connections',
      },
      {
        i: 'alert.xff',
        title: 'X-Forwarded-For',
        tooltip:
          'Original client IP addresses when traffic passes through proxies or load balancers',
      },
      {
        i: 'proto',
        title: 'IP Protocols',
        tooltip: 'Internet Protocol types',
      },
      {
        i: 'vlan',
        title: 'VLAN',
        tooltip: 'Virtual LAN identifiers for network segmentation',
      },
      {
        i: 'tunnel.src_ip',
        title: 'Tunnel Source IPs',
        tooltip: 'Source IP addresses in tunneled network traffic',
      },
      {
        i: 'tunnel.dest_ip',
        title: 'Tunnel Destination IPs',
        tooltip: 'Destination IP addresses in tunneled network traffic',
      },
      {
        i: 'tunnel.proto',
        title: 'Tunnel Protocols',
        tooltip: 'Protocols used for network tunneling',
      },
      {
        i: 'tunnel.depth',
        title: 'Tunnel Depths',
        tooltip: 'Number of nested tunnel layers in the network traffic',
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
        tooltip: 'IP addresses of clients initiating connections',
      },
      {
        i: 'flow.dest_ip',
        title: 'Destination IPs',
        tooltip: 'IP addresses of servers receiving connections',
      },
      {
        i: 'flow.src_port',
        title: 'Source Ports',
        tooltip: 'Port numbers used by clients for outbound connections',
      },
      {
        i: 'flow.dest_port',
        title: 'Destination Ports',
        tooltip: 'Port numbers on servers accepting incoming connections',
      },
      {
        i: 'app_proto',
        title: 'App Protocols',
        tooltip: 'Application layer protocols',
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
        tooltip: 'Domain names accessed in HTTP requests',
      },
      {
        i: 'http.url',
        title: 'URLs',
        weight: 4,
        tooltip: 'Complete URLs requested in HTTP traffic',
      },
      {
        i: 'http.status',
        title: 'Statuses',
        weight: 2,
        tooltip: 'HTTP response status codes',
      },
      {
        i: 'http.http_refer',
        title: 'Referrers',
        weight: 4,
        tooltip: 'URLs that referred users to the current page',
      },
      {
        i: 'http.http_user_agent',
        title: 'Useragents',
        weight: 6,
        tooltip: 'Browser and client application identifiers',
      },
      {
        i: 'http.server',
        title: 'Server',
        tooltip: 'Web server software and version information',
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
        tooltip: 'Domain names queried in DNS requests',
      },
      {
        i: 'dns.query.rrtype',
        title: 'Types',
        tooltip: 'DNS record types',
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
        tooltip:
          'Domain names specified in TLS Server Name Indication extension',
      },
      {
        i: 'tls.subject',
        title: 'Subject DNs',
        tooltip: 'Distinguished Names of certificate subjects',
      },
      {
        i: 'tls.issuerdn',
        title: 'Issuer DNs',
        tooltip: 'Distinguished Names of certificate issuers',
      },
      {
        i: 'tls.fingerprint',
        title: 'Fingerprints',
        tooltip: 'Unique cryptographic fingerprints of TLS certificates',
      },
      {
        i: 'tls.ja4',
        title: 'JA4 Hashes',
        tooltip: 'JA4 fingerprints for TLS client and server identification',
      },
      {
        i: 'tls.ja3.hash',
        title: 'JA3 Hashes',
        tooltip:
          'JA3 fingerprints for TLS client identification based on handshake parameters',
      },
      {
        i: 'tls.ja3.agent',
        title: 'JA3 User-Agents',
        tooltip: 'User-Agent strings associated with JA3 fingerprints',
      },
      {
        i: 'tls.ja3s.hash',
        title: 'JA3S Hashes',
        tooltip:
          'JA3S fingerprints for TLS server identification based on handshake parameters',
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
        tooltip: 'Email addresses specified in SMTP MAIL FROM commands',
      },
      {
        i: 'smtp.rcpt_to',
        title: 'RCPT To',
        tooltip: 'Email addresses specified in SMTP RCPT TO commands',
      },
      {
        i: 'smtp.helo',
        title: 'Helo',
        tooltip:
          'Domain names or IP addresses specified in SMTP HELO/EHLO commands',
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
        tooltip: 'SMB protocol commands executed',
      },
      {
        i: 'smb.status',
        title: 'Statuses',
        tooltip: 'SMB operation status codes and results',
      },
      {
        i: 'smb.filename',
        title: 'Filenames',
        tooltip: 'Names of files accessed through SMB protocol',
      },
      {
        i: 'smb.share',
        title: 'Shares',
        tooltip: 'Network share names accessed through SMB protocol',
      },
    ],
  },
  ssh: {
    title: 'SSH Information',
    tooltip:
      'Secure Shell protocol details including client and server software versions',
    items: [
      {
        i: 'ssh.client.software_version',
        title: 'Client Software',
        tooltip: 'SSH client software names and versions',
      },
      {
        i: 'ssh.client.proto_version',
        title: 'Client Version',
        tooltip: 'SSH protocol versions supported by clients',
      },
      {
        i: 'ssh.server.software_version',
        title: 'Server Software',
        tooltip: 'SSH server software names and versions',
      },
      {
        i: 'ssh.server.proto_version',
        title: 'Server Version',
        tooltip: 'SSH protocol versions supported by servers',
      },
    ],
  },
  fileinfo: {
    title: 'File Info',
    tooltip:
      'Information about files transferred or accessed during network communications',
    items: [
      {
        i: 'fileinfo.filename',
        title: 'Filename',
        tooltip: 'Names of files transferred or accessed',
      },
      {
        i: 'fileinfo.mimetype',
        title: 'Mimetype',
        tooltip: 'MIME types indicating file content types',
      },
      {
        i: 'fileinfo.gaps',
        title: 'Gaps',
        tooltip: 'Indicates if there were gaps in file data capture',
      },
      {
        i: 'fileinfo.sha256',
        title: 'Sha256',
        tooltip:
          'SHA-256 cryptographic hashes of file contents for integrity verification',
      },
      {
        i: 'fileinfo.type',
        title: 'Type',
        tooltip: 'File type classifications based on content analysis',
      },
      {
        i: 'fileinfo.tx_id',
        title: 'Tx ID',
        tooltip: 'Transaction identifiers linking files to network sessions',
      },
      {
        i: 'fileinfo.sid',
        title: 'SID',
        tooltip: 'Session identifiers for file transfer sessions',
      },
      {
        i: 'fileinfo.state',
        title: 'State',
        tooltip: 'File transfer states',
      },
      {
        i: 'fileinfo.size',
        title: 'Size',
        tooltip: 'File sizes in bytes',
      },
      {
        i: 'fileinfo.stored',
        title: 'Stored',
        tooltip: 'Indicates whether files were stored for analysis',
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
        tooltip: 'Entities identified by Stamus threat intelligence',
      },
      {
        i: 'stamus.source',
        title: 'Offenders',
        tooltip:
          'Threat actors and malicious sources identified by Stamus intelligence',
      },
      {
        i: 'stamus.threat_name',
        title: 'Threats',
        tooltip:
          'Named threats and attack campaigns identified by Stamus intelligence',
      },
      {
        i: 'stamus.family_name',
        title: 'Families',
        tooltip:
          'Malware and threat families classified by Stamus intelligence',
      },
      {
        i: 'stamus.kill_chain',
        title: 'Kill Chain Phases',
        tooltip: 'Cyber kill chain phases mapped by Stamus threat analysis',
      },
      {
        i: 'stamus.incidents_id',
        title: 'Incident IDs',
        tooltip: 'Unique identifiers for security incidents tracked by Stamus',
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
        tooltip: 'Roles assigned to discovered network entities',
      },
      {
        i: 'discovery.asset',
        title: 'Entity',
        tooltip: 'Network assets discovered through passive monitoring',
      },
      {
        i: 'discovery.asset_net',
        title: 'Entity Net',
        tooltip: 'Network segments where entities were discovered',
      },
      {
        i: 'discovery.key',
        title: 'Key',
        tooltip: 'Discovery attribute keys',
      },
      {
        i: 'discovery.value',
        title: 'Value',
        tooltip: 'Discovery attribute values corresponding to the keys',
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
        tooltip: 'Subdomain portions of FQDNs',
      },
      {
        i: 'hostname_info.domain',
        title: 'Domains',
        tooltip: 'Complete domain names including TLD',
      },
      {
        i: 'hostname_info.tld',
        title: 'TLD',
        tooltip: 'Top-Level Domains',
      },
      {
        i: 'hostname_info.domain_without_tld',
        title: 'Domain Without TLD',
        tooltip: 'Domain names excluding the top-level domain suffix',
      },
      {
        i: 'hostname_info.host',
        title: 'Host',
        tooltip: 'Complete hostname including subdomain and domain',
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
        tooltip:
          'Lateral movement indicators showing internal network traversal attempts',
      },
      {
        i: 'alert.source.net_info_agg',
        title: 'Offender Networks',
        tooltip: 'Network information aggregated for attack source addresses',
      },
      {
        i: 'alert.target.net_info_agg',
        title: 'Victim Networks',
        tooltip: 'Network information aggregated for attack target addresses',
      },
      {
        i: 'fqdn.src',
        title: 'FQDN Sources',
        tooltip:
          'Fully Qualified Domain Names associated with source addresses',
      },
      {
        i: 'fqdn.dest',
        title: 'FQDN Destinations',
        tooltip:
          'Fully Qualified Domain Names associated with destination addresses',
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
        tooltip:
          'Autonomous System Numbers identifying internet service providers and organizations',
      },
      {
        i: 'geoip.provider.autonomous_system_organization',
        title: 'AS Organizations',
        tooltip: 'Organizations that own and operate the Autonomous Systems',
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
        tooltip: 'Host portions of HTTP referrer URLs',
      },
      {
        i: 'http.http_refer_info.subdomain',
        title: 'Referrer Subdomains',
        tooltip: 'Subdomain portions of HTTP referrer URLs',
      },
      {
        i: 'http.http_refer_info.resource_path',
        title: 'Referrer Resource Paths',
        tooltip: 'Path portions of HTTP referrer URLs',
      },
      {
        i: 'http.http_refer_info.domain',
        title: 'Referrer Domains',
        tooltip: 'Domain portions of HTTP referrer URLs',
      },
      {
        i: 'http.http_refer_info.scheme',
        title: 'Referrer Schemas',
        tooltip: 'URL schemes of HTTP referrer URLs',
      },
      {
        i: 'http.http_refer_info.tld',
        title: 'Referrer TLDs',
        tooltip: 'Top-Level Domains of HTTP referrer URLs',
      },
      {
        i: 'http.http_refer_info.domain_without_tld',
        title: 'Referrer Domains Without TLD',
        tooltip: 'Domain names without TLD suffix from HTTP referrer URLs',
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
        tooltip:
          'TLS protocol versions used in connections (1.0, 1.1, 1.2, 1.3)',
      },
      {
        i: 'tls.cipher_suite',
        title: 'Cipher Suite',
        tooltip: 'Cryptographic cipher suites negotiated in TLS handshakes',
      },
      {
        i: 'tls.cipher_security',
        title: 'Cipher Security',
        tooltip: 'Security strength classification of TLS cipher suites',
      },
      {
        i: 'tls.alpn_tc',
        title: 'Proposed Protocols',
        tooltip: 'Application protocols proposed via ALPN',
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
        tooltip:
          'Distributed Computing Environment Remote Procedure Call interface names',
      },
      {
        i: 'smb.dcerpc.endpoint',
        title: 'DCERPC Endpoints',
        tooltip: 'DCERPC service endpoints accessed through SMB connections',
      },
      ...CEdashboard.smb.items.slice(2),
    ],
  },
  ssh: CEdashboard.ssh,
  file: CEdashboard.fileinfo,
} as const;
