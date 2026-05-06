import { DataEntry } from '@/common/design-system/molecules/value-list-card';
import { buildQueryParams } from '@/common/fetching/build-query-params';
import {
  DateRange,
  Pagination,
  QFilter,
  Tenant,
} from '@/common/fetching/fetching.types';
import { API } from '@/store/api';

type Fields = {
  fields?: string;
};

export type URLParams = Pagination &
  Tenant &
  Fields &
  QFilter &
  DateRange & {
    investigation?: { key: string; value: string };
  };

export const DashboardAPI = API.injectEndpoints({
  overrideExisting: import.meta.env.VITE_APP_MODE === 'development',
  endpoints: (builder) => ({
    // QUERIES
    getDashboardFields: builder.query<Record<string, DataEntry[]>, URLParams>({
      query: ({ pageSize, ...params }: URLParams) => ({
        url: `/rules/es/fields_stats`,
        method: 'GET',
        params: {
          ...buildQueryParams(params),
          ...(pageSize === 0 ? {} : { page_size: pageSize || 5 }),
        },
      }),
      providesTags: ['Reload', 'Dashboard'],
    }),
    getGlobalStats: builder.query<GlobalStats, URLParams>({
      query: (params: URLParams) => ({
        url: `/appliances/threat_family/global_stats`,
        method: 'GET',
        params: buildQueryParams(params),
      }),
      transformResponse: (response: GlobalStatsResponse) => ({
        ...response,
        nb_assets_threat:
          response.nb_assets_threat_victim +
          response.nb_assets_threat_attacker -
          response.nb_assets_threat_both,
        nb_discovered:
          response.nb_discovered_threats + response.nb_discovered_policies,
      }),
      providesTags: ['Reload', 'OpCenter'],
    }),
  }),
});

export const { useGetDashboardFieldsQuery, useGetGlobalStatsQuery } =
  DashboardAPI;

type GlobalStatsResponse = {
  volumetry: number;
  nb_events: number;
  nb_discovered_threats: number;
  nb_discovered_policies: number;
  nb_assets_threat_victim: number;
  nb_assets_threat_attacker: number;
  nb_assets_threat_both: number;
  nb_assets_policy: number;
  nb_threats: number;
  nb_policies: number;
};

export type GlobalStats = GlobalStatsResponse & {
  nb_assets_threat: number;
  nb_discovered: number;
};
