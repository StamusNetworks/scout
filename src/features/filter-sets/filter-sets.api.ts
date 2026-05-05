import { API } from '@/store/api';

import { type FilterSetDto } from './api/filter-set.dto';
import { toCreatePayloadDto, toFilterSet } from './api/filter-set.transforms';
import { type FilterSet, type FilterSetCreateInput } from './model/filter-set';

export const FilterSetsAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    getFilterSets: builder.query<FilterSet[], void>({
      query: () => ({
        url: `/rules/hunt_filter_sets/`,
        method: 'GET',
      }),
      transformResponse: (response: FilterSetDto[]) =>
        response.map(toFilterSet),
      providesTags: ['Reload', 'FilterSets'],
    }),
    createFilterSet: builder.mutation<FilterSet, FilterSetCreateInput>({
      query: (input) => {
        const wire = toCreatePayloadDto(input);
        return {
          url: `/rules/hunt_filter_sets/`,
          method: 'POST',
          body: {
            name: wire.name,
            page: wire.page,
            share: wire.share,
            description: wire.description,
            // Server expects a mixed `content` array; reconstruct it from
            // the domain's separated filters + tags.
            content: [
              ...wire.filters,
              ...(wire.tags ? [{ id: 'alert.tag', value: wire.tags }] : []),
            ],
          },
        };
      },
      transformResponse: (response: FilterSetDto) => toFilterSet(response),
      invalidatesTags: ['FilterSets'],
    }),
    deleteFilterSet: builder.mutation<void, number>({
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
} = FilterSetsAPI;
