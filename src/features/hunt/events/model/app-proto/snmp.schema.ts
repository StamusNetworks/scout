import { z } from 'zod';

import { baseEventSchema } from '../event.schema';

export const snmpSchema = z.object({
  community: z.string().optional(),
  pdu_type: z.string(),
  trap_address: z.string().optional(),
  trap_oid: z.string().optional(),
  trap_type: z.string().optional(),
  usm: z.any().optional(),
  vars: z.array(z.string()).optional(),
  version: z.number(),
});

export const snmpEventSchema = baseEventSchema.extend({
  event_type: z.literal('snmp'),
  app_proto: z.literal('snmp'),
  snmp: snmpSchema,
});

export type SnmpEvent = z.infer<typeof snmpEventSchema>;
