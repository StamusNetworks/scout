import { Paginated } from '@/common/fetching/fetching.types';
import { API } from '@/store/api';

import type { Tenant } from '../model/tenant';

/**
 * Wire shape for `/appliances/network_definition/`. The backend keeps
 * the historical "network definition" name; the client thinks of these
 * as tenants.
 */
type NetworkDefinitionDto = {
  pk: number;
  name: string;
};

export const TenancyAPI = API.injectEndpoints({
  overrideExisting: import.meta.env.DEV,
  endpoints: (builder) => ({
    getTenantsList: builder.query<Tenant[], void>({
      query: () => ({
        url: '/appliances/network_definition/?page_size=1000',
        method: 'GET',
      }),
      transformResponse: (response: Paginated<NetworkDefinitionDto>) =>
        response.results.map((dto) => ({
          tenantId: dto.pk,
          name: dto.name,
        })),
      providesTags: ['Reload'],
    }),
  }),
});

export const { useGetTenantsListQuery } = TenancyAPI;
