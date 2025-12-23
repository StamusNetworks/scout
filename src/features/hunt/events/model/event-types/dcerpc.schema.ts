import { z } from 'zod';

import { baseFlowEventSchema } from '../flowEvent.schema';

export const dcerpcSchema = z.object({
  activityuuid: z.string().optional(),
  call_id: z.number().optional(),
  interfaces: z
    .array(
      z.object({
        ack_result: z.number(),
        uuid: z.string(),
        version: z.string(),
      }),
    )
    .optional(),
  req: z
    .object({
      frag_cnt: z.number(),
      opnum: z.number(),
      stub_data_size: z.number(),
    })
    .optional(),
  request: z.string(),
  res: z
    .object({
      frag_cnt: z.number(),
      stub_data_size: z.number(),
    })
    .optional(),
  response: z.string(),
  rpc_version: z.string(),
  seqnum: z.number().optional(),
});

export const dcerpcEventSchema = baseFlowEventSchema.extend({
  event_type: z.literal('dcerpc'),
  dcerpc: dcerpcSchema,
});

export type DcerpcEvent = z.infer<typeof dcerpcEventSchema>;
