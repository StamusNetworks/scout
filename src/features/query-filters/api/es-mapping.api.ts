import { toPairs } from 'ramda';

import { API } from '@/store/api';

import {
  FilterCategory,
  HOST_ID_KEY_PREFIX,
} from '../definitions/query-filter.config';
import { QueryFilterType } from '../model/query-filter';

/**
 * Elasticsearch field-type metadata. Built lazily from the appliance's
 * index mapping; consumed by query-filter UI to choose input types and
 * by host/signature views to resolve field names. The wire returns a
 * flat `{ field: { type } }`; we add a derived `category` so callers
 * can group host_id.* fields separately from event fields.
 */
export type ESMapping = Record<
  string,
  { type: QueryFilterType; category: FilterCategory }
>;

export const ESMappingAPI = API.injectEndpoints({
  overrideExisting: import.meta.env.DEV,
  endpoints: (builder) => ({
    getESMapping: builder.query<ESMapping, void>({
      query: () => ({
        url: '/rules/es/mapping',
        method: 'GET',
      }),
      transformResponse: (response: Record<string, { type: string }>) =>
        toPairs(response).reduce((acc, [key, value]) => {
          acc[key] = {
            type: value.type,
            category: key.startsWith(HOST_ID_KEY_PREFIX)
              ? FilterCategory.HOST
              : FilterCategory.EVENT,
          };
          return acc;
        }, {} as ESMapping),
      providesTags: ['Reload'],
    }),
  }),
});

export const { useGetESMappingQuery } = ESMappingAPI;
