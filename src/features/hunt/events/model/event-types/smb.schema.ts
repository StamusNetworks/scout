import { z } from 'zod';

import { baseFlowEventSchema } from '../flowEvent.schema';

export const smbSchema = z.object({
  access: z.string().optional(),
  accessed: z.number().optional(),
  changed: z.number().optional(),
  client_dialects: z.array(z.string()).optional(),
  client_guid: z.string().optional(),
  command: z.string(),
  created: z.number().optional(),
  dcerpc: z
    .object({
      call_id: z.number(),
      interface: z
        .object({
          uuid: z.string(),
          version: z.string(),
          name: z.string().optional(),
        })
        .optional(),
      interfaces: z
        .array(
          z.object({
            ack_reason: z.number().optional(),
            ack_result: z.number().optional(),
            uuid: z.string(),
            version: z.string(),
            name: z.string().optional(),
          }),
        )
        .optional(),
      opnum: z.number().optional(),
      req: z
        .object({
          frag_cnt: z.number().optional(),
          stub_data_size: z.number().optional(),
        })
        .optional(),
      request: z.string(),
      res: z
        .object({
          frag_cnt: z.number().optional(),
          stub_data_size: z.number().optional(),
        })
        .optional(),
      response: z.string(),
      endpoint: z.string().optional(),
    })
    .optional(),
  dialect: z.string(),
  directory: z.string().optional(),
  disposition: z.string().optional(),
  filename: z.string().optional(),
  fuid: z.string().optional(),
  function: z.string().optional(),
  id: z.number().optional(),
  kerberos: z
    .object({
      realm: z.string(),
      snames: z.array(z.string()),
    })
    .optional(),
  max_read_size: z.number().optional(),
  max_write_size: z.number().optional(),
  modified: z.number().optional(),
  named_pipe: z.string().optional(),
  ntlmssp: z
    .object({
      domain: z.string(),
      host: z.string(),
      user: z.string(),
      version: z.string().optional(),
    })
    .optional(),
  rename: z
    .object({
      from: z.string(),
      to: z.string(),
    })
    .optional(),
  request: z
    .object({
      native_lm: z.string(),
      native_os: z.string(),
    })
    .optional(),
  response: z
    .object({
      native_lm: z.string(),
      native_os: z.string(),
    })
    .optional(),
  server_guid: z.string().optional(),
  service: z
    .object({
      request: z.string(),
      response: z.string().optional(),
    })
    .optional(),
  session_id: z.number(),
  set_info: z
    .object({
      class: z.string(),
      info_level: z.string(),
    })
    .optional(),
  share: z.string().optional(),
  share_type: z.string().optional(),
  size: z.number().optional(),
  status: z.string().optional(),
  status_code: z.string().optional(),
  tree_id: z.number(),
  ext_status: z
    .object({
      customer: z.number(),
      facility: z.string(),
      severity: z.string(),
      short_code: z.string(),
      text: z.string(),
    })
    .optional(),
});

export const smbEventSchema = baseFlowEventSchema.extend({
  smb: smbSchema,
});

export type SmbEvent = z.infer<typeof smbEventSchema>;
