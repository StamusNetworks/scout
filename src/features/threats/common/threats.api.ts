import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { isNil } from 'ramda';

import { buildQueryParams } from '@/common/fetching/buildQueryParams';
import {
  Dates,
  Paginated,
  Pagination,
  Tenant,
} from '@/common/fetching/fetching.types';
import { API } from '@/store/api';

import { ActiveThreatFamily } from './active-threat-family.model';
import { ActiveThreat } from './active-threat.model';
import { ThreatFamily } from './threat-family.model';
import { ThreatStatus } from './threat-status.schema';
import { Threat, ThreatPayload } from './threat.model';

export type URLParams = Record<string, string>;

const threatsAdapter = createEntityAdapter<Threat, number>({
  selectId: (threat) => threat.pk,
});
const threatsInitialState = threatsAdapter.getInitialState();

const customThreatsAdapter = createEntityAdapter<Threat, number>({
  selectId: (threat) => threat.pk,
});
const customThreatsInitialState = customThreatsAdapter.getInitialState();

const activeThreatsAdapter = createEntityAdapter<ActiveThreat, number>({
  selectId: (threat) => threat.threat_id,
});
const activeThreatsInitialState = activeThreatsAdapter.getInitialState();

const threatFamiliesAdapter = createEntityAdapter<ThreatFamily, number>({
  selectId: (threat) => threat.pk,
});
const threatFamiliesInitialState = threatFamiliesAdapter.getInitialState();

const activeThreatFamiliesAdapter = createEntityAdapter<
  ActiveThreatFamily,
  number
>({
  selectId: (threat) => threat.pk,
});
const activeThreatFamiliesInitialState =
  activeThreatFamiliesAdapter.getInitialState();

export const ThreatsAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    // QUERIES
    getThreatFamilies: builder.query<
      EntityState<ThreatFamily, number>,
      { family_class?: string; family_id?: string } & Partial<ThreatFamily> &
        Tenant
    >({
      query: (params) => ({
        url: `/appliances/threat_family/`,
        method: 'GET',
        params: {
          ...params,
          event_view: false,
        },
      }),
      transformResponse(res: Paginated<ThreatFamily>) {
        return threatFamiliesAdapter.setAll(
          threatFamiliesInitialState,
          res.results,
        );
      },
      providesTags: ['Reload', 'ThreatFamilies'],
    }),
    getActiveThreatFamilies: builder.query<
      EntityState<ActiveThreatFamily, number>,
      Tenant & Dates & Partial<Threat>
    >({
      query: (params) => ({
        url: `/appliances/threat_family/top_list/`,
        method: 'GET',
        params: {
          ...buildQueryParams(params),
        },
      }),
      transformResponse(res: ActiveThreatFamily[]) {
        return activeThreatFamiliesAdapter.setAll(
          activeThreatFamiliesInitialState,
          res,
        );
      },
      providesTags: ['Reload', 'ThreatFamilies'],
    }),
    getSTIThreats: builder.query<EntityState<Threat, number>, void>({
      query: () => ({
        url: `/api/v2/appliances/threats/`,
        method: 'GET',
        params: {
          page_size: 10000,
          user_defined: false,
        },
      }),
      transformResponse(res: Paginated<Threat>) {
        return threatsAdapter.setAll(threatsInitialState, res.results);
      },
      providesTags: ['Threats'],
    }),
    getCustomThreats: builder.query<EntityState<Threat, number>, Tenant>({
      query: (params) => ({
        url: `/api/v2/appliances/threats/`,
        method: 'GET',
        params: {
          ...(!isNil(params.tenant) ? { tenant: params.tenant } : {}),
          user_defined: true,
        },
      }),
      transformResponse(res: Paginated<Threat>) {
        return customThreatsAdapter.setAll(
          customThreatsInitialState,
          res.results,
        );
      },
      providesTags: ['CustomThreats'],
    }),
    getThreatById: builder.query<Threat, Tenant & { threatId: string }>({
      query: ({ threatId, ...rest }) => ({
        url: `/appliances/threat/${threatId}/`,
        method: 'GET',
        params: { event_view: false, ...buildQueryParams(rest) },
      }),
      providesTags: ['Threats'],
    }),
    getActiveThreats: builder.query<
      EntityState<ActiveThreat, number>,
      Tenant & Dates & Partial<Threat> & { family_id?: number }
    >({
      query: (params) => ({
        url: `/appliances/threat/top_list/`,
        method: 'GET',
        params: {
          ...buildQueryParams(params),
          page_size: 10000,
        },
      }),
      transformResponse(res: ActiveThreat[]) {
        return activeThreatsAdapter.setAll(activeThreatsInitialState, res);
      },
      providesTags: ['Reload', 'ActiveThreats'],
    }),
    createThreat: builder.mutation<
      Threat,
      ThreatPayload & { family_class: string }
    >({
      query: ({ family_class, ...threat }) => ({
        url: `/appliances/threat/create_custom/?family_class=${family_class}`,
        method: 'POST',
        body: threat,
      }),
      invalidatesTags: ['CustomThreats'],
    }),
    updateThreat: builder.mutation<Threat, ThreatPayload & { pk: number }>({
      query: ({ pk, ...threat }) => ({
        url: `/appliances/threat/${pk}/?event_view=false`,
        method: 'PATCH',
        body: threat,
      }),
      invalidatesTags: ['CustomThreats'],
    }),
    deleteThreat: builder.mutation<void, number>({
      query: (pk) => ({
        url: `/appliances/threat/${pk}/?event_view=false`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CustomThreats'],
    }),
    getWorldMapOffendersCounts: builder.query<
      {
        res: { key: string; doc_count: number; offenders: { value: number } }[];
      },
      Dates &
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
