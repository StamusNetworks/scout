import { z } from 'zod';

import { baseFlowEventSchema } from '../flowEvent.schema';

export const dhcpSchema = z.object({
  assigned_ip: z.string(),
  client_id: z.string().optional(),
  client_ip: z.string().optional(),
  client_mac: z.string(),
  dhcp_type: z.string(),
  dns_servers: z.array(z.string()).optional(),
  hostname: z.string().optional(),
  id: z.number(),
  lease_time: z.number().optional(),
  next_server_ip: z.string().optional(),
  params: z.array(z.string()).optional(),
  rebinding_time: z.number().optional(),
  relay_ip: z.string().optional(),
  renewal_time: z.number().optional(),
  requested_ip: z.string().optional(),
  routers: z.array(z.string()).optional(),
  subnet_mask: z.string().optional(),
  type: z.string(),
  vendor_class_identifier: z.string().optional(),
});

export const dhcpEventSchema = baseFlowEventSchema.extend({
  dhcp: dhcpSchema,
});

export type DhcpEvent = z.infer<typeof dhcpEventSchema>;
