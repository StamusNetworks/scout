import { buildQueryParams } from '@/common/fetching/build-query-params';
import { DateRange, Tenant } from '@/common/fetching/fetching.types';
import { Paginated, Pagination } from '@/common/fetching/fetching.types';
import { API } from '@/store/api';

import { getESParams } from '../components/attacker-infrastructure/attacker-infrastructure.utils';
import { ImpactedEntity } from '../model/impacted-entity';
import {
  KILL_CHAIN_PHASES,
  KillChainCountersData,
  KillChainPhase,
} from '../model/kill-chain';
import { AttackerInfrastructureAggregation } from './attacker-infrastructure.dto';
import { ImpactedEntityDto } from './impacted-entity.dto';
import {
  toImpactedEntity,
  toKillChainCounters,
} from './impacted-entity.transforms';

export const EntitiesAPI = API.injectEndpoints({
  overrideExisting: import.meta.env.VITE_APP_MODE === 'development',
  endpoints: (builder) => ({
    // QUERIES
    getImpactedEntities: builder.query<
      Paginated<ImpactedEntity>,
      DateRange &
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
      transformResponse: (
        res: Paginated<ImpactedEntityDto>,
      ): Paginated<ImpactedEntity> => ({
        ...res,
        results: res.results.map(toImpactedEntity),
      }),
      providesTags: ['Reload', 'Entities'],
    }),
    getImpactedEntity: builder.query<
      ImpactedEntity | undefined,
      DateRange & Tenant & { asset: string }
    >({
      query: (params) => ({
        url: `/appliances/threat/threats_per_asset/`,
        method: 'GET',
        params: buildQueryParams(params),
      }),
      transformResponse: (response: Paginated<ImpactedEntityDto>) => {
        if (!response.results.length) return undefined;
        const entities = response.results.map(toImpactedEntity);
        if (entities.length === 1) return entities[0];

        const stepOf = (phase: KillChainPhase): number =>
          KILL_CHAIN_PHASES[phase]?.step ?? Number.NEGATIVE_INFINITY;
        const highestPhase = (a: KillChainPhase, b: KillChainPhase) =>
          stepOf(a) >= stepOf(b) ? a : b;
        // ISO 8601 strings sort lexicographically as chronologically.
        const earliest = (a: string, b: string) => (a <= b ? a : b);
        const latest = (a: string, b: string) => (a >= b ? a : b);

        return entities.reduce((merged, current) => ({
          ...merged,
          firstSeen: earliest(merged.firstSeen, current.firstSeen),
          lastSeen: latest(merged.lastSeen, current.lastSeen),
          threats: [...merged.threats, ...current.threats],
          phase: highestPhase(merged.phase, current.phase),
          offenderPhase: highestPhase(
            merged.offenderPhase,
            current.offenderPhase,
          ),
          isOffender: merged.isOffender || current.isOffender,
          status:
            merged.status === 'new' || current.status === 'new'
              ? 'new'
              : 'fixed',
        }));
      },
    }),
    getKillChainCounters: builder.query<
      KillChainCountersData,
      DateRange & Tenant & { family_id?: string }
    >({
      query: (params) => ({
        url: `/appliances/threat_family/kill_chain_family/`,
        method: 'GET',
        params: buildQueryParams(params),
      }),
      transformResponse: (
        res: { kill_chain: KillChainPhase; nb_assets: number }[],
      ) => toKillChainCounters(res),
      providesTags: ['Reload', 'Dashboard'],
    }),
    getKillChainCountersByThreatId: builder.query<
      KillChainCountersData,
      DateRange & Tenant & { threat_id: string }
    >({
      query: ({ threat_id, ...rest }) => ({
        url: `/appliances/threat/${threat_id}/kill_chain/`,
        method: 'GET',
        params: buildQueryParams(rest),
      }),
      transformResponse: (
        response: Partial<Record<KillChainPhase, number>>,
      ): KillChainCountersData => response,
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
      DateRange & Tenant & { asset: string }
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
