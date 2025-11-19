import { z } from 'zod';

import { baseFlowEventSchema } from '../flowEvent.schema';

export const sshSchema = z.object({
  client: z
    .object({
      hassh: z
        .object({
          hash: z.string(),
          string: z.string(),
        })
        .optional(),
      proto_version: z.string(),
      software_version: z.string(),
    })
    .optional(),
  server: z
    .object({
      hassh: z
        .object({
          hash: z.string(),
          string: z.string(),
        })
        .optional(),
      proto_version: z.string(),
      software_version: z.string(),
    })
    .optional(),
});

export const sshEventSchema = baseFlowEventSchema.extend({
  ssh: sshSchema,
});

export type SshEvent = z.infer<typeof sshEventSchema>;
