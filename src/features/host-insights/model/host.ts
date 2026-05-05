import { z } from 'zod';

import { hostSchema } from '../api/host.dto';

export type Host = z.infer<typeof hostSchema>;

export const HostRoles = {
  'domain controller': {
    label: 'Domain Controller',
  },
  printer: {
    label: 'Printer',
  },
  dhcp: {
    label: 'DHCP Server',
  },
  'http proxy': {
    label: 'HTTP(s) Proxy',
  },
  unclassified: {
    label: 'unclassified',
  },
} as const;

export const getHostRole = (role: string) =>
  HostRoles[role.toLowerCase() as keyof typeof HostRoles]?.label ??
  HostRoles.unclassified.label;
