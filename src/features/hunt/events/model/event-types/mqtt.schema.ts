import { z } from 'zod';

import { baseFlowEventSchema } from '../flowEvent.schema';

export const mqttSchema = z.object({
  connack: z
    .object({
      dup: z.boolean(),
      properties: z
        .object({
          maximum_packet_size: z.number(),
          retain_available: z.number(),
          shared_subscription_available: z.number(),
          subscription_identifier_available: z.number(),
          topic_alias_maximum: z.number(),
          wildcard_subscription_available: z.number(),
        })
        .optional(),
      qos: z.number(),
      retain: z.boolean(),
      return_code: z.number(),
      session_present: z.boolean(),
    })
    .optional(),
  connect: z
    .object({
      client_id: z.string(),
      dup: z.boolean(),
      flags: z
        .object({
          clean_session: z.boolean(),
          password: z.boolean(),
          username: z.boolean(),
          will: z.boolean(),
          will_retain: z.boolean(),
        })
        .optional(),
      properties: z.object({
        session_expiry_interval: z.number(),
      }),
      protocol_string: z.string(),
      protocol_version: z.number(),
      qos: z.number(),
      retain: z.boolean(),
    })
    .optional(),
  disconnect: z
    .object({
      dup: z.boolean(),
      qos: z.number(),
      reason_code: z.number(),
      retain: z.boolean(),
    })
    .optional(),
  puback: z
    .object({
      dup: z.boolean(),
      message_id: z.number(),
      qos: z.number(),
      reason_code: z.number(),
      retain: z.boolean(),
    })
    .optional(),
  publish: z
    .object({
      dup: z.boolean(),
      message: z.string(),
      message_id: z.number(),
      qos: z.number(),
      retain: z.boolean(),
      topic: z.string(),
    })
    .optional(),
  suback: z
    .object({
      dup: z.boolean(),
      message_id: z.number(),
      qos: z.number(),
      qos_granted: z.array(z.number()),
      retain: z.boolean(),
    })
    .optional(),
  subscribe: z
    .object({
      dup: z.boolean(),
      message_id: z.number(),
      qos: z.number(),
      retain: z.boolean(),
      topics: z.array(
        z.object({
          qos: z.number(),
          topic: z.string(),
        }),
      ),
    })
    .optional(),
});

export const mqttEventSchema = baseFlowEventSchema.extend({
  mqtt: mqttSchema,
});

export type MqttEvent = z.infer<typeof mqttEventSchema>;
