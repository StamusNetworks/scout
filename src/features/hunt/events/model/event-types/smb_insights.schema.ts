import { z } from 'zod';

import { baseFlowEventSchema } from '../flowEvent.schema';

export const smbInsightsEventSchema = baseFlowEventSchema.extend({
  see_id: z.string().optional(),
  see_name: z.string().optional(),
  agent: z
    .object({
      hostname: z.string(),
      ephemeral_id: z.string(),
      type: z.string(),
      id: z.string(),
      version: z.string(),
      name: z.string(),
    })
    .optional(),
  log: z
    .object({
      offset: z.number(),
      file: z.object({
        path: z.string(),
      }),
    })
    .optional(),
  type: z.string().optional(),
  tags: z.array(z.string()).optional(),
  uuid: z.string().optional(),
  tenant: z.number().optional(),
  smb_insights: z
    .object({
      trackers: z.object({
        named_pipe: z
          .object({
            uniq: z.array(z.string()).optional(),
            count: z.number().optional(),
            counters: z.record(z.number()).optional(),
          })
          .optional(),
        command: z
          .object({
            uniq: z.array(z.string()).optional(),
            count: z.number().optional(),
            counters: z.record(z.number()).optional(),
          })
          .optional(),
        filename: z
          .object({
            uniq: z.array(z.string()).optional(),
            count: z.number().optional(),
          })
          .optional(),
        kerberos_sname: z
          .object({
            uniq: z.array(z.string()).optional(),
            count: z.number().optional(),
          })
          .optional(),
        status: z
          .object({
            uniq: z.array(z.string()).optional(),
            count: z.number().optional(),
            counters: z.record(z.number()).optional(),
          })
          .optional(),
        mime_type: z
          .object({
            count: z.number().optional(),
          })
          .optional(),
        function: z
          .object({
            uniq: z.array(z.string()).optional(),
            count: z.number().optional(),
          })
          .optional(),
        flowbits: z
          .object({
            uniq: z.array(z.string()).optional(),
            count: z.number().optional(),
          })
          .optional(),
        ntlmssp_domain: z
          .object({
            count: z.number().optional(),
          })
          .optional(),
        ntlmssp_user: z
          .object({
            count: z.number().optional(),
          })
          .optional(),
        kerberos_realm: z
          .object({
            uniq: z.array(z.string()).optional(),
            count: z.number().optional(),
          })
          .optional(),
        share: z
          .object({
            count: z.number().optional(),
          })
          .optional(),
        dcerpc_endpoint: z
          .object({
            count: z.number().optional(),
          })
          .optional(),
        ntlmssp_host: z
          .object({
            count: z.number().optional(),
          })
          .optional(),
      }),
      events: z.number().optional(),
      first_seen: z.string().optional(),
      last_seen: z.string().optional(),
      flags: z
        .object({
          missing_status: z.boolean().optional(),
        })
        .optional(),
    })
    .optional(),
  flow: z
    .object({
      bytes_toclient: z.number().optional(),
      reason: z.string().optional(),
      pkts_toserver: z.number().optional(),
      tx_cnt: z.number().optional(),
      end: z.string().optional(),
      alerted: z.boolean().optional(),
      age: z.number().optional(),
      start: z.string().optional(),
      pkts_toclient: z.number().optional(),
      bytes_toserver: z.number().optional(),
      state: z.string().optional(),
    })
    .optional(),
});

export type SmbInsightsEvent = z.infer<typeof smbInsightsEventSchema>;
