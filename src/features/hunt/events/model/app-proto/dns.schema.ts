import { z } from 'zod';

import { baseEventSchema } from '../event.schema';

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

export const dnsEventSchema = baseEventSchema.extend({
  event_type: z.literal('dns'),
  app_proto: z.literal('dns'),
  dns: z.discriminatedUnion('type', [dnsAnswerSchema, dnsQuerySchema]),
});
export type DnsEvent = z.infer<typeof dnsEventSchema>;

export const alertDnsSchema = z.discriminatedUnion('version', [
  z.object({
    version: z.literal('2'),
    query: z.array(dnsQuerySchema.omit({ version: true })).optional(),
    answer: z.array(dnsAnswerSchema.omit({ version: true })).optional(),
  }),
  z.object({
    version: z.literal('3'),
    queries: z.array(dnsQuerySchema.omit({ version: true })).optional(),
    answers: z.array(dnsAnswerSchema.omit({ version: true })).optional(),
  }),
]);

export const dnsSchema = z.object({
  type: z.enum(['query', 'answer']),
  rrtype: z.string().optional(),
  rrname: z.string().optional(),
  id: z.number(),
  flags: z.string().optional(),
  rd: z.boolean().optional(),
  rcode: z.string().optional(),
  tx_id: z.number(),
  version: z.number().optional(),
  answers: z.array(dnsAnswerSchema.omit({ type: true })).optional(),
  queries: z.array(dnsQuerySchema.omit({ type: true })).optional(),
  answer: z.array(dnsAnswerSchema.omit({ type: true })).optional(),
  query: z.array(dnsQuerySchema.omit({ type: true })).optional(),
});
