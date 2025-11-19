import {
  ArrowRightLeft,
  Binary,
  Biohazard,
  Calendar,
  Cpu,
  OctagonAlert,
} from 'lucide-react';

import { StatsCardHorizontalProps } from '@/common/design-system/molecules/stats-card-horizontal';
import { formatBytes, formatNumber } from '@/common/lib/numbers';

export const indicators: Record<
  string,
  Omit<StatsCardHorizontalProps, 'loading' | 'value'>
> = {
  'analyzed-traffic': {
    title: 'Analyzed Traffic',
    description:
      'Total volume of network traffic analyzed by the Stamus network probes over the displayed period',
    formatFunction: formatBytes,
    dataTest: 'analyzed-traffic-counter',
    Icon: Binary,
  },
  'network-transactions': {
    title: 'Network Transactions',
    description:
      'Count of protocol transactions and alerts analyzed by the Stamus network probes over the displayed period',
    formatFunction: formatNumber,
    dataTest: 'network-transactions-counter',
    Icon: ArrowRightLeft,
  },
  events: {
    title: 'Events',
    description:
      'Total count of IDS events created by the Stamus network probes over the displayed period',
    formatFunction: formatNumber,
    dataTest: 'events-counter',
    Icon: Calendar,
  },
  declarations: {
    title: 'Declarations',
    description:
      'Total count of Declarations of Compromise and Declaration of Policy Violation discovered by Stamus Central Server over the displayed period',
    formatFunction: formatNumber,
    dataTest: 'doc-dopv-counter',
    Icon: OctagonAlert,
  },
  'doc-declarations': {
    title: 'Compromises',
    description:
      'Total count of Declarations of Compromise discovered by Stamus Central Server over the displayed period',
    formatFunction: formatNumber,
    dataTest: 'declarations-counter',
    Icon: OctagonAlert,
  },
  'doc-assets': {
    title: 'Impacted Entities',
    description:
      'Total count of entities involved in Declaration of Compromise over the displayed period',
    formatFunction: formatNumber,
    dataTest: 'impacted-entities-counter',
    Icon: Cpu,
  },
  'doc-threats': {
    title: 'Active Threats',
    description: 'Count of unique Threats active over the displayed period',
    formatFunction: formatNumber,
    dataTest: 'active-threats-counter',
    Icon: Biohazard,
  },
  'dopv-declarations': {
    title: 'Violations',
    description:
      'Total count of Declaration of Policy Violation discovered by Stamus Central Server over the displayed period',
    formatFunction: formatNumber,
    dataTest: 'dopv-counter',
    Icon: OctagonAlert,
  },
  'dopv-assets': {
    title: 'Impacted Entities',
    description:
      'Total count of entities involved in Declaration of Policy Violation over the displayed period',
    formatFunction: formatNumber,
    dataTest: 'impacted-entities-counter-dopv',
    Icon: Cpu,
  },
  'dopv-threats': {
    title: 'Violated Policies',
    description:
      'Count of unique DoPV Threats active over the displayed period',
    formatFunction: formatNumber,
    dataTest: 'active-threats-counter-dopv',
    Icon: Biohazard,
  },
};
