import { toPairs } from 'ramda';

import { Paginated } from '@/common/fetching/fetching.types';
import { FilterCategory } from '@/features/hunt/filtering/query-filters/constants/query-filter.config';
import { QueryFilterType } from '@/features/hunt/filtering/query-filters/model/query-filter';
import { API } from '@/store/api';

import { Tenant } from '../tenancy/tenancy.slice';
import {
  GlobalSettings,
  NetworkDefinition,
  SciriusContext,
  Source,
  SystemSettings,
} from './settings.model';

export const SettingsAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    getSystemSettings: builder.query<SystemSettings, void>({
      query: () => ({
        url: '/rules/system_settings/',
        method: 'GET',
      }),
    }),
    getGlobalSettings: builder.query<GlobalSettings, void>({
      query: () => ({
        url: '/appliances/global_settings/',
        method: 'GET',
      }),
    }),
    getTenantsList: builder.query<Tenant[], void>({
      query: () => ({
        url: '/appliances/network_definition/?page_size=1000',
        method: 'GET',
      }),
      transformResponse: (response: Paginated<NetworkDefinition>) =>
        response.results.map((tenant) => ({
          name: tenant.name,
          tenantId: tenant.pk,
        })),
      providesTags: ['Reload'],
    }),
    getESMapping: builder.query<
      Record<string, { type: QueryFilterType; category: FilterCategory }>,
      void
    >({
      query: () => ({
        url: '/rules/es/mapping',
        method: 'GET',
      }),
      transformResponse: (response: Record<string, { type: string }>) =>
        toPairs(response).reduce(
          (acc, [key, value]) => {
            acc[key] = {
              type: value.type,
              category: key.startsWith('host_id.')
                ? FilterCategory.HOST
                : FilterCategory.EVENT,
            };
            return acc;
          },
          {} as Record<
            string,
            { type: QueryFilterType; category: FilterCategory }
          >,
        ),
      providesTags: ['Reload'],
    }),
    getSciriusContext: builder.query<SciriusContext, void>({
      query: () => ({
        url: '/rules/scirius_context',
        method: 'GET',
      }),
      providesTags: ['Reload'],
    }),
    getSources: builder.query<
      Paginated<Source>,
      {
        datatype?: string;
      }
    >({
      query: () => ({
        url: '/rules/source',
        method: 'GET',
      }),
      providesTags: ['Reload'],
    }),
  }),
});

export const {
  useGetSystemSettingsQuery,
  useGetGlobalSettingsQuery,
  useGetTenantsListQuery,
  useGetESMappingQuery,
  useGetSciriusContextQuery,
  useGetSourcesQuery,
} = SettingsAPI;
