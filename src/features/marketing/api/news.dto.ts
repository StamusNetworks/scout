import { z } from 'zod';

export const newsDtoSchema = z.object({
  title: z.string(),
  link: z.string(),
  pubDate: z.string(),
  description: z.string(),
  categories: z.array(z.string()),
});

export type NewsDto = z.infer<typeof newsDtoSchema>;
