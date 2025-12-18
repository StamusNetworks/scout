import { API } from '@/store/api';

import { EventTypes } from '../../query-filters/store/query-filters.slice';

export const DatesAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    // QUERIES
    getAutoDateRange: builder.query<
      { min_timestamp: number; max_timestamp: number },
      EventTypes | null
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
