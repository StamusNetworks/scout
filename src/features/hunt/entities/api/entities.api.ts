import { buildQueryParams } from '@/common/fetching/buildQueryParams';
import { Dates, Tenant } from '@/common/fetching/fetching.types';
import { Paginated, Pagination } from '@/common/fetching/fetching.types';
import { API } from '@/store/api';

import { killChainsConfig } from '../../killchain/killchain';
import { AttackerInfrastructureAggregation } from '../components/attacker-infrastructure/attacker-infrastructure.schema';
import { getESParams } from '../components/attacker-infrastructure/attacker-infrastructure.utils';
import { Entity } from '../model/entity';

export const EntitiesAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    // QUERIES
    getImpactedEntities: builder.query<
      Paginated<Entity>,
      Dates &
        Tenant &
        Pagination & {
          asset?: string;
          family_class?: 'doc' | 'dopv' | '';
          status?: 'new' | 'fixed' | '';
          kill_chain?: string | null;
          search?: string | null;
          ordering?: string;
          threat_id?: number;
          family_id?: number;
        }
    >({
      query: (params) => ({
        url: `appliances/threat/threats_per_asset/`,
        method: 'GET',
        params: buildQueryParams(params),
      }),
      providesTags: ['Reload', 'Entities'],
    }),
    getKillChainCounters: builder.query<
      { kill_chain: keyof typeof killChainsConfig; nb_assets: number }[],
      Dates & Tenant & { family_id?: string }
    >({
      query: (params) => ({
        url: `/appliances/threat_family/kill_chain_family/`,
        method: 'GET',
        params: buildQueryParams(params),
      }),
      providesTags: ['Reload', 'Dashboard'],
    }),
    getKillChainCountersByThreatId: builder.query<
      { kill_chain: keyof typeof killChainsConfig; nb_assets: number }[],
      Dates & Tenant & { threat_id: string }
    >({
      query: ({ threat_id, ...rest }) => ({
        url: `/appliances/threat/${threat_id}/kill_chain/`,
        method: 'GET',
        params: buildQueryParams(rest),
      }),
      transformResponse: (
        response: Record<keyof typeof killChainsConfig, number>,
      ) =>
        (
          Object.entries(response) as [keyof typeof killChainsConfig, number][]
        ).reduce(
          (acc, [key, value]) => [
            ...acc,
            { kill_chain: key, nb_assets: value },
          ],
          [] as {
            kill_chain: keyof typeof killChainsConfig;
            nb_assets: number;
          }[],
        ),
      providesTags: ['Reload', 'Dashboard'],
    }),
    updateEntityStatus: builder.mutation<
      { updated: boolean },
      { pk: number; status: 'fixed' | 'new'; threatId?: number }
    >({
      query: ({ pk, status, threatId }) => ({
        url: `/appliances/threat_event/set_status/`,
        method: 'POST',
        body: { status },
        params: {
          event_view: false,
          asset: pk,
          threat_id: threatId,
        },
      }),
      invalidatesTags: ['Entities'],
    }),
    getAttackerInfrastructure: builder.query<
      AttackerInfrastructureAggregation,
      Dates & Tenant & { asset: string }
    >({
      query: ({ asset, ...rest }) => ({
        url: `/rules/es/search/`,
        method: 'POST',
        params: buildQueryParams(rest, { time_format: 'elastic' }),
        body: getESParams(asset),
      }),
      providesTags: ['Reload', 'Entities'],
    }),
  }),
});

export const {
  useGetImpactedEntitiesQuery,
  useGetKillChainCountersQuery,
  useGetKillChainCountersByThreatIdQuery,
  useUpdateEntityStatusMutation,
  useGetAttackerInfrastructureQuery,
} = EntitiesAPI;
