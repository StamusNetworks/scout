import { buildQueryParams } from '@/common/fetching/buildQueryParams';
import { Paginated, Pagination } from '@/common/fetching/fetching.types';
import { API } from '@/store/api';

import { OperationRecord } from '../model/operation-record.schema';

export const OperationsHistoryAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    getOperationsHistory: builder.query<
      Paginated<OperationRecord>,
      Pagination & {
        ordering?: string;
      }
    >({
      query: (params) => ({
        url: '/rules/history',
        method: 'GET',
        params: {
          ...buildQueryParams(params),
          ordering: params?.ordering ?? '-date',
        },
      }),
      providesTags: ['Reload', 'OperationsHistory'],
    }),
  }),
});

export const { useGetOperationsHistoryQuery } = OperationsHistoryAPI;
