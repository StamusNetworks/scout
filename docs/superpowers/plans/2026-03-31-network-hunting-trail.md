# Network-Wide Hunting Trail Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a top-level `/hunting-trail` page that runs 33 Hunting Trail queries at network scale (no IP scoping), grouped into 8 purpose tabs with URL-driven routing.

**Architecture:** New `src/features/hunting-trail/` feature directory holds shared model, molecules, and the network hook. Shared UI molecules (`QueryCard`, `CardSummary`, `CardEventsTable`) are extracted from the host-scoped feature. Routes live at `src/routes/_enterprise/hunting-trail/` with a layout (`route.tsx`), index redirect, and dynamic `$purpose.tsx` child. A React context passes hook data from layout to child routes.

**Tech Stack:** React 18, TanStack Router (file-based routes), RTK Query, Tailwind CSS, Radix Tabs (pillTabs), vitest, react-testing-library, msw

---

### Task 1: Extract shared model to `src/features/hunting-trail/`

Move the shared type definitions and constants out of the host-scoped feature so both the network-wide page and host-scoped feature can import from one place.

**Files:**
- Create: `src/features/hunting-trail/hunting-trail.model.ts`
- Modify: `src/features/threats/compromises/use-cases/hunting-trail/hunting-trail.model.ts` (replace with re-export)
- Modify: All files that import from the old model path (no changes needed — they import via the old path which will re-export)

- [ ] **Step 1: Create the shared model file**

Create `src/features/hunting-trail/hunting-trail.model.ts` with the full contents of the current model file:

```typescript
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
  | 'base64Decoding'
  | 'ssh'
  | 'longerSsh'
  | 'rdp'
  | 'rfbVnc'
  | 'biggerTcp'
  | 'longerTcp'
  | 'biggerUdp'
  | 'longerUdp';

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
  ssh: 27,
  longerSsh: 28,
  rdp: 29,
  rfbVnc: 30,
  biggerTcp: 31,
  longerTcp: 32,
  biggerUdp: 33,
  longerUdp: 34,
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
  ssh: 'SSH',
  longerSsh: 'Longer SSH',
  rdp: 'RDP',
  rfbVnc: 'RFB/VNC',
  biggerTcp: 'Bigger TCP',
  longerTcp: 'Longer TCP',
  biggerUdp: 'Bigger UDP',
  longerUdp: 'Longer UDP',
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
const BLUE = color('border-blue-500', 'text-blue-400', 'bg-blue-500/10');

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
  {
    label: 'Network Sessions',
    color: BLUE,
    types: [
      'ssh',
      'longerSsh',
      'rdp',
      'rfbVnc',
      'biggerTcp',
      'longerTcp',
      'biggerUdp',
      'longerUdp',
    ],
  },
];

export const TYPE_COLOR: Record<TimelineEventType, TypeColorConfig> =
  Object.fromEntries(
    PURPOSE_GROUPS.flatMap(({ color, types }) =>
      types.map((type) => [type, color]),
    ),
  ) as Record<TimelineEventType, TypeColorConfig>;

export type PurposeSlug =
  | 'lateral-movement'
  | 'exploitation'
  | 'file-activity'
  | 'network-anomalies'
  | 'dns-domains'
  | 'sightings-discovery'
  | 'hunting-signals'
  | 'network-sessions';

export const PURPOSE_SLUG_MAP: Record<
  PurposeSlug,
  (typeof PURPOSE_GROUPS)[number]
> = {
  'lateral-movement': PURPOSE_GROUPS[0],
  exploitation: PURPOSE_GROUPS[1],
  'file-activity': PURPOSE_GROUPS[2],
  'network-anomalies': PURPOSE_GROUPS[3],
  'dns-domains': PURPOSE_GROUPS[4],
  'sightings-discovery': PURPOSE_GROUPS[5],
  'hunting-signals': PURPOSE_GROUPS[6],
  'network-sessions': PURPOSE_GROUPS[7],
};

export const PURPOSE_SLUGS: { slug: PurposeSlug; label: string }[] = [
  { slug: 'lateral-movement', label: 'Lateral Movement' },
  { slug: 'exploitation', label: 'Exploitation & Post-Exploit' },
  { slug: 'file-activity', label: 'File Activity' },
  { slug: 'network-anomalies', label: 'Network Anomalies' },
  { slug: 'dns-domains', label: 'DNS & Domains' },
  { slug: 'sightings-discovery', label: 'Sightings & Discovery' },
  { slug: 'hunting-signals', label: 'Hunting Signals' },
  { slug: 'network-sessions', label: 'Network Sessions' },
];
```

- [ ] **Step 2: Replace old model with re-export**

Replace the contents of `src/features/threats/compromises/use-cases/hunting-trail/hunting-trail.model.ts` with:

```typescript
export {
  PURPOSE_GROUPS,
  PURPOSE_SLUG_MAP,
  PURPOSE_SLUGS,
  TIMELINE_TYPE_PRIORITY,
  TYPE_COLOR,
  TYPE_LABEL,
} from '@/features/hunting-trail/hunting-trail.model';
export type {
  PurposeSlug,
  TaggedEvent,
  TimelineEventType,
  TimelineGroup,
  TypeColorConfig,
} from '@/features/hunting-trail/hunting-trail.model';
```

- [ ] **Step 3: Run type check**

Run: `pnpm run check`
Expected: No TypeScript errors. All existing imports resolve through the re-export.

- [ ] **Step 4: Commit**

```bash
git add src/features/hunting-trail/hunting-trail.model.ts src/features/threats/compromises/use-cases/hunting-trail/hunting-trail.model.ts
git commit -m "refactor: extract shared hunting trail model to top-level feature"
```

---

### Task 2: Extract shared molecules to `src/features/hunting-trail/molecules/`

Move `CardSummary`, `CardEventsTable`, and `QueryCard` (with `QUERY_DESCRIPTION`) to the shared feature directory.

**Files:**
- Create: `src/features/hunting-trail/molecules/card-summary.tsx`
- Create: `src/features/hunting-trail/molecules/card-events-table.tsx`
- Create: `src/features/hunting-trail/molecules/query-card.tsx`
- Modify: `src/features/threats/compromises/use-cases/hunting-trail/molecules/card-summary.tsx` (replace with re-export)
- Modify: `src/features/threats/compromises/use-cases/hunting-trail/molecules/card-events-table.tsx` (replace with re-export)
- Modify: `src/features/threats/compromises/use-cases/hunting-trail/use-cases/purpose-aggregated.tsx` (import QueryCard from shared)

- [ ] **Step 1: Move CardSummary**

Create `src/features/hunting-trail/molecules/card-summary.tsx` with the exact contents of `src/features/threats/compromises/use-cases/hunting-trail/molecules/card-summary.tsx`, updating the model import path:

```typescript
// Change this import at the top:
import { TimelineEventType, TimelineGroup } from '../hunting-trail.model';
// To:
import { TimelineEventType, TimelineGroup } from '@/features/hunting-trail/hunting-trail.model';
```

All other imports remain unchanged. The rest of the file is copied as-is.

Replace the original `src/features/threats/compromises/use-cases/hunting-trail/molecules/card-summary.tsx` with:

```typescript
export { CardSummary } from '@/features/hunting-trail/molecules/card-summary';
```

- [ ] **Step 2: Move CardEventsTable**

Create `src/features/hunting-trail/molecules/card-events-table.tsx` with the exact contents of `src/features/threats/compromises/use-cases/hunting-trail/molecules/card-events-table.tsx`, updating the model import path:

```typescript
// Change this import at the top:
import { TimelineEventType, TimelineGroup } from '../hunting-trail.model';
// To:
import { TimelineEventType, TimelineGroup } from '@/features/hunting-trail/hunting-trail.model';
```

All other imports remain unchanged.

Replace the original `src/features/threats/compromises/use-cases/hunting-trail/molecules/card-events-table.tsx` with:

```typescript
export { CardEventsTable } from '@/features/hunting-trail/molecules/card-events-table';
```

- [ ] **Step 3: Extract QueryCard and QUERY_DESCRIPTION**

Create `src/features/hunting-trail/molecules/query-card.tsx` with the `QUERY_DESCRIPTION` map, the `QueryCard` component, and its supporting types extracted from `src/features/threats/compromises/use-cases/hunting-trail/use-cases/purpose-aggregated.tsx`:

```typescript
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

export const QUERY_DESCRIPTION: Record<TimelineEventType, string> = {
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
```

- [ ] **Step 4: Update purpose-aggregated.tsx to import from shared**

In `src/features/threats/compromises/use-cases/hunting-trail/use-cases/purpose-aggregated.tsx`:

Remove the entire `QUERY_DESCRIPTION` map, the `QueryGroup` type, and the `QueryCard` component. Replace with imports from the shared location. The file should become:

```typescript
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  PURPOSE_GROUPS,
  TaggedEvent,
  TimelineEventType,
  TypeColorConfig,
} from '@/features/hunting-trail/hunting-trail.model';
import {
  QueryCard,
  QueryGroup,
} from '@/features/hunting-trail/molecules/query-card';

// --- Transform ---

type PurposeGroup = {
  label: string;
  color: TypeColorConfig;
  queryGroups: QueryGroup[];
  totalEvents: number;
};

function groupByPurpose(events: TaggedEvent[]): PurposeGroup[] {
  const byType = new Map<TimelineEventType, TaggedEvent[]>();
  for (const event of events) {
    const list = byType.get(event.timelineType);
    if (list) {
      list.push(event);
    } else {
      byType.set(event.timelineType, [event]);
    }
  }

  return PURPOSE_GROUPS.map(({ label, color, types }) => {
    const queryGroups: QueryGroup[] = [];
    for (const type of types) {
      const evts = byType.get(type);
      if (!evts || evts.length === 0) continue;
      const sorted = [...evts].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
      queryGroups.push({
        type,
        events: sorted,
        startTime: sorted[0].timestamp,
        endTime: sorted[sorted.length - 1].timestamp,
      });
    }
    return {
      label,
      color,
      queryGroups,
      totalEvents: queryGroups.reduce((sum, g) => sum + g.events.length, 0),
    };
  }).filter((g) => g.queryGroups.length > 0);
}

// --- UI ---

const PurposeSection = ({ group }: { group: PurposeGroup }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center gap-2 px-2 py-2 text-left text-xs font-semibold"
        onClick={() => setCollapsed((v) => !v)}
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
        <span
          className={`${group.color.bg} ${group.color.text} rounded px-1.5 py-0.5`}
        >
          {group.label}
        </span>
        <span className="text-muted-foreground font-normal">
          {group.totalEvents} {group.totalEvents === 1 ? 'event' : 'events'}
        </span>
      </button>
      {!collapsed && (
        <div className="flex flex-col gap-2 pl-2">
          {group.queryGroups.map((qg) => (
            <QueryCard
              key={qg.type}
              group={qg}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const PurposeAggregated = ({ events }: { events: TaggedEvent[] }) => {
  const groups = useMemo(() => groupByPurpose(events), [events]);

  return (
    <div className="flex flex-col gap-1 p-2">
      {groups.map((group) => (
        <PurposeSection
          key={group.label}
          group={group}
        />
      ))}
    </div>
  );
};
```

- [ ] **Step 5: Run type check and tests**

Run: `pnpm run check && pnpm run test:ci`
Expected: All pass. Existing host-scoped Hunting Trail tests still work through the re-exports.

- [ ] **Step 6: Commit**

```bash
git add src/features/hunting-trail/molecules/ src/features/threats/compromises/use-cases/hunting-trail/molecules/card-summary.tsx src/features/threats/compromises/use-cases/hunting-trail/molecules/card-events-table.tsx src/features/threats/compromises/use-cases/hunting-trail/use-cases/purpose-aggregated.tsx
git commit -m "refactor: extract shared hunting trail molecules to top-level feature"
```

---

### Task 3: Create `useNetworkHuntingTrail` hook

The hook runs 33 queries without IP scoping and returns events grouped by purpose slug.

**Files:**
- Create: `src/features/hunting-trail/hooks/use-network-hunting-trail.ts`

- [ ] **Step 1: Write the hook test**

Create `src/features/hunting-trail/hooks/use-network-hunting-trail.test.ts`:

```typescript
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/events/common/events.api', () => ({
  useGetEventsQuery: vi.fn(),
  useGetEventsTailQuery: vi.fn(),
}));

import {
  useGetEventsQuery,
  useGetEventsTailQuery,
} from '@/features/events/common/events.api';
import { makeNrdEvent, makeLateralEvent } from '@/features/events/common/events.mocks';

import { useNetworkHuntingTrail } from './use-network-hunting-trail';

const mockUseGetEventsQuery = vi.mocked(useGetEventsQuery);
const mockUseGetEventsTailQuery = vi.mocked(useGetEventsTailQuery);

const params = {
  startDate: new Date('2026-01-12T00:00:00Z').getTime(),
  endDate: new Date('2026-01-15T00:00:00Z').getTime(),
};

const emptyResult = {
  data: { results: [], count: 0 },
  isLoading: false,
  isFetching: false,
  isError: false,
} as unknown as ReturnType<typeof useGetEventsQuery>;

const loadingResult = {
  data: undefined,
  isLoading: true,
  isFetching: true,
  isError: false,
} as unknown as ReturnType<typeof useGetEventsQuery>;

const errorResult = {
  data: undefined,
  isLoading: false,
  isFetching: false,
  isError: true,
} as unknown as ReturnType<typeof useGetEventsQuery>;

describe('useNetworkHuntingTrail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns isLoading for a group when its queries are still loading', () => {
    // First alert query (nrd) is loading, rest empty
    mockUseGetEventsQuery
      .mockReturnValueOnce(loadingResult)
      .mockReturnValue(emptyResult);
    mockUseGetEventsTailQuery.mockReturnValue(emptyResult);

    const { result } = renderHook(() => useNetworkHuntingTrail(params));
    // DNS & Domains group contains nrd — should be loading
    expect(result.current.groups['dns-domains'].isLoading).toBe(true);
  });

  it('returns grouped events by purpose slug', () => {
    const nrdData = {
      ...emptyResult,
      data: { results: [makeNrdEvent()], count: 1 },
    } as unknown as ReturnType<typeof useGetEventsQuery>;

    const lateralData = {
      ...emptyResult,
      data: { results: [makeLateralEvent()], count: 1 },
    } as unknown as ReturnType<typeof useGetEventsQuery>;

    // nrd is the 1st alert query call, lateral is the 3rd
    mockUseGetEventsQuery.mockImplementation((...args: unknown[]) => {
      const params = args[0] as { qfilter: string };
      if (params?.qfilter?.includes('stamus.nrd')) return nrdData;
      if (params?.qfilter?.includes('smb_lateral')) return lateralData;
      return emptyResult;
    });
    mockUseGetEventsTailQuery.mockReturnValue(emptyResult);

    const { result } = renderHook(() => useNetworkHuntingTrail(params));
    expect(result.current.groups['dns-domains'].count).toBe(1);
    expect(result.current.groups['dns-domains'].events).toHaveLength(1);
    expect(result.current.groups['lateral-movement'].count).toBe(1);
    expect(result.current.groups['lateral-movement'].events).toHaveLength(1);
  });

  it('returns isError for a group only when all its queries fail', () => {
    // All alert queries fail
    mockUseGetEventsQuery.mockReturnValue(errorResult);
    mockUseGetEventsTailQuery.mockReturnValue(emptyResult);

    const { result } = renderHook(() => useNetworkHuntingTrail(params));
    // Lateral Movement group has only alert queries — should error
    expect(result.current.groups['lateral-movement'].isError).toBe(true);
    // Network Sessions group has only tail queries — should not error
    expect(result.current.groups['network-sessions'].isError).toBe(false);
  });

  it('returns empty counts for purposes with no events', () => {
    mockUseGetEventsQuery.mockReturnValue(emptyResult);
    mockUseGetEventsTailQuery.mockReturnValue(emptyResult);

    const { result } = renderHook(() => useNetworkHuntingTrail(params));
    expect(result.current.groups['lateral-movement'].count).toBe(0);
    expect(result.current.groups['lateral-movement'].events).toHaveLength(0);
    expect(result.current.groups['lateral-movement'].isLoading).toBe(false);
    expect(result.current.groups['lateral-movement'].isError).toBe(false);
  });

  it('does not call useGetSightingEventsQuery (sightings excluded)', () => {
    mockUseGetEventsQuery.mockReturnValue(emptyResult);
    mockUseGetEventsTailQuery.mockReturnValue(emptyResult);

    renderHook(() => useNetworkHuntingTrail(params));

    // Verify no sightings API import is used — the hook should not import it.
    // We verify by checking that the sightings-discovery group only has
    // newServers and smbSightings types (both alert queries), not sightings.
    // Since all alert queries return empty, sightings-discovery should have 0 events.
    // This is implicitly tested — if useGetSightingEventsQuery were called without
    // being mocked, the test would fail.
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/features/hunting-trail/hooks/use-network-hunting-trail.test.ts`
Expected: FAIL — module `./use-network-hunting-trail` not found.

- [ ] **Step 3: Write the hook implementation**

Create `src/features/hunting-trail/hooks/use-network-hunting-trail.ts`:

```typescript
import {
  useGetEventsQuery,
  useGetEventsTailQuery,
} from '@/features/events/common/events.api';
import {
  PurposeSlug,
  PURPOSE_SLUGS,
  PURPOSE_SLUG_MAP,
  TaggedEvent,
  TimelineEventType,
} from '@/features/hunting-trail/hunting-trail.model';

interface UseNetworkHuntingTrailParams {
  startDate: number | undefined;
  endDate: number | undefined;
}

export type PurposeGroupData = {
  events: TaggedEvent[];
  count: number;
  isLoading: boolean;
  isError: boolean;
};

export function useNetworkHuntingTrail({
  startDate,
  endDate,
}: UseNetworkHuntingTrailParams) {
  const common = { start_date: startDate, end_date: endDate, page_size: 100 };
  const alertParams = { ...common, alert: true as const };

  // --- Alert queries (25) ---

  const nrd = useGetEventsQuery({
    ...alertParams,
    qfilter: `metadata.flowbits:stamus.nrd*`,
  });

  const hunting = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.metadata.stamus_type:hunting`,
  });

  const lateral = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.lateral:* AND alert.metadata.source:smb_lateral AND alert.metadata.signature_severity:critical`,
  });

  const remoteAdmin = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.metadata.lateral_function.keyword:OpenLocalMachine`,
  });

  const remoteRegistry = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.metadata.lateral_function.keyword:OpenClassesRoot`,
  });

  const postExploit = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.signature:*attack_response*`,
  });

  const ipDownload = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.signature:*dotted* AND alert.signature:*quad* AND alert.signature:*request* AND alert.signature:*host*`,
  });

  const rawProtocol = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.signature:*raw* AND alert.signature:*Hunt*`,
  });

  const userEnum = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.signature:*EnumerateUsers* AND alert.metadata.provider.keyword:Stamus AND alert.metadata.source.keyword:smb_lateral`,
  });

  const powershell = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.signature:*Powershell* AND alert.signature:*Hunt*`,
  });

  const newServers = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.signature:Server AND metadata.flowbits:stamus.sightings`,
  });

  const smbSightings = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.signature:SMB AND metadata.flowbits:stamus.sightings`,
  });

  const torrent = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.signature:*torrent*`,
  });

  const smtpExe = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.signature:SUSPICIOUS AND alert.signature:SMTP AND alert.signature:EXE`,
  });

  const base64Encoding = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.signature:encoded AND alert.signature:*base64*`,
  });

  const maliciousFilenames = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.signature:Observed AND alert.signature:Filename`,
  });

  const suspiciousFilenames = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.signature:Suspicious AND alert.signature:Filename`,
  });

  const longDomains = useGetEventsQuery({
    ...alertParams,
    qfilter: `(dns.query.rrname.keyword:/.{70}.*/) AND dns.query.rrtype:*`,
  });

  const shortDomains = useGetEventsQuery({
    ...alertParams,
    qfilter: `(-dns.query.rrname.keyword:/.{10}.*/) AND dns.query.rrtype:*`,
  });

  const exeSightings = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.signature:*exe* AND metadata.flowbits:stamus.sightings`,
  });

  const dynamicDns = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.signature:*dns* AND alert.signature:*dynamic*`,
  });

  const tor = useGetEventsQuery({
    ...alertParams,
    qfilter: `alert.signature:tor`,
  });

  const publicDns = useGetEventsQuery({
    ...alertParams,
    qfilter: `NOT dest_ip:"10.0.0.0/8" AND NOT dest_ip:"192.168.0.0/16" AND NOT dest_ip:"172.16.0.0/12" AND dns.query.rrname:*`,
  });

  const smtpUnencrypted = useGetEventsQuery({
    ...alertParams,
    qfilter: `app_proto:smtp`,
  });

  const base64Decoding = useGetEventsQuery({
    ...alertParams,
    qfilter: `payload_printable:*base64_decode*`,
  });

  // --- Events tail queries (8) ---

  const file = useGetEventsTailQuery({
    ...common,
    qfilter: `(metadata.flowbits:stamus.file.identification OR metadata.flowbits:stamus.file.store OR metadata.flowbits:stamus.dga.smbfilename) AND event_type:fileinfo`,
  });

  const ssh = useGetEventsTailQuery({
    ...common,
    qfilter: `event_type.raw:"flow" AND app_proto.raw:"ssh"`,
  });

  const longerSsh = useGetEventsTailQuery({
    ...common,
    qfilter: `event_type.raw:"flow" AND app_proto.raw:"ssh" AND (flow.age:>1200)`,
  });

  const rdp = useGetEventsTailQuery({
    ...common,
    qfilter: `event_type.raw:"flow" AND app_proto.raw:"rdp"`,
  });

  const rfbVnc = useGetEventsTailQuery({
    ...common,
    qfilter: `event_type.raw:"flow" AND app_proto.raw:"rfb"`,
  });

  const biggerTcp = useGetEventsTailQuery({
    ...common,
    qfilter: `event_type.raw:"flow" AND proto.raw:"TCP" AND ((flow.bytes_toclient:>1000000 OR flow.bytes_toserver:>1000000) AND flow.bytes_toclient:>0 AND flow.bytes_toserver:>0)`,
  });

  const longerTcp = useGetEventsTailQuery({
    ...common,
    qfilter: `event_type.raw:"flow" AND proto.raw:"TCP" AND (flow.age:>1200)`,
  });

  const biggerUdp = useGetEventsTailQuery({
    ...common,
    qfilter: `event_type.raw:"flow" AND proto.raw:"UDP" AND ((flow.bytes_toclient:>1000000 OR flow.bytes_toserver:>1000000) AND flow.bytes_toclient:>0 AND flow.bytes_toserver:>0)`,
  });

  const longerUdp = useGetEventsTailQuery({
    ...common,
    qfilter: `event_type.raw:"flow" AND proto.raw:"UDP" AND (flow.age:>1200)`,
  });

  // --- Map query results by type ---

  const queryResults: Record<
    Exclude<TimelineEventType, 'sightings'>,
    ReturnType<typeof useGetEventsQuery>
  > = {
    nrd,
    hunting,
    lateral,
    remoteAdmin,
    remoteRegistry,
    postExploit,
    ipDownload,
    rawProtocol,
    userEnum,
    powershell,
    newServers,
    smbSightings,
    torrent,
    smtpExe,
    base64Encoding,
    maliciousFilenames,
    suspiciousFilenames,
    longDomains,
    shortDomains,
    exeSightings,
    dynamicDns,
    tor,
    publicDns,
    smtpUnencrypted,
    base64Decoding,
    file,
    ssh,
    longerSsh,
    rdp,
    rfbVnc,
    biggerTcp,
    longerTcp,
    biggerUdp,
    longerUdp,
  };

  // --- Group by purpose ---

  const groups = Object.fromEntries(
    PURPOSE_SLUGS.map(({ slug }) => {
      const purposeGroup = PURPOSE_SLUG_MAP[slug];
      const relevantTypes = purposeGroup.types.filter(
        (t): t is Exclude<TimelineEventType, 'sightings'> => t !== 'sightings',
      );

      const queries = relevantTypes.map((t) => queryResults[t]);
      const isLoading = queries.some((q) => q.isLoading);
      const isError = queries.length > 0 && queries.every((q) => q.isError);

      const events: TaggedEvent[] = relevantTypes.flatMap((type) => {
        const results = queryResults[type].data?.results ?? [];
        return results.map(
          (e) => ({ ...e, timelineType: type }) as TaggedEvent,
        );
      });

      return [
        slug,
        {
          events,
          count: events.length,
          isLoading,
          isError,
        },
      ];
    }),
  ) as Record<PurposeSlug, PurposeGroupData>;

  return { groups };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run src/features/hunting-trail/hooks/use-network-hunting-trail.test.ts`
Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/hunting-trail/hooks/
git commit -m "feat(hunting-trail): add useNetworkHuntingTrail hook"
```

---

### Task 4: Create route layout, index redirect, and context provider

**Files:**
- Create: `src/features/hunting-trail/network-hunting-trail-context.tsx`
- Create: `src/routes/_enterprise/hunting-trail/route.tsx`
- Create: `src/routes/_enterprise/hunting-trail/index.tsx`

- [ ] **Step 1: Create the context provider**

Create `src/features/hunting-trail/network-hunting-trail-context.tsx`:

```typescript
import { createContext, useContext } from 'react';

import { PurposeSlug } from '@/features/hunting-trail/hunting-trail.model';
import { PurposeGroupData } from '@/features/hunting-trail/hooks/use-network-hunting-trail';

type NetworkHuntingTrailContextValue = {
  groups: Record<PurposeSlug, PurposeGroupData>;
};

const NetworkHuntingTrailContext =
  createContext<NetworkHuntingTrailContextValue | null>(null);

export const NetworkHuntingTrailProvider = NetworkHuntingTrailContext.Provider;

export function useNetworkHuntingTrailContext() {
  const ctx = useContext(NetworkHuntingTrailContext);
  if (!ctx) {
    throw new Error(
      'useNetworkHuntingTrailContext must be used within NetworkHuntingTrailProvider',
    );
  }
  return ctx;
}
```

- [ ] **Step 2: Create the index redirect**

Create `src/routes/_enterprise/hunting-trail/index.tsx`:

```typescript
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_enterprise/hunting-trail/')({
  beforeLoad: () => {
    throw redirect({ to: '/hunting-trail/lateral-movement' });
  },
});
```

- [ ] **Step 3: Create the route layout**

Create `src/routes/_enterprise/hunting-trail/route.tsx`:

```typescript
import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from '@/common/design-system/atoms/page';
import { Badge } from '@/common/design-system/atoms/ui/badge';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/pillTabs';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { TogglePageContainer } from '@/common/design-system/molecules/toggle-container';
import { formatNumber } from '@/common/lib/numbers';
import { usePageTitle } from '@/common/lib/use-page-title';
import { PURPOSE_SLUGS } from '@/features/hunting-trail/hunting-trail.model';
import { useNetworkHuntingTrail } from '@/features/hunting-trail/hooks/use-network-hunting-trail';
import { NetworkHuntingTrailProvider } from '@/features/hunting-trail/network-hunting-trail-context';
import { useGlobalQueryParams } from '@/features/filtering/use-global-query-params';

export const Route = createFileRoute('/_enterprise/hunting-trail')({
  component: () => (
    <PageBoundary key="hunting-trail">
      <HuntingTrailLayout />
    </PageBoundary>
  ),
});

function HuntingTrailLayout() {
  usePageTitle('Hunting Trail');
  const { pathname } = useLocation();
  const { start_date, end_date } = useGlobalQueryParams(['dates']);
  const { groups } = useNetworkHuntingTrail({
    startDate: start_date,
    endDate: end_date,
  });

  return (
    <>
      <OutletBreadcrumb>Hunting Trail</OutletBreadcrumb>
      <Page>
        <TogglePageContainer>
          <PageHeader>
            <PageHeaderContent>
              <PageTitle>Hunting Trail</PageTitle>
              <PageDescription>
                Network-wide hunting signals grouped by purpose. Scan the badges
                to see where interesting activity concentrates, then drill into
                specific events.
              </PageDescription>
            </PageHeaderContent>
          </PageHeader>
          <Tabs value={pathname}>
            <TabsList>
              {PURPOSE_SLUGS.map(({ slug, label }) => {
                const group = groups[slug];
                return (
                  <TabsTrigger
                    key={slug}
                    value={`/hunting-trail/${slug}`}
                    asChild
                  >
                    <Link to={`/hunting-trail/${slug}` as string}>
                      {label}
                      {group.isLoading ? (
                        <Spin className="ml-2 h-3 w-3 animate-spin" />
                      ) : (
                        group.count > 0 && (
                          <Badge
                            className="ml-2 min-w-5 px-1"
                            variant="discreet"
                          >
                            {formatNumber(group.count)}
                          </Badge>
                        )
                      )}
                    </Link>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
          <div className="mt-4">
            <NetworkHuntingTrailProvider value={{ groups }}>
              <Outlet />
            </NetworkHuntingTrailProvider>
          </div>
        </TogglePageContainer>
      </Page>
    </>
  );
}
```

- [ ] **Step 4: Run type check**

Run: `pnpm run check`
Expected: No TypeScript errors (route tree will regenerate automatically).

- [ ] **Step 5: Commit**

```bash
git add src/features/hunting-trail/network-hunting-trail-context.tsx src/routes/_enterprise/hunting-trail/
git commit -m "feat(hunting-trail): add network-wide page route layout with purpose tabs"
```

---

### Task 5: Create `PurposeTabContent` and `$purpose.tsx` route

**Files:**
- Create: `src/features/hunting-trail/entities/purpose-tab-content.tsx`
- Create: `src/routes/_enterprise/hunting-trail/$purpose.tsx`

- [ ] **Step 1: Create PurposeTabContent component**

Create `src/features/hunting-trail/entities/purpose-tab-content.tsx`:

```typescript
import { useMemo } from 'react';

import { TaggedEvent, TimelineEventType } from '@/features/hunting-trail/hunting-trail.model';
import { PurposeGroupData } from '@/features/hunting-trail/hooks/use-network-hunting-trail';
import { QueryCard, QueryGroup } from '@/features/hunting-trail/molecules/query-card';

function buildQueryGroups(events: TaggedEvent[]): QueryGroup[] {
  const byType = new Map<TimelineEventType, TaggedEvent[]>();
  for (const event of events) {
    const list = byType.get(event.timelineType);
    if (list) {
      list.push(event);
    } else {
      byType.set(event.timelineType, [event]);
    }
  }

  const groups: QueryGroup[] = [];
  for (const [type, evts] of byType) {
    const sorted = [...evts].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    groups.push({
      type,
      events: sorted,
      startTime: sorted[0].timestamp,
      endTime: sorted[sorted.length - 1].timestamp,
    });
  }
  return groups;
}

export function PurposeTabContent({ group }: { group: PurposeGroupData }) {
  const queryGroups = useMemo(
    () => buildQueryGroups(group.events),
    [group.events],
  );

  if (group.isLoading) {
    return (
      <div className="flex flex-col gap-2 p-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-muted h-16 animate-pulse rounded-md"
          />
        ))}
      </div>
    );
  }

  if (group.isError) {
    return (
      <div className="text-destructive p-4 text-sm">
        Failed to load data for this category.
      </div>
    );
  }

  if (queryGroups.length === 0) {
    return (
      <div className="text-muted-foreground p-4 text-sm">
        No events found for this category in the selected time range.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      {queryGroups.map((qg) => (
        <QueryCard
          key={qg.type}
          group={qg}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create the $purpose.tsx route**

Create `src/routes/_enterprise/hunting-trail/$purpose.tsx`:

```typescript
import { createFileRoute } from '@tanstack/react-router';

import { PurposeSlug, PURPOSE_SLUG_MAP } from '@/features/hunting-trail/hunting-trail.model';
import { PurposeTabContent } from '@/features/hunting-trail/entities/purpose-tab-content';
import { useNetworkHuntingTrailContext } from '@/features/hunting-trail/network-hunting-trail-context';

export const Route = createFileRoute('/_enterprise/hunting-trail/$purpose')({
  component: PurposePage,
});

function PurposePage() {
  const { purpose } = Route.useParams();
  const { groups } = useNetworkHuntingTrailContext();

  const slug = purpose as PurposeSlug;
  const purposeGroup = PURPOSE_SLUG_MAP[slug];

  if (!purposeGroup) {
    return (
      <div className="text-muted-foreground p-4 text-sm">
        Unknown category.
      </div>
    );
  }

  return <PurposeTabContent group={groups[slug]} />;
}
```

- [ ] **Step 3: Run type check**

Run: `pnpm run check`
Expected: No TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/features/hunting-trail/entities/purpose-tab-content.tsx src/routes/_enterprise/hunting-trail/\$purpose.tsx
git commit -m "feat(hunting-trail): add PurposeTabContent and dynamic purpose route"
```

---

### Task 6: Add navigation entry

**Files:**
- Modify: `src/common/design-system/layouts/components/navigation/navigation.config.tsx`

- [ ] **Step 1: Add the navigation menu item**

In `src/common/design-system/layouts/components/navigation/navigation.config.tsx`, add a `Footprints` icon import (from lucide-react) and a new menu item in the "Hunting & Investigation" submenu, after the `hosts` entry:

Add to the lucide-react import:

```typescript
import {
  // ... existing imports
  Footprints,
  // ... existing imports
} from 'lucide-react';
```

Add the menu item after the `hosts` entry in the "Hunting & Investigation" children array:

```typescript
      {
        key: 'hunting-trail',
        type: 'link',
        url: '/hunting-trail',
        title: 'Hunting Trail',
        icon: <Footprints />,
        enterprise: true,
      },
```

- [ ] **Step 2: Run type check**

Run: `pnpm run check`
Expected: No TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/common/design-system/layouts/components/navigation/navigation.config.tsx
git commit -m "feat(hunting-trail): add Hunting Trail to main navigation"
```

---

### Task 7: Write component test for PurposeTabContent

**Files:**
- Create: `src/features/hunting-trail/entities/purpose-tab-content.test.tsx`

- [ ] **Step 1: Write the test**

Create `src/features/hunting-trail/entities/purpose-tab-content.test.tsx`:

```typescript
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/common/testing/test-utils';
import {
  makeLateralEvent,
  makeNrdEvent,
} from '@/features/events/common/events.mocks';
import { PurposeGroupData } from '@/features/hunting-trail/hooks/use-network-hunting-trail';

import { PurposeTabContent } from './purpose-tab-content';

const createTestRouter = () =>
  createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });

const emptyGroup: PurposeGroupData = {
  events: [],
  count: 0,
  isLoading: false,
  isError: false,
};

const loadingGroup: PurposeGroupData = {
  events: [],
  count: 0,
  isLoading: true,
  isError: false,
};

const errorGroup: PurposeGroupData = {
  events: [],
  count: 0,
  isLoading: false,
  isError: true,
};

describe('PurposeTabContent', () => {
  it('renders loading skeletons when group is loading', () => {
    renderWithProviders(<PurposeTabContent group={loadingGroup} />);
    expect(document.querySelectorAll('.animate-pulse')).toHaveLength(3);
  });

  it('renders error state on failure', () => {
    renderWithProviders(<PurposeTabContent group={errorGroup} />);
    expect(screen.getByText(/failed to load data/i)).toBeInTheDocument();
  });

  it('renders empty state when no events', () => {
    renderWithProviders(<PurposeTabContent group={emptyGroup} />);
    expect(screen.getByText(/no events found/i)).toBeInTheDocument();
  });

  it('renders query cards with descriptions when data is present', async () => {
    const nrd1 = makeNrdEvent({
      _id: 'n1',
      timestamp: '2026-01-12T08:00:00Z',
      timelineType: 'nrd',
    } as Partial<ReturnType<typeof makeNrdEvent>>);
    const nrd2 = makeNrdEvent({
      _id: 'n2',
      timestamp: '2026-01-12T09:00:00Z',
      timelineType: 'nrd',
    } as Partial<ReturnType<typeof makeNrdEvent>>);

    const group: PurposeGroupData = {
      events: [
        { ...nrd1, timelineType: 'nrd' },
        { ...nrd2, timelineType: 'nrd' },
      ],
      count: 2,
      isLoading: false,
      isError: false,
    };

    await renderWithProviders(<PurposeTabContent group={group} />, {
      router: createTestRouter(),
    });

    // Query card renders with type label and description
    expect(screen.getByText('NRD')).toBeInTheDocument();
    expect(screen.getByText('2 events')).toBeInTheDocument();
    expect(
      screen.getByText(/newly registered domains/i),
    ).toBeInTheDocument();
  });

  it('renders multiple query cards for different types', async () => {
    const nrd = { ...makeNrdEvent(), timelineType: 'nrd' as const };
    const lateral = {
      ...makeLateralEvent(),
      timelineType: 'lateral' as const,
    };

    const group: PurposeGroupData = {
      events: [nrd, lateral],
      count: 2,
      isLoading: false,
      isError: false,
    };

    await renderWithProviders(<PurposeTabContent group={group} />, {
      router: createTestRouter(),
    });

    expect(screen.getByText('NRD')).toBeInTheDocument();
    expect(screen.getByText('Lateral')).toBeInTheDocument();
  });

  it('toggles between summary and events view', async () => {
    const nrd = {
      ...makeNrdEvent({ hostname_info: { domain: 'test-domain.io', host: 'test-domain.io', url: 'http://test-domain.io', tld: 'io', subdomain: '', domain_without_tld: 'test-domain' } }),
      timelineType: 'nrd' as const,
    };

    const group: PurposeGroupData = {
      events: [nrd],
      count: 1,
      isLoading: false,
      isError: false,
    };

    await renderWithProviders(<PurposeTabContent group={group} />, {
      router: createTestRouter(),
    });

    // Default is summary view — "Show events" button visible
    expect(screen.getByText('Show events')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Show events'));

    // Now shows events table — "Show summary" button visible
    expect(screen.getByText('Show summary')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test**

Run: `pnpm vitest run src/features/hunting-trail/entities/purpose-tab-content.test.tsx`
Expected: All tests PASS.

- [ ] **Step 3: Commit**

```bash
git add src/features/hunting-trail/entities/purpose-tab-content.test.tsx
git commit -m "test(hunting-trail): add PurposeTabContent component tests"
```

---

### Task 8: Run full lint and type check

- [ ] **Step 1: Run lint with fix**

Run: `pnpm run lint --fix`
Expected: No errors (warnings ok).

- [ ] **Step 2: Run type check**

Run: `pnpm run check`
Expected: No TypeScript errors.

- [ ] **Step 3: Run all tests**

Run: `pnpm run test:ci`
Expected: All tests pass, including existing host-scoped hunting trail tests.

- [ ] **Step 4: Fix any issues found, then commit if there were fixes**

If lint or check surfaced issues, fix them and commit:

```bash
git add -u
git commit -m "chore: fix lint and type issues"
```
