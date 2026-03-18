import { buildQueryParams } from '@/common/fetching/buildQueryParams';
import {
  Dates,
  Ordering,
  Paginated,
  Pagination,
  QFilter,
  Tenant,
} from '@/common/fetching/fetching.types';
import { API } from '@/store/api';

import { BeaconingEvent, TlsTail } from './beaconing-event.model';

export const BeaconingAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    // QUERIES
    getBeaconingEvents: builder.query<
      Paginated<BeaconingEvent>,
      QFilter & Dates & Tenant & Pagination & Ordering
    >({
      query: (params) => ({
        url: `appliances/es_beaconing_events/`,
        method: 'GET',
        params: buildQueryParams(params),
      }),
      providesTags: ['Reload', 'Beaconing'],
    }),
    getTlsTail: builder.query<
      Paginated<TlsTail>,
      QFilter & Dates & Tenant & Pagination
    >({
      query: (params) => ({
        url: `rules/es/tls_tail/`,
        method: 'GET',
        params: buildQueryParams(params),
      }),
      providesTags: ['Reload', 'Beaconing'],
    }),
  }),
});

export const { useGetBeaconingEventsQuery, useGetTlsTailQuery } = BeaconingAPI;
