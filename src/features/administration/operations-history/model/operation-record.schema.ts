import { z } from 'zod';

export const operationRecordSchema = z.object({
  pk: z.number(),
  action_type: z.string(),
  date: z.string(),
  comment: z.string().nullable(),
  user: z.number(),
  username: z.string(),
  ua_objects: z.record(
    z.string(),
    z
      .object({
        type: z.string().optional(),
        pk: z.number().optional(),
        value: z.string(),
      })
      .optional(),
  ),
  client_ip: z.string().nullable(),
  title: z.string(),
  description_raw: z.string(),
  description: z.string(),
});

export type OperationRecord = z.infer<typeof operationRecordSchema>;
