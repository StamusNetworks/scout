import { buildQueryParams } from '@/common/fetching/build-query-params';
import { Paginated, Pagination } from '@/common/fetching/fetching.types';
import { API } from '@/store/api';
import { applyOptimisticUpdateToAllCacheEntries } from '@/store/utils';

import { CreateDeeplink, Deeplink } from '../model/deep-link';
import { DeeplinkDto } from './deeplink.dto';
import {
  toCreateDeeplinkPayload,
  toDeeplink,
  toUpdateDeeplinkPayload,
} from './deeplinks.transforms';

export const DeeplinkAPI = API.injectEndpoints({
  overrideExisting: import.meta.env.VITE_APP_MODE === 'development',
  endpoints: (builder) => ({
    getDeeplinks: builder.query<
      Paginated<Deeplink>,
      Pagination & {
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
      transformResponse: (response: Paginated<DeeplinkDto>) => ({
        ...response,
        results: response.results.map(toDeeplink),
      }),
      providesTags: ['Reload', 'Deeplinks'],
    }),
    createDeepLink: builder.mutation<Deeplink, CreateDeeplink>({
      query: (domain) => ({
        url: `/rules/deeplink/`,
        method: 'POST',
        body: toCreateDeeplinkPayload(domain),
      }),
      transformResponse: toDeeplink,
      invalidatesTags: ['Deeplinks'],
    }),
    updateDeepLink: builder.mutation<
      Deeplink,
      Partial<CreateDeeplink> & { id: number; enabled?: boolean }
    >({
      query: (domain) => {
        const { pk, ...body } = toUpdateDeeplinkPayload(domain);
        return {
          url: `/rules/deeplink/${pk}/`,
          method: 'PATCH',
          body,
        };
      },
      transformResponse: toDeeplink,
      async onQueryStarted({ id, ...patch }, api) {
        applyOptimisticUpdateToAllCacheEntries<Paginated<Deeplink>>(
          api,
          DeeplinkAPI,
          'getDeeplinks',
          (draft) => {
            const d = draft.results.find((m) => m.id === id);
            if (d) {
              Object.assign(d, patch);
            }
          },
        );
      },
      invalidatesTags: ['Deeplinks'],
    }),
    deleteDeepLink: builder.mutation<void, { id: number }>({
      query: ({ id }) => ({
        url: `/rules/deeplink/${id}/`,
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
