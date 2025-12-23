import { z } from 'zod';

import { baseFlowEventSchema } from '../flowEvent.schema';

export const tlsSchema = z.object({
  client: z
    .object({
      fingerprint: z.string(),
      issuerdn: z.string(),
      notafter: z.string(),
      notbefore: z.string(),
      serial: z.string(),
      subject: z.string(),
    })
    .optional(),
  subject: z.string().optional(),
  issuerdn: z.string().optional(),
  serial: z.string().optional(),
  fingerprint: z.string().optional(),
  sni: z.string().optional(),
  version: z.string().optional(),
  notbefore: z.string().optional(),
  notafter: z.string().optional(),
  from_proto: z.string().optional(),
  session_resumed: z.boolean().optional(),
  ja3: z
    .object({
      hash: z.string(),
      string: z.string(),
      agent: z.array(z.string()).optional(),
      agent_count: z.number().optional(),
    })
    .optional(),
  ja4: z.string().optional(),
  ja3s: z
    .object({
      hash: z.string(),
      string: z.string(),
      agent: z.array(z.string()).optional(),
      agent_count: z.number().optional(),
    })
    .optional(),
  cipher_suite: z.string().optional(),
  cipher_security: z.string().optional(),
  alpn_ts: z.array(z.string()).optional(),
  alpn_tc: z.string().optional(),
});

export const tlsEventSchema = baseFlowEventSchema.extend({
  event_type: z.literal('tls'),
  tls: tlsSchema,
});

export type TlsEvent = z.infer<typeof tlsEventSchema>;
