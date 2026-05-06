import { buildQueryParams } from '@/common/fetching/build-query-params';
import {
  DateRange,
  Paginated,
  Tenant,
} from '@/common/fetching/fetching.types.ts';
import { API } from '@/store/api';

import { OffendersData } from '../model/offenders';
import { ThreatHistory } from '../model/threat-history';

export const TimelineAPI = API.injectEndpoints({
  overrideExisting: import.meta.env.VITE_APP_MODE === 'development',
  endpoints: (builder) => ({
    getThreatHistory: builder.query<
      Paginated<ThreatHistory>,
      DateRange & Tenant & { is_offender?: boolean; asset?: string }
    >({
      query: (params) => ({
        url: '/appliances/threat_history/',
        method: 'GET',
        params: {
          ordering: '-timestamp',
          page_size: 10000,
          ...buildQueryParams(params),
        },
      }),
      providesTags: ['Reload'],
    }),
    getOffenders: builder.query<OffendersData, DateRange & Tenant>({
      query: (params) => ({
        url: '/appliances/threat_event/offenders/',
        method: 'GET',
        params: { ...buildQueryParams(params), is_offender: false },
      }),
      providesTags: ['Reload'],
    }),
  }),
});

export const { useGetThreatHistoryQuery, useGetOffendersQuery } = TimelineAPI;
