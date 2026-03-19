import { API } from '@/store/api';

import { QueryFilterSet, QueryFilterSetCreatePayload } from './filterset.model';

export type Tenant = {
  tenant?: string;
};

export type URLParams = Record<string, unknown>;

export const QueryFilterAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    // QUERIES
    getFilterSets: builder.query<QueryFilterSet[], void>({
      query: () => ({
        url: `/rules/hunt_filter_sets/`,
        method: 'GET',
      }),
      providesTags: ['Reload', 'FilterSets'],
    }),
    createFilterSet: builder.mutation<
      QueryFilterSet,
      QueryFilterSetCreatePayload
    >({
      query: ({ filters, tags, ...rest }) => ({
        url: `/rules/hunt_filter_sets/`,
        method: 'POST',
        body: {
          ...rest,
          content: [
            ...filters,
            ...(tags ? [{ id: 'alert.tag', value: tags }] : []),
          ],
        },
      }),
      invalidatesTags: ['FilterSets'],
    }),
    deleteFilterSet: builder.mutation<QueryFilterSet[], number>({
      query: (id) => ({
        url: `/rules/hunt_filter_sets/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FilterSets'],
    }),
  }),
});

export const {
  useGetFilterSetsQuery,
  useCreateFilterSetMutation,
  useDeleteFilterSetMutation,
} = QueryFilterAPI;
