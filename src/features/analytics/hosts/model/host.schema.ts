import { z } from 'zod';

export const hostSchema = z.object({
  ip: z.string(),
  host_id: z.object({
    hostname_count: z.number(),
    'http.user_agent_count': z.number(),
    roles_count: z.number(),
    'tls.ja4_count': z.number(),
    services_count: z.number(),
    client_service_count: z.number(),
    username_count: z.number(),
    first_seen: z.string(),
    last_seen: z.string(),
    client_service: z.array(
      z.object({
        name: z.string(),
        first_seen: z.string(),
        last_seen: z.string(),
      }),
    ),
    net_info: z.array(
      z.object({
        agg: z.string(),
        first_seen: z.string(),
        last_seen: z.string(),
      }),
    ),
    'tls.ja4': z
      .array(
        z.object({
          agent: z.array(z.string()),
          hash: z.string(),
          first_seen: z.string(),
          last_seen: z.string(),
        }),
      )
      .optional(),
    'http.user_agent': z
      .array(
        z.object({
          agent: z.string(),
          first_seen: z.string(),
          last_seen: z.string(),
        }),
      )
      .optional(),
    hostname: z
      .array(
        z.object({
          host: z.string(),
          first_seen: z.string(),
          last_seen: z.string(),
        }),
      )
      .optional(),
    username: z
      .array(
        z.object({
          user: z.string(),
          first_seen: z.string(),
          last_seen: z.string(),
        }),
      )
      .optional(),
    roles: z
      .array(
        z.object({
          name: z.string(),
          first_seen: z.string(),
          last_seen: z.string(),
        }),
      )
      .optional(),
    net_info_count: z.number(),
    services: z
      .array(
        z.object({
          proto: z.string(),
          port: z.number(),
          values: z.array(
            z.object({
              first_seen: z.string(),
              last_seen: z.string(),
              http: z.object({
                server: z.string(),
                first_seen: z.string(),
                last_seen: z.string(),
              }),
              app_proto: z.string(),
            }),
          ),
        }),
      )
      .optional(),
    tenant: z.number(),
  }),
  hits: z.number(),
});
