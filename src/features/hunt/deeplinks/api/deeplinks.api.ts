import { buildQueryParams } from '@/common/fetching/buildQueryParams';
import { Paginated, Pagination } from '@/common/fetching/fetching.types';
import { API } from '@/store/api';
import { applyOptimisticUpdateToAllCacheEntries } from '@/store/utils';

import { Deeplink } from '../model/deep-link.model';

export type URLParams = Record<string, string>;

export const DeeplinkAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    // QUERIES
    getDeeplinks: builder.query<
      Paginated<Deeplink>,
      Pagination & {
        ordering?: string;
        entities__name?: string;
        user_defined?: 'true' | 'false';
        enabled?: 'true' | 'false';
      }
    >({
      query: (params) => ({
        url: `/rules/deeplink/`,
        method: 'GET',
        params: buildQueryParams(params),
      }),
      providesTags: ['Reload', 'Deeplinks'],
    }),
    createDeepLink: builder.mutation<
      Deeplink,
      Omit<Deeplink, 'pk' | 'enabled' | 'user_defined'>
    >({
      query: ({ name, template, entities, all }) => ({
        url: `/rules/deeplink/`,
        method: 'POST',
        body: {
          name,
          template,
          entities,
          all,
        },
      }),
      invalidatesTags: ['Deeplinks'],
    }),
    updateDeepLink: builder.mutation<
      Deeplink,
      Partial<Omit<Deeplink, 'user_defined'>>
    >({
      query: ({ pk, name, template, entities, all, enabled }) => ({
        url: `/rules/deeplink/${pk}/`,
        method: 'PATCH',
        body: {
          name,
          template,
          entities,
          all,
          enabled,
        },
      }),
      async onQueryStarted({ pk, ...patch }, api) {
        applyOptimisticUpdateToAllCacheEntries<Paginated<Deeplink>>(
          api,
          DeeplinkAPI,
          'getDeeplinks',
          (draft) => {
            const d = draft.results.find((m) => m.pk === pk);
            if (d) {
              Object.assign(d, patch);
            }
          },
        );
      },
      invalidatesTags: ['Deeplinks'],
    }),
    deleteDeepLink: builder.mutation<void, { pk: number }>({
      query: ({ pk }) => ({
        url: `/rules/deeplink/${pk}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Deeplinks'],
    }),
  }),
});

export const {
  useGetDeeplinksQuery,
  useCreateDeepLinkMutation,
  useUpdateDeepLinkMutation,
  useDeleteDeepLinkMutation,
} = DeeplinkAPI;
