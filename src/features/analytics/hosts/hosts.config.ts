import { z } from 'zod';

export const rolesSchema = z.enum([
  'domain controller',
  'dhcp',
  'http proxy',
  'printer',
  'unclassified',
]);

export type Role = z.infer<typeof rolesSchema>;

export const ROLES: Record<Role, { name: string }> = {
  'domain controller': {
    name: 'Domain Controller',
  },
  dhcp: {
    name: 'DHCP Server',
  },
  'http proxy': {
    name: 'HTTP Proxy',
  },
  printer: {
    name: 'Printer',
  },
  unclassified: {
    name: 'Unclassified',
  },
};
