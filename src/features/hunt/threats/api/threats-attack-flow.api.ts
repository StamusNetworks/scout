import { buildQueryParams } from '@/common/fetching/buildQueryParams';
import { Dates, Tenant } from '@/common/fetching/fetching.types';
import { API } from '@/store/api';

type ThreatsAttackFlowParams = Dates &
  Tenant & {
    body: Record<string, unknown>;
  };

export const ThreatsAttackFlowAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    getThreatsAttackFlowAggregation: builder.query<
      { aggregations: Record<string, unknown> },
      ThreatsAttackFlowParams
    >({
      query: ({ body, ...rest }) => ({
        url: `/rules/es/search/`,
        method: 'POST',
        params: buildQueryParams(rest, { time_format: 'elastic' }),
        body,
      }),
      providesTags: ['Reload'],
    }),
  }),
});

export const { useGetThreatsAttackFlowAggregationQuery } = ThreatsAttackFlowAPI;
