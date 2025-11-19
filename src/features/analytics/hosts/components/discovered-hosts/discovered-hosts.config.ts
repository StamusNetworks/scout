import { Laptop, Printer, Server, Waypoints } from 'lucide-react';

import { StatsCardHorizontalProps } from '@/common/design-system/molecules/stats-card-horizontal';
import { formatNumber } from '@/common/lib/numbers';

export const indicators: Record<
  string,
  Omit<StatsCardHorizontalProps, 'loading' | 'value'>
> = {
  'active-hosts': {
    title: 'Active Hosts',
    description: 'Total volume of hosts that are part of the network',
    formatFunction: formatNumber,
    dataTest: 'hosts-total-count',
    Icon: Laptop,
  },
  'hosts-with-services': {
    title: 'Hosts with services',
    description: 'Total volume of hosts that have at least one service running',
    formatFunction: formatNumber,
    dataTest: 'active-hosts-total-count',
    Icon: Laptop,
  },
  'domain-controllers': {
    title: 'Domain Controllers',
    description:
      'Total volume of hosts that are running a domain controller service',
    formatFunction: formatNumber,
    dataTest: 'domain-controllers-total-count',
    Icon: Server,
  },
  'dhcp-servers': {
    title: 'DHCP Servers',
    description: 'Total volume of hosts that are running a DHCP server service',
    formatFunction: formatNumber,
    dataTest: 'dhcp-servers-total-count',
    Icon: Server,
  },
  'http-proxies': {
    title: 'HTTP Proxies',
    description: 'Total volume of hosts that are running an HTTP proxy service',
    formatFunction: formatNumber,
    dataTest: 'http-proxies-total-count',
    Icon: Waypoints,
  },
  printers: {
    title: 'Printers',
    description: 'Total volume of hosts that are printers',
    formatFunction: formatNumber,
    dataTest: 'printers-total-count',
    Icon: Printer,
  },
};
