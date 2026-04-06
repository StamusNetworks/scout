import { useState } from 'react';

import { Row } from '@/common/design-system/atoms/layout/row';
import { Markdown } from '@/common/design-system/atoms/markdown';
import { Button } from '@/common/design-system/atoms/ui/button';
import { DateTime } from '@/common/design-system/entities/date-time';
import {
  TaggedEvent,
  TimelineEventType,
  TYPE_COLOR,
  TYPE_LABEL,
} from '@/features/hunting-trail/hunting-trail.model';
import { CardEventsTable } from '@/features/hunting-trail/molecules/card-events-table';
import { CardSummary } from '@/features/hunting-trail/molecules/card-summary';

// --- Query descriptions ---

const QUERY_DESCRIPTION: Record<TimelineEventType, string> = {
  sightings:
    'New previously unseen communication artifacts, never observed before in the environment, such as a HTTP User-Agent, HTTP Servers, a domain name, a SMB file transfer, SSH software, a JA3S, a JA4 hash, TLS fingerprint, TLS SNI and so on. It can highlight unexpected communication from or to a host. It is valuable piece of metadata in a hunt as it allows to generically highlight new occurrences of communication.\n\nExample: New HTTP server detected that serves internal hosts from untrusted source.',
  hunting:
    'Advanced hunting detection from Stamus Networks exposing SMB file transfers or access with DGA naming style, punycode TLS SNI/http Hostnames or DNS DGA domains, expired TLS external certificates and similar. This advanced hunting capability allows security teams to proactively identify stealthy threats—such as command-and-control communication or **lateral movement**—that often bypass traditional perimeter defenses. By exposing subtle anomalies like DGA-based domains and punycode obfuscation, it significantly reduces attacker dwell time and prevents data breaches before they escalate.\n\nExample: A security analyst uses these detections to pinpoint a compromised workstation communicating with a malicious server through a hidden, punycode-encoded hostname that standard filters would have missed.',
  file: 'Generic file transfer identification of Executables, Scripts, Archives, DOCs, PDFs, Excel, Power Point files over HTTP/HTTP2/SMB/SMTP/FTP. This granular visibility enables hunters to monitor the movement of high-risk file types across multiple protocols, making it much easier to spot unauthorized **data exfiltration** or the delivery of malicious payloads. By centralizing these diverse transfers into a single view, security teams can quickly correlate suspicious file activity with specific users or assets to disrupt an ongoing attack.\n\nExample: A security analyst identifies a series of encrypted ZIP archives being moved over an unusual SMB share, allowing them to stop a ransomware actor during the staging phase of an attack.',
  lateral:
    'Critical lateral changes indicators over SMB/DCERPC — service creation/update/deletion, driver changes, user account modifications and similar. This level of monitoring exposes the "living off the land" techniques attackers use to establish persistence or escalate privileges by directly tracking unauthorized modifications to system services and user accounts. By alerting on these high-stakes configuration changes, hunters can intercept an adversary\'s attempt to move deeper into the network before they gain full administrative control.\n\nExample: A security analyst detects a new service being created on a domain controller via DCERPC, allowing them to instantly block a remote execution attempt by an intruder.',
  nrd: 'Newly Registered Domains detection in TLS SNI, HTTP Hostname and DNS domain name query, including with high entropy and phishing detections. By monitoring newly registered domains across TLS, HTTP, and DNS layers, security teams can intercept fresh "disposable" infrastructure that hasn\'t yet been categorized as malicious by standard threat intelligence. This multi-protocol approach ensures that even if an attacker attempts to hide their activity behind encryption or different web protocols, their reliance on new or high-entropy domains will still trigger a hunt lead.\n\nExample: A hunter identifies an employee connecting to a high-entropy domain via a TLS SNI header, revealing a sophisticated beaconing attempt that used a brand-new domain to bypass the company\'s web filter.',
  remoteAdmin:
    'Remote access via MS-RRP `OpenLocalMachine` to Windows administration consoles. Detecting remote access via the MS-RRP `OpenLocalMachine` function allows hunters to spot unauthorized administration changes, a common precursor to credential theft or system configuration tampering. This visibility is vital for identifying administrative **lateral movement** that bypasses traditional GUI-based monitoring tools by operating directly through low-level Windows remote procedures.\n\nExample: A security analyst catches an attacker remotely querying the Windows administration console to effectively stop lateral proliferation before it turns into a full-scale breach.',
  remoteRegistry:
    'Remote access via MS-RRP OpenClassesRoot (HKEY_CLASSES_ROOT) to Windows registry. Monitoring remote access and changes to the `HKEY_CLASSES_ROOT` through MS-RRP is essential for detecting sophisticated persistence mechanisms, such as COM hijacking or malicious file association changes. By flagging these low-level registry interactions, hunters can identify when an attacker is attempting to ensure their malware executes automatically whenever specific system tasks or file types are opened.\n\nExample: A security analyst discovers an external actor remotely modifying `HKEY_CLASSES_ROOT` to redirect a legitimate system call or modifying it from unexpected location or application, effectively uncovering a hidden persistence hook.',
  postExploit:
    'Attack & Response detection can highlight post exploit activity. These detection methods serve as a "safety net" by identifying when an attacker has already bypassed your perimeter and is receiving sensitive data back from a victim machine. Because they trigger on specific output (like a command shell or a system "root" check), these detections provide high-confidence indicators of an active, successful breach that requires immediate review or response.\n\nExample: A security analyst uses Attack & Response detection methods to instantly identify a successful SQL injection when they see a database server unexpectedly sending a full list of administrative usernames over an HTTP response.',
  ipDownload:
    'HTTP Downloads using raw IP addresses instead of domain names. Monitoring HTTP downloads initiated via raw IP addresses helps hunters identify automated malware delivery and command-and-control activity that bypasses DNS-based security filters and reputation checks. Since legitimate web traffic almost exclusively relies on domain names, these "naked" IP connections serve as high-fidelity indicators of suspicious, non-human activity within the network.\n\nExample: A security analyst investigates a direct IP download and discovers a hidden secondary-stage payload being pulled from a bulletproof hosting provider that had no registered domain name.',
  rawProtocol:
    'File transfers over raw TCP but not over specific application protocol such as http/http2/smb/smtp/nfs/ftp. Identifying raw TCP file transfers allows hunters to detect "living off the land" techniques and custom exfiltration tools that bypass protocol-specific inspection by tunneling data over non-standard ports. This visibility is crucial for uncovering stealthy backdoors or proprietary malware protocols that intentionally avoid common application layers like HTTP or SMB to remain invisible to traditional security filters.\n\nExample: A security analyst discovers an unusual volume of data being pushed over raw TCP port 34567, leading to the discovery of a custom-built RAT (Remote Access Trojan) exfiltrating sensitive company files.',
  userEnum:
    "SMB user enumeration, MS-SAMR SamrEnumerateUsersInDomain detections. Monitoring the `SamrEnumerateUsersInDomain` function allows hunters to detect the precise moment an attacker attempts to map out the network's user landscape for **lateral movement** or password spraying. By catching this specific RPC call, security teams can identify reconnaissance activity that often precedes a major breach, enabling them to neutralize the threat before any accounts are actually compromised.\n\nExample: A security analyst detects a suspicious host using SamrEnumerateUsersInDomain SMB function to scrape thousands of usernames and access rights.",
  powershell:
    'PowerShell specific curated detections. These detection provide critical visibility into the early stages of an attack by flagging the specific, obfuscated PowerShell techniques used by malware loaders and advanced persistent threats. By identifying behaviors like hidden windows, execution policy bypasses, and Base64-encoded payloads, hunters can intercept "fileless" attacks that often evade traditional antivirus by running purely in system memory.\n\nExample: A security analyst detects an outbound HTTP request containing a Base64-encoded script, leading to the discovery of a stealthy PowerShell stager attempting to download and execute ransomware.',
  newServers:
    'New previously unseen, never observed before, internal or remote servers communicating in the environment servers like HTTP, SSH. Monitoring for previously unseen internal or remote servers communicating via protocols like HTTP or SSH allows security teams to identify **shadow IT** and potential **command-and-control (C2)** channels that bypass traditional perimeter defenses. By establishing a baseline of "normal" connectivity, hunters can quickly isolate unauthorized assets or **lateral movement** before a data breach scales.\n\nExample: A security analyst discovers an unauthorized internal workstation suddenly transferring large volumes of data via SSH to an unfamiliar offshore IP address, signaling a likely **data exfiltration** attempt.',
  smbSightings:
    'New previously unseen, never observed before SMB file transfer or file access. Identifying previously unseen SMB file transfers or access patterns is critical for detecting **lateral movement** and unauthorized **data staging** within a network. This proactive hunting technique allows analysts to catch "low and slow" attackers who have breached the perimeter and are now probing internal file shares for sensitive intellectual property or credentials.\n\nExample: A hunt reveals a service account suddenly accessing a high-value HR file share it has never touched before, indicating a compromised account being used for internal reconnaissance.',
  torrent:
    'Torrent traffic present in the environment. Torrent traffic presence violates most network security policies and exposes the organization to malware distribution, copyright liability, and bandwidth abuse. Detecting torrent traffic within a professional environment is vital for mitigating **legal liability** and preventing the introduction of **malware** often bundled with pirated software. Since Peer-to-Peer (P2P) protocols are designed to bypass firewalls and connect to numerous untrusted hosts, monitoring for this traffic helps close security gaps that could lead to a ransomware infection or significant bandwidth exhaustion.\n\nExample: An automated alert triggers when a workstation in the finance department begins making hundreds of simultaneous outbound connections to global IP addresses over BitTorrent ports, indicating a policy violation or a compromised host.',
  tor: 'Tor traffic present in the environment. Hunting for Tor traffic within the environment is essential for identifying **anonymized communication channels** that employees or attackers may use to bypass corporate security policies and **data exfiltration** monitoring. Detecting these connections allows security teams to uncover "darknet" access, which is a significant indicator of security policy violations, potential insider threats or the presence of advanced ransomware variants that use Tor for command-and-control.\n\nExample: A hunt identifies an internal server running a Tor relay, revealing an attacker\'s attempt to establish a persistent, encrypted tunnel for smuggling stolen data out of the network.',
  smtpExe:
    'Not encrypted SMTP based detection events of suspicious executable attachments. Executable email attachments are a primary malware delivery vector. Hunting for SMTP-based suspicious executable attachments provides a critical line of defense against **initial access** attempts, such as ransomware and spyware, that bypass standard email filters. By analyzing these detection events, security teams can proactively identify targeted **phishing campaigns** and harden technical controls against evolving file-obfuscation techniques.\n\nExample: A security analyst investigates an unusual not encrypted mail with .exe file disguised as "Invoices" and identifies a new malware variant targeting the accounting department.',
  base64Encoding:
    'Detection methods highlighting network events which contain base64 encoding functions. Hunting for base64 encoding functions allows analysts to uncover **obfuscated scripts** and commands that attackers use to hide malicious payloads from signature-based security tools. By flagging these events, hunters can identify "living-off-the-land" techniques where legitimate utilities like PowerShell are leveraged to execute encrypted code or exfiltrate data covertly.\n\nExample: A hunt query identifies a PowerShell command execution containing a long base64 string that, when decoded, reveals a hidden script designed to download a remote backdoor.',
  maliciousFilenames:
    'Known malicious filenames in network payloads. Hunting for known malicious filenames within network payloads enables the immediate identification of **active compromises** and the presence of established malware toolkits traversing the environment. This technique provides a high-confidence signal for security teams to trigger **incident response** protocols, effectively stopping automated attacks that rely on standardized file-naming conventions for secondary stage downloads.\n\nExample: A network sensor flags a GET request containing the filename `mimikatz.exe`, alerting the team to an ongoing attempt to steal credentials from a compromised server.',
  suspiciousFilenames:
    "Suspicious filenames in in or outbound communication. Monitoring for these specific filenames in outbound POST requests is highly effective for detecting **infostealers** and automated **data exfiltration** of sensitive user credentials. By flagging files like `passwords.txt` or browser-specific cookie logs, security teams can pinpoint compromised endpoints that are actively shipping harvested identity data to an attacker's external server.\n\nExample: A hunt identifies an outbound connection to an unknown IP containing a zipped attachment named `Edge_Cookies.txt`, confirming that a user's browser session data has been hijacked and is being exfiltrated.",
  longDomains:
    'Long domain names. Domains with large amount of characters can be strong indicators of DNS tunneling, DGA-generated C2 domains, or **data exfiltration** encoded in DNS queries. Hunting for domain names containing large amount of characters is an effective way to identify **Domain Generation Algorithms (DGA)** and stealthy **DNS tunneling** used for command-and-control communication. These abnormally long strings often represent encoded data or unique identifiers that allow attackers to bypass traditional blacklists and maintain a persistent connection to their infrastructure.\n\nExample: A hunt query flags a workstation making repeated DNS requests to a 100-character domain like `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6.malicious-site.com`, suggesting encoded **data exfiltration**.',
  shortDomains:
    "Very short domains (≤10 characters). Hunting for unusually short domain names, particularly those under 10 characters, helps identify **brand impersonation** and **URL shortening services** used to mask malicious destinations. These concise domains are frequently used in phishing campaigns and SMSishing to create a sense of legitimacy or to hide the final payload URL from the end user.\n\nExample: A security analyst discovers a spike or a single transfer in traffic to the domain `h7b4a3l.com`, which redirects employees to a credential-harvesting page designed to look like the company's internal portal.",
  exeSightings:
    'Unencrypted executable downloads from new/previously unseen and never observed before domains. Hunting for unencrypted executable downloads from previously unseen domains is a high-fidelity method for catching **zero-day malware** and drive-by downloads before they are categorized by reputation-based filters. This approach allows security teams to identify the exact moment a device is compromised by a "fresh" threat that lacks a known signature or a history of malicious activity.\n\nExample: A security analyst identifies a host downloading a `.pdf` file containing which is actually a hidden binary from a domain never seen communication before in the network, revealing a targeted spear-phishing attack.',
  dynamicDns:
    'Dynamic DNS services. Hunting for traffic involving Dynamic DNS (DDNS) services which are frequently abused, helps identify **evasive command-and-control (C2)** infrastructure that frequently changes IP addresses to bypass static firewall blocks. By monitoring these services, security teams can pinpoint internal hosts communicating with volatile, often non-reputable domains typically favored by malware authors for their low cost and anonymity.\n\nExample: A hunt reveals an internal server making persistent outbound calls to a `duckdns.org` subdomain, leading to the discovery of a backdoor that was rotating through various compromised home IP addresses.',
  publicDns:
    "Queries to public DNS infrastructure (Google, Cloudflare, etc.). Those DNS services bypass internal DNS controls, evade DNS-based security monitoring, and may indicate DNS-over-HTTPS tunneling. Hunting for internal queries to public DNS providers helps identify **configuration gaps** and potential **DNS over HTTPS (DoH)** tunnels used by attackers to bypass internal logging and security controls. By pinpointing hosts that ignore the organization's sanctioned DNS servers, security teams can uncover hidden communication channels that might otherwise evade traditional network monitoring.\n\nExample: A hunt query reveals a workstation bypassing the corporate filter to send encrypted DNS requests to `8.8.8.8`, which was being used to resolve a hidden command-and-control server.",
  smtpUnencrypted:
    'Unencrypted SMTP communication. Hunting for unencrypted SMTP communication helps identify **sensitive data leakage** and potential credential harvesting occurring over cleartext channels that are vulnerable to interception. Monitoring these unencrypted sessions allows security teams to enforce encryption policies and detect legacy systems or misconfigured devices that are inadvertently exposing corporate secrets to the open internet.\n\nExample: A hunt reveals a legacy multi-function printer sending scanned employee tax documents to an external email address via unencrypted port 25, exposing the data to anyone monitoring the network path.',
  base64Decoding:
    'Detection methods highlighting network events which contain base64 decoding functions. Hunting for base64 decoding functions in network traffic is a powerful way to identify **evasive malware** that attempts to hide its true intent from traditional pattern-matching security tools. By focusing on these decoding activities, analysts can uncover second-stage payloads or configuration files being reconstructed in real-time by a compromised host.\n\nExample: A hunt flags an HTTP response from an external site that contains a base64-encoded string, which is immediately decoded and executed by a local script to establish a remote shell.',
  ssh: 'SSH connections from or to specific asset. SSH by itself is not a malicious indicator, however happening from or to unexpected location with unusual ssh software can be an indicator of something needing further investigation. Hunting for SSH connections to or from specific assets allows security teams to identify **unauthorized administrative access** and potential **lateral movement** targeting high-value infrastructure like database servers or domain controllers. By monitoring these connections against a known pass list, analysts can quickly detect when a compromised account is used to establish a remote terminal on a sensitive system.\n\nExample: A hunt alert triggers when a workstation in the marketing department suddenly initiates an SSH connection to a core production database, suggesting a credential theft incident.',
  longerSsh:
    'SSH sessions longer than 20 minutes. SSH by itself is not a malicious indicator, however happening from or to unexpected location with unusual ssh software can be an indicator of something needing further investigation. Hunting for SSH sessions exceeding 20 minutes helps identify **persistent remote access** and potential manual **data exfiltration** that deviates from typical administrative bursts. By isolating these long-lived connections, security teams can distinguish between standard maintenance tasks and an attacker maintaining a steady "hands-on-keyboard" presence or an active tunnel within the network.\n\nExample: A hunt query flags an SSH session from an external IP to a sensitive file server that has remained open for three hours, leading to the discovery of a live attacker manually browsing the file system.',
  rdp: 'RDP connections from or to specific asset. Hunting for RDP connections involving specific assets is crucial for identifying **unauthorized remote control** and potential **lateral movement** targeting critical servers or executive workstations. This focus allows security teams to detect "Living off the Land" attacks where legitimate administrative tools are repurposed by threat actors to navigate the network without triggering traditional malware alerts.\n\nExample: A hunt identifies an RDP session originating from a guest Wi-Fi laptop to the organization\'s primary domain controller, indicating a major security breach and an active attempt to gain administrative privileges.',
  rfbVnc:
    'RFB/VNC connections from or to specific asset. Hunting for RFB/VNC connections allows security teams to detect **unauthorized remote desktop sessions** and potential graphical **lateral movement** that bypasses text-based logging. By monitoring these specific assets, analysts can identify when an attacker is using "living-off-the-land" screen-sharing tools to manually control sensitive systems or exfiltrate data via visual interfaces.\n\nExample: A hunt flags an incoming VNC connection to a Point-of-Sale (POS) terminal from an unmanaged internal device, indicating a potential attempt to hijack the terminal for credit card skimming.',
  biggerTcp:
    'TCP connections transferring more than 10MB. Hunting for TCP connections exceeding 10MB helps identify bigger or bulk **data exfiltration** and unauthorized large-scale file transfers that could indicate a major security breach. By focusing on these high-volume flows, security teams can distinguish routine web traffic from anomalous internal backups or **data staging** activities directed toward external or unauthorized internal hosts.\n\nExample: A hunt query flags a single TCP session from a sensitive research database to an unfamiliar cloud storage IP that transferred 15GB of data overnight, signaling a likely theft of intellectual property.',
  longerTcp:
    'TCP sessions lasting longer than 20 minutes. Hunting for TCP sessions that persist for more than 20 minutes helps identify longer connections or **covert communication channels** and long-lived command-and-control (C2) heartbeats that maintain persistence within a network. This technique allows analysts to isolate anomalous, "low-and-slow" connections that may be masking remote access shells or automated data tunneling which typically avoid shorter, bursty traffic patterns.\n\nExample: A hunt query flags a persistent TCP connection between an internal web server and an unknown external IP that has been active for six hours, revealing a reverse shell used by an attacker for remote command execution.',
  biggerUdp:
    'UDP connections transferring more than 10MB. Hunting for UDP connections exceeding 10MB is essential for detecting stealthy **data exfiltration** and non-standard tunneling methods that bypass traditional TCP-based inspection. Because UDP is connectionless and often used for streaming, large transfers can hide malicious activity like **DNS tunneling** or heavy media-based payloads used to smuggle sensitive files out of the network.\n\nExample: A hunt reveals a workstation sending 50MB of UDP traffic to an external DNS server over port 53, indicating that a large database was likely chunked and exfiltrated via DNS queries.',
  longerUdp:
    'UDP sessions lasting longer than 20 minutes. Hunting for long-lived UDP sessions helps identify **persistent tunneling** and covert command-and-control (C2) channels that utilize connectionless protocols to maintain a steady link to external infrastructure. Since UDP is typically used for short-lived requests or streaming, sessions exceeding 20 minutes often indicate unauthorized **VPN usage** or persistent backdoors designed to evade standard session timeouts.\n\nExample: A hunt flags a workstation maintaining a 45-minute UDP session to a foreign IP address, revealing a hidden WireGuard tunnel used to bypass the corporate web proxy.',
  biggerIcmp:
    'ICMP flows transferring more than 1MB data. Monitoring ICMP flows that exceed 1MB helps identify potential **data exfiltration** or **command-and-control (C2) tunneling** that bypasses standard protocol filters. This investigative tactic narrows the hunt by highlighting volume-based anomalies in a protocol typically reserved for small diagnostic packets.\n\nExample: An analyst identifies a workstation sending 15MB of ICMP Echo Requests to an external IP, suggesting a "ping tunnel" is being used to smuggle sensitive files out of the network.',
  longerIcmp:
    'ICMP flows lasting longer than 20 minutes. Detecting ICMP flows that persist for longer periods of time is a powerful method for identifying **persistent communication channels** established by stealthy malware. Since ICMP is designed for short-lived diagnostic checks, an extended duration often can signal an active **covert tunnel** or a "heartbeat" beacon used to maintain a connection with a remote attacker.\n\nExample: A hunt query reveals a continuous 6-hour ICMP session between a sensitive database server and an unknown external host, indicating a persistent backdoor used for remote access.',
};

export type QueryGroup = {
  type: TimelineEventType;
  events: TaggedEvent[];
  startTime: string;
  endTime: string;
};

export const QueryCard = ({ group }: { group: QueryGroup }) => {
  const [showEvents, setShowEvents] = useState(false);
  const { type, events } = group;
  const { text, border } = TYPE_COLOR[type];

  return (
    <div className={`bg-card overflow-hidden border-l-2 ${border}`}>
      <div className="bg-muted/40 border-border flex flex-col gap-2 border-t px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className={`${text} text-[11px] font-semibold`}>
            {TYPE_LABEL[type]}
          </span>
          <span className="text-muted-foreground text-xs">
            {events.length} {events.length === 1 ? 'event' : 'events'}
          </span>
          <span className="text-muted-foreground text-xs">/</span>
          <Row className="text-muted-foreground gap-1 text-xs whitespace-nowrap">
            <DateTime date={group.startTime} />
            <span>—</span>
            <DateTime date={group.endTime} />
          </Row>
        </div>
        <Markdown
          content={QUERY_DESCRIPTION[type]}
          className="text-muted-foreground text-xs leading-relaxed"
        />
      </div>

      <div className="border-border border-t">
        {showEvents ? (
          <CardEventsTable
            type={type}
            events={events}
          />
        ) : (
          <CardSummary
            type={type}
            events={events}
          />
        )}
      </div>

      <div className="border-border border-t px-3 py-1.5">
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-xs"
          onClick={() => setShowEvents((v) => !v)}
        >
          {showEvents ? 'Show summary' : 'Show events'}
        </Button>
      </div>
    </div>
  );
};
