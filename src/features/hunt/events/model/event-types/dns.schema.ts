import { z } from 'zod';

import { baseFlowEventSchema } from '../flowEvent.schema';

export const dnsSchema = z.object({
  aa: z.boolean().optional(),
  answers: z.array(
    z.object({
      Rdata: z.string().optional(),
      Rrname: z.string(),
      Rrtype: z.string(),
      Soa: z
        .object({
          Expire: z.number(),
          Minimum: z.number(),
          Mname: z.string(),
          Refresh: z.number(),
          Retry: z.number(),
          Rname: z.string(),
          Serial: z.number(),
        })
        .optional(),
      Srv: z
        .object({
          Name: z.string(),
          Port: z.number(),
          Priority: z.number(),
          Weight: z.number(),
        })
        .optional(),
      Ttl: z.number(),
    }),
  ),
  authorities: z.array(
    z.object({
      Rdata: z.string().optional(),
      Rrname: z.string(),
      Rrtype: z.string(),
      Soa: z
        .object({
          Expire: z.number(),
          Minimum: z.number(),
          Mname: z.string(),
          Refresh: z.number(),
          Retry: z.number(),
          Rname: z.string(),
          Serial: z.number(),
        })
        .optional(),
      Ttl: z.number(),
    }),
  ),
  flags: z.string().optional(),
  grouped: z
    .object({
      A: z.array(z.string()).optional(),
      Aaaa: z.array(z.string()).optional(),
      Cname: z.array(z.string()).optional(),
      Mx: z.array(z.string()).optional(),
      Ns: z.array(z.string()).optional(),
      Ptr: z.array(z.string()).optional(),
      SOA: z
        .array(
          z.object({
            expire: z.number(),
            minimum: z.number(),
            mname: z.string(),
            refresh: z.number(),
            retry: z.number(),
            rname: z.string(),
            serial: z.number(),
          }),
        )
        .optional(),
      SRV: z
        .array(
          z.object({
            name: z.string(),
            port: z.number(),
            priority: z.number(),
            weight: z.number(),
          }),
        )
        .optional(),
      TXT: z.array(z.string()).optional(),
    })
    .optional(),
  id: z.number(),
  opcode: z.number(),
  qr: z.boolean().optional(),
  query: z
    .array(
      z.object({
        id: z.number(),
        opcode: z.number(),
        rrname: z.string(),
        rrtype: z.string(),
        tx_id: z.number(),
        type: z.string(),
      }),
    )
    .optional(),
  ra: z.boolean().optional(),
  rcode: z.string().optional(),
  rd: z.boolean().optional(),
  rrname: z.string(),
  rrtype: z.string(),
  tc: z.boolean().optional(),
  tx_id: z.number().optional(),
  type: z.string(),
  version: z.number().optional(),
});

export const dnsEventSchema = baseFlowEventSchema.extend({
  dns: dnsSchema,
});

export type DnsEvent = z.infer<typeof dnsEventSchema>;
