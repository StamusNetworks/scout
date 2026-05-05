import { z } from 'zod';

import { baseEventSchema } from '@/features/events/model/event';

// export const fileinfoSchema = z.object({
//   start: z.number().optional(),
//   end: z.number().optional(),
//   filename: z.string().optional(),
//   gaps: z.boolean(),
//   mimetype: z.string().optional(),
//   type: z.string().optional(),
//   sha256: z.string().optional(),
//   sid: z.array(z.any()).optional(),
//   size: z.number(),
//   state: z.string(),
//   stored: z.boolean(),
//   tx_id: z.number(),
// });

// export type Fileinfo = z.infer<typeof fileinfoSchema>;

export const fileInfoSchema = z.object({
  filename: z.string(),
  mimetype: z.string(),
  gaps: z.boolean(),
  sha256: z.string(),
  tx_id: z.number(),
  sid: z.array(z.unknown()).optional(),
  state: z.string(),
  size: z.number(),
  stored: z.boolean(),
  type: z.string().optional(),
});

export type EventFileInfo = z.infer<typeof fileInfoSchema>;

export const fileinfoEventSchema = baseEventSchema.extend({
  event_type: z.literal('fileinfo'),
  fileinfo: fileInfoSchema,
});

export type FileinfoEvent = z.infer<typeof fileinfoEventSchema>;
