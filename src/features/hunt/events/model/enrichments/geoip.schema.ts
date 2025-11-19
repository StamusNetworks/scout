import { z } from 'zod';

export const geoipSchema = z.object({
  country_code2: z.string().optional(),
  country_code3: z.string().optional(),
  provider: z
    .object({
      autonomous_system_number: z.number(),
      autonomous_system_organization: z.string(),
    })
    .optional(),
  latitude: z.number(),
  coordinate: z.array(z.number()),
  location: z
    .object({
      lon: z.number(),
      lat: z.number(),
    })
    .optional(),
  longitude: z.number(),
  country_name: z.string().optional(),
  ip: z.string(),
  country: z
    .object({
      geoname_id: z.number(),
      iso_code: z.string(),
      name: z.string(),
    })
    .optional(),
  timezone: z.string(),
  continent_code: z.string().optional(),
  continent: z
    .object({
      geoname_id: z.number(),
      code: z.string(),
      name: z.string(),
    })
    .optional(),
  city: z
    .object({
      geoname_id: z.number(),
      name: z.string(),
    })
    .optional(),
  city_name: z.string().optional(),
  registered_country: z
    .object({
      geoname_id: z.number(),
      iso_code: z.string(),
      name: z.string(),
    })
    .optional(),
  subdivisions: z.array(
    z.object({
      geoname_id: z.number(),
      iso_code: z.string(),
      name: z.string(),
    }),
  ),
  postal: z
    .object({
      code: z.string(),
    })
    .optional(),
});
