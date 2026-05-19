import { buildQueryParams } from '@/common/fetching/build-query-params';
import { API } from '@/store/api';

import type { ResolvedQuery } from '../builders/build-query-params';

type PerQueryResult = {
  data?: { results?: unknown[] };
  isError?: boolean;
  errorReason?: 'FILTERSET_MISSING' | 'FETCH_FAILED';
};

export type HuntingTrailResultMap = Record<string, PerQueryResult>;

type GetHuntingTrailArg = {
  from: number | undefined;
  to: number | undefined;
  tenant: number | undefined;
  resolvedQueries: ResolvedQuery[];
};

const endpointPath = (endpoint: 'alerts_tail' | 'events_tail') =>
  endpoint === 'alerts_tail'
    ? '/rules/es/alerts_tail'
    : '/rules/es/events_tail/';

export const HuntingTrailAPI = API.injectEndpoints({
  overrideExisting: import.meta.env.VITE_APP_MODE === 'development',
  endpoints: (builder) => ({
    getHuntingTrail: builder.query<HuntingTrailResultMap, GetHuntingTrailArg>({
      // Cache key includes resolvedQueries via RTK's default arg
      // serialization. The hook layer memoizes the resolved array, so
      // identity is stable when filtersets + additionalFilter haven't
      // changed — preserve that contract upstream.
      queryFn: async (arg, _api, _extraOptions, baseQuery) => {
        const runOne = async (
          q: ResolvedQuery,
        ): Promise<readonly [string, PerQueryResult]> => {
          if (q.isMissing) {
            return [
              q.id,
              { isError: true, errorReason: 'FILTERSET_MISSING' as const },
            ] as const;
          }
          const url = endpointPath(q.endpoint);
          const params = buildQueryParams(
            {
              from: arg.from,
              to: arg.to,
              tenant: arg.tenant,
              qfilter: q.qfilter,
              page: 1,
              pageSize: 10000,
              // Event-type flags + host_id_qfilter are flat wire fields the
              // events endpoints already accept (see useFilterSetQueryParams).
              // buildQueryParams funnels unknown keys through its `rest`
              // passthrough.
              ...({
                alert: q.eventTypeFlags.alert,
                stamus: q.eventTypeFlags.stamus,
                discovery: q.eventTypeFlags.discovery,
                ...(q.hostIdQfilter
                  ? { host_id_qfilter: q.hostIdQfilter }
                  : {}),
              } as Record<string, boolean | string>),
            },
            q.endpoint === 'alerts_tail'
              ? { time_format: 'elastic' }
              : undefined,
          );
          try {
            const response = await baseQuery({ url, method: 'GET', params });
            if (response.error) {
              return [
                q.id,
                {
                  isError: true,
                  errorReason: 'FETCH_FAILED' as const,
                },
              ] as const;
            }
            return [
              q.id,
              { data: response.data as { results?: unknown[] } },
            ] as const;
          } catch {
            return [
              q.id,
              { isError: true, errorReason: 'FETCH_FAILED' as const },
            ] as const;
          }
        };
        const settled = await Promise.allSettled(
          arg.resolvedQueries.map(runOne),
        );
        const entries = settled.map((r): readonly [string, PerQueryResult] =>
          r.status === 'fulfilled'
            ? r.value
            : [
                'unknown',
                { isError: true, errorReason: 'FETCH_FAILED' as const },
              ],
        );
        return { data: Object.fromEntries(entries) };
      },
      providesTags: ['Reload', 'Dashboard'],
    }),
  }),
});

export const { useGetHuntingTrailQuery } = HuntingTrailAPI;
