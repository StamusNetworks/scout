import { z } from 'zod';

import { baseEventSchema } from '../event.schema';

export const httpSchema = z.object({
  accept: z.string().optional(),
  accept_charset: z.string().optional(),
  accept_encoding: z.string().optional(),
  accept_language: z.string().optional(),
  age: z.string().optional(),
  allow: z.string().optional(),
  authorization: z.string().optional(),
  cache_control: z.string().optional(),
  connection: z.string().optional(),
  content_encoding: z.string().optional(),
  content_language: z.string().optional(),
  content_length: z.string().optional(),
  content_location: z.string().optional(),
  content_md5: z.string().optional(),
  content_range: z.any().optional(),
  content_type: z.string().optional(),
  cookie: z.string().optional(),
  date: z.string().optional(),
  dnt: z.string().optional(),
  expires: z.string().optional(),
  from: z.string().optional(),
  hostname: z.string().optional(),
  http2: z
    .object({
      request: z.object({
        error_code: z.string().optional(),
        settings: z
          .array(
            z.object({
              settings_id: z.string(),
              settings_value: z.number(),
            }),
          )
          .optional(),
      }),
      response: z.object({
        error_code: z.string().optional(),
        settings: z
          .array(
            z.object({
              settings_id: z.string(),
              settings_value: z.number(),
            }),
          )
          .optional(),
      }),
      stream_id: z.number(),
    })
    .optional(),
  http_content_type: z.string().optional(),
  http_method: z.string().optional(),
  http_port: z.number().optional(),
  http_refer: z.string().optional(),
  http_user_agent: z.string().optional(),
  last_modified: z.string().optional(),
  length: z.number().optional(),
  link: z.string().optional(),
  location: z.string().optional(),
  max_forwards: z.string().optional(),
  origin: z.string().optional(),
  pragma: z.string().optional(),
  protocol: z.string().optional(),
  proxy_authorization: z.string().optional(),
  range: z.string().optional(),
  redirect: z.string().optional(),
  refresh: z.string().optional(),
  request_headers: z
    .array(
      z.object({
        name: z.string(),
        value: z.string(),
      }),
    )
    .optional(),
  response_headers: z
    .array(
      z.object({
        name: z.string(),
        value: z.string(),
      }),
    )
    .optional(),
  retry_after: z.string().optional(),
  server: z.string().optional(),
  set_cookie: z.string().optional(),
  status: z.number().optional(),
  te: z.string().optional(),
  transfer_encoding: z.string().optional(),
  upgrade: z.string().optional(),
  url: z.string().optional(),
  vary: z.string().optional(),
  version: z.string().optional(),
  via: z.string().optional(),
  warning: z.string().optional(),
  www_authenticate: z.string().optional(),
  x_flash_version: z.string().optional(),
  x_forwarded_proto: z.string().optional(),
  x_requested_with: z.string().optional(),
  http_request_body: z.string().optional(),
  http_response_body: z.string().optional(),
  http_response_body_printable: z.string().optional(),
  http_request_body_printable: z.string().optional(),
  xff: z.string().optional(),
  http_refer_info: z
    .object({
      scheme: z.string().optional(),
      resource_path: z.string().optional(),
      host: z.string(),
      url: z.string(),
      tld: z.string(),
      domain: z.string(),
      subdomain: z.string(),
      domain_without_tld: z.string(),
    })
    .optional(),
});

export const httpEventSchema = baseEventSchema.extend({
  event_type: z.literal('http'),
  app_proto: z.literal('http'),
  http: httpSchema,
});

export type HttpEvent = z.infer<typeof httpEventSchema>;
