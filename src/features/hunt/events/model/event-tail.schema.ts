import { z } from 'zod';

export const eventTailSchema = z.object({
  src_port: z.number(),
  input: z.object({
    type: z.string(),
  }),
  host: z.string(),
  app_proto: z.string(),
  tx_id: z.number(),
  hostname_info: z.object({
    host: z.string(),
    domain: z.string(),
    url: z.string(),
    subdomain: z.string(),
    tld: z.string(),
    domain_without_tld: z.string(),
  }),
  geoip: z.object({
    latitude: z.number(),
    provider: z.object({
      autonomous_system_number: z.number(),
      autonomous_system_organization: z.string(),
    }),
    timezone: z.string(),
    country: z.object({
      iso_code: z.string(),
      geoname_id: z.number(),
      name: z.string(),
    }),
    country_code2: z.string(),
    longitude: z.number(),
    continent_code: z.string(),
    location: z.object({
      lon: z.number(),
      lat: z.number(),
    }),
    country_code3: z.string(),
    city: z.object({
      geoname_id: z.number(),
      name: z.string(),
    }),
    subdivisions: z.array(
      z.object({
        iso_code: z.string(),
        geoname_id: z.number(),
        name: z.string(),
      }),
    ),
    city_name: z.string(),
    continent: z.object({
      code: z.string(),
      geoname_id: z.number(),
      name: z.string(),
    }),
    coordinate: z.tuple([z.number(), z.number()]),
    ip: z.string(),
    registered_country: z.object({
      iso_code: z.string(),
      geoname_id: z.number(),
      name: z.string(),
    }),
    country_name: z.string(),
  }),
  see_id: z.string(),
  log: z.object({
    file: z.object({
      path: z.string(),
    }),
    offset: z.number(),
  }),
  alerted: z.boolean(),
  tenant: z.number(),
  net_info: z.object({
    dest_agg: z.string(),
    src_agg: z.string(),
    dest: z.array(z.string()),
    src: z.array(z.string()),
  }),
  proto: z.string(),
  http: z.object({
    length: z.union([z.number(), z.string()]),
    server: z.string(),
    content_length: z.string(),
    date: z.string(),
    http_content_type: z.string(),
    user_agent: z.object({
      os_name: z.string(),
      device: z.string(),
      os: z.string(),
      os_full: z.string(),
      name: z.string(),
    }),
    url: z.string(),
    response_headers: z.array(
      z.object({
        value: z.string(),
        name: z.string(),
      }),
    ),
    http_method: z.string(),
    request_headers: z.array(
      z.object({
        value: z.string(),
        name: z.string(),
      }),
    ),
    hostname: z.string(),
    connection: z.string(),
    status: z.number(),
    content_type: z.string(),
    protocol: z.string(),
    http_user_agent: z.string(),
  }),
  dest_port: z.number(),
  dest_ip: z.string(),
  metadata: z.object({
    flowbits: z.array(z.string()),
  }),
  agent: z.object({
    ephemeral_id: z.string(),
    hostname: z.string(),
    type: z.string(),
    id: z.string(),
    version: z.string(),
    name: z.string(),
  }),
  logger: z.string(),
  tags: z.array(z.string()),
  flow_id: z.number(),
  timestamp: z.string(),
  type: z.string(),
  '@timestamp': z.string(),
  ether: z.object({
    src_mac: z.string(),
    dest_mac: z.string(),
  }),
  event_type: z.string(),
  in_iface: z.string(),
  src_ip: z.string(),
  pkt_src: z.string(),
  '@version': z.string(),
  see_name: z.string(),
  _id: z.string(),
});

export type EventTail = z.infer<typeof eventTailSchema>;
