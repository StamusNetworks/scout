import { buildQueryParams } from '@/common/fetching/buildQueryParams';
import { Dates, Tenant } from '@/common/fetching/fetching.types';
import { Paginated, Pagination } from '@/common/fetching/fetching.types';
import { killChainsConfig } from '@/features/threats/common/killchain/killchain';
import { API } from '@/store/api';

import { Entity } from './entity';
import { AttackerInfrastructureAggregation } from './molecules/attacker-infrastructure/attacker-infrastructure.schema';
import { getESParams } from './molecules/attacker-infrastructure/attacker-infrastructure.utils';

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
        url: `/appliances/threat/threats_per_asset/`,
        method: 'GET',
        params: buildQueryParams(params),
      }),
      providesTags: ['Reload', 'Entities'],
    }),
    getImpactedEntity: builder.query<
      Entity | undefined,
      Dates & Tenant & { asset: string }
    >({
      query: (params) => ({
        url: `/appliances/threat/threats_per_asset/`,
        method: 'GET',
        params: buildQueryParams(params),
      }),
      transformResponse: (response: Paginated<Entity>) => {
        if (!response.results.length) return undefined;
        if (response.results.length === 1) return response.results[0];

        const getKillChainStep = (
          phase: keyof typeof killChainsConfig,
        ): number =>
          killChainsConfig[phase]?.kc_step ?? Number.NEGATIVE_INFINITY;
        const getHighestKillChain = (
          first: keyof typeof killChainsConfig,
          second: keyof typeof killChainsConfig,
        ) =>
          getKillChainStep(first) >= getKillChainStep(second) ? first : second;
        const getEarliestDate = (first: string, second: string) =>
          new Date(first).getTime() <= new Date(second).getTime()
            ? first
            : second;
        const getLatestDate = (first: string, second: string) =>
          new Date(first).getTime() >= new Date(second).getTime()
            ? first
            : second;

        return response.results.reduce((merged, current) => ({
          ...merged,
          first_seen: getEarliestDate(merged.first_seen, current.first_seen),
          last_seen: getLatestDate(merged.last_seen, current.last_seen),
          threats: [...merged.threats, ...current.threats],
          kill_chain: getHighestKillChain(
            merged.kill_chain,
            current.kill_chain,
          ),
          kill_chain_offender: getHighestKillChain(
            merged.kill_chain_offender,
            current.kill_chain_offender,
          ),
          is_offender: merged.is_offender || current.is_offender,
          status:
            merged.status === 'new' || current.status === 'new'
              ? 'new'
              : 'fixed',
        }));
      },
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
  useGetImpactedEntityQuery,
  useGetImpactedEntitiesQuery,
  useGetKillChainCountersQuery,
  useGetKillChainCountersByThreatIdQuery,
  useUpdateEntityStatusMutation,
  useGetAttackerInfrastructureQuery,
} = EntitiesAPI;
