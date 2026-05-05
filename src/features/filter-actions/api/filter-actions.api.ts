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

import {
  FilterAction,
  FilterActionKind,
  FilterActionPayload,
  FilterActionStats,
} from '../model/filter-action';
import {
  FilterActionActionDto,
  FilterActionDto,
  FilterActionStatsDto,
} from './filter-action.dto';
import {
  toFilterAction,
  toFilterActionActionDto,
  toFilterActionKind,
  toFilterActionPayloadDto,
  toFilterActionStats,
} from './filter-action.transforms';

export const FilterActionsAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    // QUERIES
    getFilterActions: builder.query<
      Paginated<FilterAction>,
      Tenant & Pagination
    >({
      query: (params) => ({
        url: ENDPOINTS.FILTER_ACTIONS.url,
        method: 'GET',
        params: {
          ordering: '-timestamp',
          ...buildQueryParams(params),
        },
      }),
      transformResponse: (
        res: Paginated<FilterActionDto>,
      ): Paginated<FilterAction> => ({
        ...res,
        results: res.results.map(toFilterAction),
      }),
      providesTags: ['Reload', 'Filter Actions'],
    }),
    getFilterActionStats: builder.query<
      FilterActionStats[],
      Dates & Tenant & { id: number }
    >({
      query: ({ id, ...params }) => ({
        url: `rules${ENDPOINTS.ES_FILTER_ACTIONS_DATA.url}`,
        method: 'GET',
        params: {
          ...buildQueryParams(params, { time_format: 'elastic' }),
          value: `rule_filter_${id}`,
        },
      }),
      transformResponse: (res: FilterActionStatsDto[]): FilterActionStats[] =>
        res.map(toFilterActionStats),
      providesTags: ['Reload', 'Filter Actions'],
    }),
    createFilterAction: builder.mutation<
      FilterAction,
      FilterActionPayload & { params?: Tenant & Dates & QFilter }
    >({
      query: ({ params, ...payload }) => ({
        url: ENDPOINTS.FILTER_ACTIONS.url,
        method: 'POST',
        params: params
          ? buildQueryParams(params, { time_format: 'elastic' })
          : undefined,
        body: toFilterActionPayloadDto(payload),
      }),
      transformResponse: (dto: FilterActionDto) => toFilterAction(dto),
      invalidatesTags: ['Filter Actions'],
    }),
    updateFilterAction: builder.mutation<
      FilterAction,
      { id: number } & FilterActionPayload
    >({
      query: ({ id, ...payload }) => ({
        url: `${ENDPOINTS.FILTER_ACTIONS.url}${id}/`,
        method: 'PATCH',
        body: toFilterActionPayloadDto(payload),
      }),
      transformResponse: (dto: FilterActionDto) => toFilterAction(dto),
      invalidatesTags: ['Filter Actions'],
    }),
    updateFilterActionPosition: builder.mutation<
      FilterAction,
      { id: number; index: number; comment?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `${ENDPOINTS.FILTER_ACTIONS.url}${id}/`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (dto: FilterActionDto) => toFilterAction(dto),
      invalidatesTags: ['Filter Actions'],
    }),
    deleteFilterAction: builder.mutation<void, number>({
      query: (id) => ({
        url: `${ENDPOINTS.FILTER_ACTIONS.url}${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Filter Actions'],
    }),
    testActions: builder.query<
      { fields: string[]; operators: string[]; supportedFields?: string },
      { kind: FilterActionKind; fields: string[] }
    >({
      query: ({ kind, fields }) => ({
        url: `${ENDPOINTS.FILTER_ACTIONS.url}test/`,
        method: 'POST',
        body: { action: toFilterActionActionDto(kind), fields },
      }),
      transformResponse: (res: {
        fields: string[];
        operators: string[];
        supported_fields?: string;
      }) => ({
        fields: res.fields,
        operators: res.operators,
        ...(res.supported_fields !== undefined
          ? { supportedFields: res.supported_fields }
          : {}),
      }),
      providesTags: ['Filter Actions'],
    }),
    testAvailableActions: builder.query<
      FilterActionKind[],
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
          .filter((action): action is FilterActionActionDto => action !== '-')
          .map(toFilterActionKind),
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
