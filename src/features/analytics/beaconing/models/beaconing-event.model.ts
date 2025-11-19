import { z } from 'zod';

export const beaconingEventSchema = z.object({
  timestamp: z.string(),
  src_ip: z.array(z.string()),
  event_type: z.string(),
  stamus_type: z.string(),
  tls: z.object({
    sni: z.array(z.string()),
    ja3s: z.object({
      hash: z.array(z.array(z.string())).or(z.array(z.string())),
    }),
  }),
  beacon_report: z.object({
    outdated: z.boolean(),
    value: z.string(),
    beacon_metric: z.number(),
    assets: z.array(z.string()),
    tenant: z.number(),
    tls_sni: z.array(z.string()),
    first_seen: z.string(),
    last_seen: z.string(),
    document_type: z.string(),
    serving_ip: z.array(z.string()),
    client_ip: z.array(z.string()),
    server_hash: z.array(z.string()),
    flags: z.object({
      is_inactive: z.boolean(),
      well_known_domain: z.boolean(),
    }),
    stats: z.object({
      flow_count: z.number(),
      traffic_rx_total_bytes: z.number(),
      traffic_tx_total_bytes: z.number(),
      traffic_avg_bytes: z.number(),
      traffic_min_bytes: z.number(),
      traffic_max_bytes: z.number(),
      traffic_rx_std_dev_bytes: z.number(),
      traffic_tx_std_dev_bytes: z.number(),
      time_delta_avg_seconds: z.number(),
      time_delta_median_seconds: z.number(),
    }),
    estimate_next_seen: z.string(),
    query_timestamp: z.string(),
    geoip_serving_ip: z.object({
      country_code: z.string(),
      ip_country: z.string(),
      asn_code: z.string(),
      asn_organization: z.string(),
    }),
  }),
  tenant: z.number(),
  dest_ip: z.array(z.string()),
  _id: z.string(),
});

export type BeaconingEvent = z.infer<typeof beaconingEventSchema>;
