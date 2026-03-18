import { buildQueryParams } from '@/common/fetching/buildQueryParams';
import { Dates, QFilter, Tenant } from '@/common/fetching/fetching.types';
import { Paginated, Pagination } from '@/common/fetching/fetching.types';
import { Event } from '@/features/events/common/events.model';
import { API } from '@/store/api';

export const SightingsAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    // QUERIES
    getSightingEvents: builder.query<
      Paginated<Event>,
      QFilter & Dates & Tenant & Pagination
    >({
      query: (params) => ({
        url: `appliances/es_discovery_events/`,
        method: 'GET',
        params: buildQueryParams(params),
      }),
      providesTags: ['Reload', 'Beaconing'],
    }),
  }),
});

export const { useGetSightingEventsQuery } = SightingsAPI;
