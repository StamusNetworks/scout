import z from 'zod';

export const filesSchema = z.array(
  z.object({
    filename: z.string(),
    size: z.number(),
    sha256: z.string(),
    mimetype: z.string(),
    gaps: z.boolean(),
    state: z.string(),
    stored: z.boolean(),
    tx_id: z.number(),
    type: z.string().optional(),
  }),
);
