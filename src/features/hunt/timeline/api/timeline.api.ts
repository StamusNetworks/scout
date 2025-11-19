import { buildQueryParams } from '@/common/fetching/buildQueryParams.ts';
import { ENDPOINTS } from '@/common/fetching/fetch.endpoints.ts';
import {
  Dates,
  Paginated,
  QFilter,
  Tenant,
} from '@/common/fetching/fetching.types.ts';
import { API } from '@/store/api';

import { CountsTimeline } from '../models/counts-timeline.model.ts';
import { OffendersData } from '../models/offenders.model.ts';
import { ThreatHistory } from '../models/threat-history.model.ts';

export const TimelineAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    // QUERIES
    getThreatHistory: builder.query<
      Paginated<ThreatHistory>,
      Dates & Tenant & { is_offender?: boolean; asset?: string }
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
    getOffenders: builder.query<OffendersData, Dates & Tenant>({
      query: (params) => ({
        url: '/appliances/threat_event/offenders/',
        method: 'GET',
        params: { ...buildQueryParams(params), is_offender: false },
      }),
      providesTags: ['Reload'],
    }),
    getCountsTimeline: builder.query<
      CountsTimeline,
      Tenant & Dates & QFilter & { target: string }
    >({
      query: (params) => ({
        url: `${ENDPOINTS.TIMELINE.url}/?hosts=*`,
        method: 'GET',
        params: buildQueryParams(params),
      }),
      providesTags: ['Reload', 'Dashboard'],
    }),
  }),
});

export const {
  useGetThreatHistoryQuery,
  useGetOffendersQuery,
  useGetCountsTimelineQuery,
} = TimelineAPI;
