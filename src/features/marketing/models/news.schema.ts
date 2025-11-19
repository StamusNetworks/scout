import { z } from 'zod';

export const newsSchema = z.object({
  title: z.string(),
  link: z.string(),
  pubDate: z.string(),
  description: z.string(),
  categories: z.array(z.string()),
});

export type News = z.infer<typeof newsSchema>;
