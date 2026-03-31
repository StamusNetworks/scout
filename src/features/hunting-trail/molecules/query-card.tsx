import { useState } from 'react';

import { Row } from '@/common/design-system/atoms/layout/row';
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
    'First-seen assets signal new devices or services appearing on the network. Unauthorized or unexpected assets may indicate shadow IT, rogue devices, or an attacker establishing a foothold.',
  hunting:
    'Lower-confidence hunting signals from Stamus detection methods. While individually inconclusive, clusters of these events on the same host often reveal reconnaissance or early-stage intrusion activity.',
  file: 'Executable files or DGA-named files transferred over the wire suggest malware delivery, lateral movement payloads, or data staging for exfiltration.',
  lateral:
    'Critical lateral movement indicators — service/driver changes, user account modifications — signal an attacker expanding their foothold across the network.',
  nrd: 'Newly registered domains are disproportionately used for phishing, C2 infrastructure, and malware distribution. Communication with NRDs warrants immediate review.',
  remoteAdmin:
    'Remote access to Windows administration consoles can indicate unauthorized remote control, privilege escalation, or an attacker managing compromised hosts.',
  remoteRegistry:
    'Remote registry access to HKEY_CLASSES_ROOT enables persistence mechanisms, file association hijacking, or COM object manipulation — common post-exploitation techniques.',
  postExploit:
    'Attack response signatures indicate an exploit that actually succeeded, not just an attempt. These events should be treated as confirmed compromises requiring immediate investigation.',
  ipDownload:
    'Downloads using raw IP addresses instead of domain names bypass DNS-based security controls and are a strong indicator of malware callbacks or payload retrieval.',
  rawProtocol:
    'File transfers over raw TCP — bypassing HTTP, SMB, or other application protocols — may indicate covert data exfiltration or custom C2 channels.',
  userEnum:
    'SMB user enumeration is a reconnaissance technique used to identify valid accounts before credential stuffing, password spraying, or privilege escalation attacks.',
  powershell:
    'PowerShell is the most abused living-off-the-land tool — used for fileless malware, credential theft, lateral movement, and persistence. Any unexpected PowerShell network activity is high-priority.',
  newServers:
    'Previously unseen servers (HTTP, SSH, etc.) may indicate compromised hosts running unauthorized services, backdoors, or attacker-deployed infrastructure.',
  smbSightings:
    'New SMB file access or transfer patterns can indicate data theft, ransomware staging, or lateral movement through network shares.',
  torrent:
    'Torrent traffic violates most network policies and exposes the organization to malware distribution, copyright liability, and bandwidth abuse.',
  smtpExe:
    'Executable email attachments are a primary malware delivery vector. Suspicious executables over SMTP likely represent phishing payloads or worm propagation.',
  base64Encoding:
    'Base64 encoding in network traffic often indicates obfuscated commands, encoded payloads, or data being prepared for exfiltration through covert channels.',
  maliciousFilenames:
    'Known malicious filenames in network payloads indicate active malware delivery or execution attempts using well-documented attack tools.',
  suspiciousFilenames:
    'Filenames commonly associated with malware — PowerShell scripts, suspicious archives, cached browser exploits — warrant investigation even when not yet confirmed malicious.',
  longDomains:
    'Domains with 70+ characters are strong indicators of DNS tunneling, DGA-generated C2 domains, or data exfiltration encoded in DNS queries.',
  shortDomains:
    'Very short domains (≤10 characters) can indicate domain generation algorithms, fast-flux infrastructure, or purpose-built C2 domains designed to evade reputation filters.',
  exeSightings:
    'Executable downloads from newly observed domains or over cleartext HTTP bypass code-signing and HTTPS inspection, indicating potential malware delivery.',
  dynamicDns:
    'Dynamic DNS services are heavily abused for C2 infrastructure, phishing sites, and malware distribution because they provide free, rapidly changeable domain resolution.',
  tor: 'Tor traffic may indicate data exfiltration, ransomware C2 communication, or a compromised host being used as a relay. It also represents a policy violation in most environments.',
  publicDns:
    'Queries to public DNS infrastructure (Google, Cloudflare, etc.) bypass internal DNS controls, evade DNS-based security monitoring, and may indicate DNS-over-HTTPS tunneling.',
  smtpUnencrypted:
    'Unencrypted SMTP exposes email content, credentials, and attachments to network interception. It may also indicate misconfigured mail servers or downgrade attacks.',
  base64Decoding:
    'Base64 decoding functions in network payloads suggest execution of obfuscated malicious code — a hallmark of exploit kits, web shells, and fileless malware.',
  ssh: 'SSH connections from or to this asset. SSH is commonly used for remote administration but can also be leveraged for tunneling, lateral movement, or unauthorized access.',
  longerSsh:
    'SSH sessions longer than 20 minutes may indicate interactive shell access, persistent tunnels, or long-running data transfers that warrant investigation.',
  rdp: 'RDP connections from or to this asset. RDP is a frequent target for brute-force attacks and is commonly abused for lateral movement and unauthorized remote access.',
  rfbVnc:
    'RFB/VNC connections from or to this asset. VNC provides full remote desktop control and is often used by attackers after initial compromise for hands-on-keyboard access.',
  biggerTcp:
    'TCP connections transferring more than 10MB with bidirectional traffic may indicate large file transfers, data exfiltration, or bulk data staging.',
  longerTcp:
    'TCP sessions lasting longer than 20 minutes may indicate persistent C2 channels, long-running data exfiltration, or interactive remote access sessions.',
  biggerUdp:
    'UDP connections transferring more than 10MB with bidirectional traffic may indicate covert data exfiltration, DNS tunneling, or media streaming used to mask malicious activity.',
  longerUdp:
    'UDP sessions lasting longer than 20 minutes may indicate persistent tunnels, VPN connections, or long-running covert communication channels.',
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
        <p className="text-muted-foreground text-xs leading-relaxed">
          {QUERY_DESCRIPTION[type]}
        </p>
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
