import { Tenant } from '@/common/fetching/fetching.types';
// EventTypeFlags is consumed across many features; it currently lives on
// query-filters' store. Imported via the legacy path until query-filters
// migrates and exposes a public type.
import { EventTypeFlags } from '@/features/filtering/filters/query-filters/query-filters.store';
import { API } from '@/store/api';

export const DatesAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    getAutoDateRange: builder.query<
      { min_timestamp: number; max_timestamp: number },
      Tenant & Partial<EventTypeFlags>
    >({
      query: (params) => ({
        url: '/rules/es/alerts_timerange/',
        method: 'GET',
        params,
      }),
      providesTags: ['Reload'],
    }),
  }),
});

export const { useGetAutoDateRangeQuery } = DatesAPI;
