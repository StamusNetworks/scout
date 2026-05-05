import { buildQueryParams } from '@/common/fetching/buildQueryParams';
import { ENDPOINTS } from '@/common/fetching/fetch.endpoints';
import { Dates, QFilter, Tenant } from '@/common/fetching/fetching.types';
import { API } from '@/store/api';

import { CountsTimeline } from './counts-timeline.model';

export const CountsTimelineAPI = API.injectEndpoints({
  endpoints: (builder) => ({
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

export const { useGetCountsTimelineQuery } = CountsTimelineAPI;
