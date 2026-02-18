import { buildQueryParams } from '@/common/fetching/buildQueryParams';
import { Dates, Tenant } from '@/common/fetching/fetching.types';
import { API } from '@/store/api';

type SignatureFlowParams = Dates &
  Tenant & {
    body: Record<string, unknown>;
  };

export const SignatureFlowAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    getSignatureFlowProtocols: builder.query<
      {
        aggregations: {
          protocols: { buckets: { key: string; doc_count: number }[] };
        };
      },
      SignatureFlowParams
    >({
      query: ({ body, ...rest }) => ({
        url: `/rules/es/search/`,
        method: 'POST',
        params: buildQueryParams(rest, { time_format: 'elastic' }),
        body,
      }),
      providesTags: ['Reload'],
    }),
    getSignatureFlowAggregation: builder.query<
      { aggregations: Record<string, unknown> },
      SignatureFlowParams
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

export const {
  useGetSignatureFlowProtocolsQuery,
  useGetSignatureFlowAggregationQuery,
} = SignatureFlowAPI;
