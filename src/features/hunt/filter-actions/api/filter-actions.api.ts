import { buildQueryParams } from '@/common/fetching/buildQueryParams.ts';
import { ENDPOINTS } from '@/common/fetching/fetch.endpoints.ts';
import {
  Dates,
  Paginated,
  Pagination,
  QFilter,
  Tenant,
} from '@/common/fetching/fetching.types.ts';
import { API } from '@/store/api';

import { FilterActionPayload } from '../model/filter-action.schema.ts';
import { FilterAction, FilterActionStats } from '../model/filter-action.ts';

export const FilterActionsAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    // QUERIES
    getFilterActions: builder.query<
      Paginated<FilterAction>,
      Tenant & Pagination
    >({
      query: () => ({
        url: ENDPOINTS.FILTER_ACTIONS.url,
        method: 'GET',
        params: { ordering: '-timestamp' },
      }),
      providesTags: ['Reload', 'Filter Actions'],
    }),
    getFilterActionStats: builder.query<
      FilterActionStats[],
      Dates & Tenant & { pk: number }
    >({
      query: ({ pk, ...params }) => ({
        url: `rules${ENDPOINTS.ES_FILTER_ACTIONS_DATA.url}`,
        method: 'GET',
        params: {
          ...buildQueryParams(params, { time_format: 'elastic' }),
          value: `rule_filter_${pk}`,
        },
      }),
      providesTags: ['Reload', 'Filter Actions'],
    }),
    createFilterAction: builder.mutation<
      FilterAction,
      FilterActionPayload & { params?: Tenant & Dates & QFilter }
    >({
      query: ({ params, ...body }) => ({
        url: ENDPOINTS.FILTER_ACTIONS.url,
        method: 'POST',
        params: params
          ? buildQueryParams(params, { time_format: 'elastic' })
          : undefined,
        body,
      }),
      invalidatesTags: ['Filter Actions'],
    }),
    updateFilterAction: builder.mutation<
      FilterAction,
      { pk: number } & Partial<Omit<FilterActionPayload, 'pk'>>
    >({
      query: ({ pk, ...body }) => ({
        url: `${ENDPOINTS.FILTER_ACTIONS.url}${pk}/`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Filter Actions'],
    }),
    updateFilterActionPosition: builder.mutation<
      FilterAction,
      { pk: number; index: number; comment?: string }
    >({
      query: ({ pk, ...body }) => ({
        url: `${ENDPOINTS.FILTER_ACTIONS.url}${pk}/`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Filter Actions'],
    }),
    deleteFilterAction: builder.mutation<void, number>({
      query: (pk) => ({
        url: `${ENDPOINTS.FILTER_ACTIONS.url}${pk}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Filter Actions'],
    }),
    testActions: builder.query<
      { fields: string[]; operators: string[]; supported_fields?: string },
      { action: FilterAction['action']; fields: string[] }
    >({
      query: (body) => ({
        url: `${ENDPOINTS.FILTER_ACTIONS.url}test/`,
        method: 'POST',
        body,
      }),
      providesTags: ['Filter Actions'],
    }),
    testAvailableActions: builder.query<
      FilterAction['action'][],
      { fields: string[] }
    >({
      query: (body) => ({
        url: `${ENDPOINTS.FILTER_ACTIONS.url}test_actions/`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: { actions: string[][] }) =>
        response.actions
          .map(([first]) => first)
          .filter((action) => action !== '-') as FilterAction['action'][],
      providesTags: ['Filter Actions'],
    }),
  }),
});

export const {
  useGetFilterActionsQuery,
  useGetFilterActionStatsQuery,
  useCreateFilterActionMutation,
  useUpdateFilterActionMutation,
  useUpdateFilterActionPositionMutation,
  useDeleteFilterActionMutation,
  useTestActionsQuery,
  useTestAvailableActionsQuery,
} = FilterActionsAPI;
