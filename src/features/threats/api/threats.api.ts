import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { isNil } from 'ramda';

import { buildQueryParams } from '@/common/fetching/build-query-params';
import {
  DateRange,
  Paginated,
  Pagination,
  Tenant,
} from '@/common/fetching/fetching.types';
import { API } from '@/store/api';
import { applyOptimisticUpdateToAllCacheEntries } from '@/store/utils';

import { ActiveThreat } from '../model/active-threat';
import { ActiveThreatFamily } from '../model/active-threat-family';
import { Threat as DomainThreat } from '../model/threat';
import { ThreatFamily } from '../model/threat-family';
import { ThreatStatus } from '../model/threat-status';
import { ActiveThreatFamily as ActiveThreatFamilyDto } from './active-threat-family.dto';
import { toActiveThreatFamily } from './active-threat-family.transforms';
import { ActiveThreat as ActiveThreatDto } from './active-threat.dto';
import { toActiveThreat } from './active-threat.transforms';
import { ThreatFamily as ThreatFamilyDto } from './threat-family.dto';
import { toThreatFamily } from './threat-family.transforms';
import { ThreatStatus as ThreatStatusDto } from './threat-status.dto';
import { toThreatStatus } from './threat-status.transforms';
import { ThreatDto, ThreatPayloadDto } from './threat.dto';
import { toThreat } from './threat.transforms';

export type URLParams = Record<string, string>;

const threatsAdapter = createEntityAdapter<DomainThreat, number>({
  selectId: (threat) => threat.id,
});
const threatsInitialState = threatsAdapter.getInitialState();

const customThreatsAdapter = createEntityAdapter<DomainThreat, number>({
  selectId: (threat) => threat.id,
});
const customThreatsInitialState = customThreatsAdapter.getInitialState();

const activeThreatsAdapter = createEntityAdapter<ActiveThreat, number>({
  selectId: (threat) => threat.threatId,
});
const activeThreatsInitialState = activeThreatsAdapter.getInitialState();

const threatFamiliesAdapter = createEntityAdapter<ThreatFamily, number>({
  selectId: (family) => family.id,
});
const threatFamiliesInitialState = threatFamiliesAdapter.getInitialState();

const activeThreatFamiliesAdapter = createEntityAdapter<
  ActiveThreatFamily,
  number
>({
  selectId: (family) => family.id,
});
const activeThreatFamiliesInitialState =
  activeThreatFamiliesAdapter.getInitialState();

export const ThreatsAPI = API.injectEndpoints({
  overrideExisting: import.meta.env.VITE_APP_MODE === 'development',
  endpoints: (builder) => ({
    // QUERIES
    getThreatFamilies: builder.query<
      EntityState<ThreatFamily, number>,
      { family_class?: string; family_id?: string } & Tenant
    >({
      query: (params) => ({
        url: `/appliances/threat_family/`,
        method: 'GET',
        params: {
          ...params,
          event_view: false,
        },
      }),
      transformResponse(res: Paginated<ThreatFamilyDto>) {
        return threatFamiliesAdapter.setAll(
          threatFamiliesInitialState,
          res.results.map(toThreatFamily),
        );
      },
      providesTags: ['Reload', 'ThreatFamilies'],
    }),
    getActiveThreatFamilies: builder.query<
      EntityState<ActiveThreatFamily, number>,
      Tenant & DateRange & Partial<ThreatDto>
    >({
      query: (params) => ({
        url: `/appliances/threat_family/top_list/`,
        method: 'GET',
        params: {
          ...buildQueryParams(params),
        },
      }),
      transformResponse(res: ActiveThreatFamilyDto[]) {
        return activeThreatFamiliesAdapter.setAll(
          activeThreatFamiliesInitialState,
          res.map(toActiveThreatFamily),
        );
      },
      providesTags: ['Reload', 'ThreatFamilies'],
    }),
    getSTIThreats: builder.query<EntityState<DomainThreat, number>, void>({
      query: () => ({
        url: `/api/v2/appliances/threats/`,
        method: 'GET',
        params: {
          page_size: 10000,
          user_defined: false,
        },
      }),
      transformResponse(res: Paginated<ThreatDto>) {
        return threatsAdapter.setAll(
          threatsInitialState,
          res.results.map(toThreat),
        );
      },
      providesTags: ['Threats'],
    }),
    getCustomThreats: builder.query<EntityState<DomainThreat, number>, Tenant>({
      query: (params) => ({
        url: `/api/v2/appliances/threats/`,
        method: 'GET',
        params: {
          ...(!isNil(params.tenant) ? { tenant: params.tenant } : {}),
          user_defined: true,
        },
      }),
      transformResponse(res: Paginated<ThreatDto>) {
        return customThreatsAdapter.setAll(
          customThreatsInitialState,
          res.results.map(toThreat),
        );
      },
      providesTags: ['CustomThreats'],
    }),
    getThreatById: builder.query<DomainThreat, Tenant & { threatId: string }>({
      query: ({ threatId, ...rest }) => ({
        url: `/appliances/threat/${threatId}/`,
        method: 'GET',
        params: { event_view: false, ...buildQueryParams(rest) },
      }),
      transformResponse: (dto: ThreatDto) => toThreat(dto),
      providesTags: ['Threats'],
    }),
    getActiveThreats: builder.query<
      EntityState<ActiveThreat, number>,
      Tenant & DateRange & Partial<ThreatDto> & { family_id?: number }
    >({
      query: (params) => ({
        url: `/appliances/threat/top_list/`,
        method: 'GET',
        params: {
          ...buildQueryParams(params),
          page_size: 10000,
        },
      }),
      transformResponse(res: ActiveThreatDto[]) {
        return activeThreatsAdapter.setAll(
          activeThreatsInitialState,
          res.map(toActiveThreat),
        );
      },
      providesTags: ['Reload', 'ActiveThreats'],
    }),
    createThreat: builder.mutation<
      DomainThreat,
      ThreatPayloadDto & { family_class: string }
    >({
      query: ({ family_class, ...threat }) => ({
        url: `/appliances/threat/create_custom/?family_class=${family_class}`,
        method: 'POST',
        body: threat,
      }),
      transformResponse: (dto: ThreatDto) => toThreat(dto),
      async onQueryStarted(_arg, { dispatch, getState, queryFulfilled }) {
        try {
          const { data: createdThreat } = await queryFulfilled;
          const cachedArgs = ThreatsAPI.util.selectCachedArgsForQuery(
            getState(),
            'getCustomThreats',
          );
          cachedArgs.forEach((params: Tenant) => {
            dispatch(
              ThreatsAPI.util.updateQueryData(
                'getCustomThreats',
                params,
                (draft) => {
                  customThreatsAdapter.upsertOne(draft, createdThreat);
                },
              ),
            );
          });
        } catch {
          // No undo needed — insert only happens on success
        }
      },
      invalidatesTags: ['CustomThreats'],
    }),
    updateThreat: builder.mutation<
      DomainThreat,
      ThreatPayloadDto & { pk: number }
    >({
      query: ({ pk, ...threat }) => ({
        url: `/appliances/threat/${pk}/?event_view=false`,
        method: 'PATCH',
        body: threat,
      }),
      transformResponse: (dto: ThreatDto) => toThreat(dto),
      async onQueryStarted({ pk, ...patch }, api) {
        applyOptimisticUpdateToAllCacheEntries<
          ReturnType<typeof customThreatsAdapter.getInitialState>
        >(api, ThreatsAPI, 'getCustomThreats', (draft) => {
          customThreatsAdapter.updateOne(draft, {
            id: pk,
            changes: patch,
          });
        });
      },
      invalidatesTags: ['CustomThreats'],
    }),
    deleteThreat: builder.mutation<void, number>({
      query: (pk) => ({
        url: `/appliances/threat/${pk}/?event_view=false`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CustomThreats', 'Filter Actions'],
    }),
    getWorldMapOffendersCounts: builder.query<
      {
        res: { key: string; doc_count: number; offenders: { value: number } }[];
      },
      DateRange &
        Tenant & {
          status?: 'new' | 'fixed' | undefined;
        }
    >({
      query: (params) => ({
        url: `/appliances/threat/worldmap/`,
        method: 'GET',
        params: {
          status: 'new',
          ...buildQueryParams(params),
        },
      }),
      providesTags: ['Reload', 'Threats'],
    }),
    getThreatsStatus: builder.query<
      Paginated<ThreatStatus>,
      Pagination &
        Tenant & {
          asset?: string;
          threat_id?: number;
          ordering?: string;
          kill_chain?: string;
          first_seen__lte?: number;
          first_seen__gte?: number;
        }
    >({
      query: (params) => ({
        url: `/api/v2/appliances/threat-status/`,
        method: 'GET',
        params: buildQueryParams(params),
      }),
      transformResponse: (
        res: Paginated<ThreatStatusDto>,
      ): Paginated<ThreatStatus> => ({
        ...res,
        results: res.results.map(toThreatStatus),
      }),
      providesTags: ['Reload', 'Incidents'],
    }),
  }),
});

export const {
  useGetThreatFamiliesQuery,
  useGetActiveThreatFamiliesQuery,
  useGetActiveThreatsQuery,
  useCreateThreatMutation,
  useUpdateThreatMutation,
  useGetWorldMapOffendersCountsQuery,
  useGetThreatByIdQuery,
  useDeleteThreatMutation,
  useGetThreatsStatusQuery,
  useGetSTIThreatsQuery,
  useGetCustomThreatsQuery,
} = ThreatsAPI;
