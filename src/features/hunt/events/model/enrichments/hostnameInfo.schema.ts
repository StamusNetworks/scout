import { z } from 'zod';

export const hostnameInfoSchema = z.object({
  scheme: z.string().optional(),
  resource_path: z.string().optional(),
  host: z.string(),
  url: z.string(),
  tld: z.string(),
  domain: z.string(),
  subdomain: z.string(),
  domain_without_tld: z.string(),
});
