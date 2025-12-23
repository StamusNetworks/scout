import { z } from 'zod';

import { baseFlowEventSchema } from '../flowEvent.schema';

export const dnsAnswerSchema = z.object({
  type: z.literal('answer'),
  rrtype: z.string(),
  id: z.number(),
  flags: z.string(),
  rd: z.boolean(),
  rcode: z.string(),
  answers: z.array(
    z.object({
      rrname: z.string(),
      rrtype: z.string(),
      ttl: z.number(),
      rdata: z.string(),
    }),
  ),
  rrname: z.string(),
  ra: z.boolean(),
  qr: z.boolean(),
  opcode: z.number(),
  version: z.number(),
});

const dnsQuerySchema = z.object({
  type: z.literal('query'),
  rrtype: z.string(),
  tx_id: z.number(),
  id: z.number(),
  rrname: z.string(),
  opcode: z.number(),
  version: z.number(),
});

export const dnsEventSchema = baseFlowEventSchema.extend({
  event_type: z.literal('dns'),
  app_proto: z.literal('dns'),
  dns: z.discriminatedUnion('type', [dnsAnswerSchema, dnsQuerySchema]),
});

export type DnsEvent = z.infer<typeof dnsEventSchema>;
