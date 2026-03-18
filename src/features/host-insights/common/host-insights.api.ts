import { isNil } from 'ramda';
import { z } from 'zod';

import { buildQueryParams } from '@/common/fetching/buildQueryParams';
import { Dates, QFilter, Tenant } from '@/common/fetching/fetching.types';
import { Paginated, Pagination } from '@/common/fetching/fetching.types';
import { Aggregation } from '@/common/lib/aggregation';
import { API } from '@/store/api';

import { Host } from './host.model';

export type URLParams = Record<string, string>;

export const aggSchema = z.object({
  took: z.number(),
  timed_out: z.boolean(),
  _shards: z.object({
    total: z.number(),
    successful: z.number(),
    skipped: z.number(),
    failed: z.number(),
  }),
  hits: z.object({
    total: z.object({
      value: z.number(),
      relation: z.string(),
    }),
    max_score: z.number().nullish(),
    hits: z.array(z.object({})),
  }),
  aggregations: z.object({
    roles: z.object({
      doc_count_error_upper_bound: z.number(),
      sum_other_doc_count: z.number(),
      buckets: z.array(
        z.object({
          key: z.string(),
          doc_count: z.number(),
        }),
      ),
    }),
    services: z.object({
      buckets: z.object({
        '0.0-1.0': z.object({
          from: z.number(),
          to: z.number(),
          doc_count: z.number(),
        }),
        '1.0-*': z.object({
          from: z.number(),
          doc_count: z.number(),
        }),
      }),
    }),
  }),
});

export type HostsCountsAggregation = z.infer<typeof aggSchema>;

export const getCustomFilter = (start_date: number, end_date: number) => ({
  bool: {
    should: [
      {
        range: {
          'host_id.first_seen': {
            gte: start_date,
            lte: end_date,
          },
        },
      },
      {
        range: {
          'host_id.last_seen': {
            gte: start_date,
            lte: end_date,
          },
        },
      },
      {
        bool: {
          must: [
            { range: { 'host_id.first_seen': { lte: start_date } } },
            { range: { 'host_id.last_seen': { gte: end_date } } },
          ],
        },
      },
    ],
    minimum_should_match: 1,
  },
});

export const getAggregationBody = (
  tenant: number | undefined,
  inHomeNetwork: 'true' | 'false' | 'all',
  customFilter?: object,
) => ({
  index: !isNil(tenant) ? `host_id-${tenant}` : 'logstash-host_id',
  size: 0,
  qfilter:
    inHomeNetwork === 'all' ? '*' : `host_id.in_home_net: ${inHomeNetwork}`,
  aggs: {
    aggs: {
      roles: {
        terms: {
          field: 'host_id.roles.name.keyword',
          order: {
            _count: 'desc',
          },
          size: 10,
        },
      },
      services: {
        range: {
          field: 'host_id.services_count',
          ranges: [
            {
              to: 1,
              from: 0,
            },
            {
              from: 1,
            },
          ],
          keyed: true,
        },
      },
    },
  },
  ...(customFilter
    ? { custom_filter: customFilter }
    : { time_filter: 'host_id.last_seen' }),
});

export const HostsAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    // QUERIES
    getHosts: builder.query<
      Paginated<Host>,
      Pagination & Dates & Tenant & QFilter & { withAlerts?: boolean }
    >({
      query: ({ withAlerts, ...params }) => ({
        url: `/appliances/host_id${withAlerts ? '_alerts' : ''}/`,
        method: 'GET',
        params: {
          highlight: 'true',
          ...buildQueryParams(params),
        },
      }),
      providesTags: ['Reload', 'Hosts'],
    }),
    getHostsWithAlerts: builder.query<
      Paginated<Host>,
      Pagination & Dates & Tenant & QFilter & { highlight?: boolean }
    >({
      query: (params) => ({
        url: `/appliances/host_id_alerts/`,
        method: 'GET',
        params: {
          highlight: 'true',
          ...buildQueryParams(params),
        },
      }),
      providesTags: ['Reload', 'Hosts'],
    }),
    getHostWithAlerts: builder.query<Host, Tenant & { entity: string }>({
      query: ({ entity, ...rest }) => ({
        url: `/appliances/host_id/${entity}`,
        method: 'GET',
        params: buildQueryParams(rest),
      }),
      providesTags: ['Reload', 'Hosts'],
    }),
    fetchHostsCounts: builder.query<
      {
        activeHostsCount: number;
        hostsWithServicesCount: number;
        domainControllersCount: number;
        dhcpServersCount: number;
        httpProxiesCount: number;
        printersCount: number;
      },
      Tenant & Dates & { body: ReturnType<typeof getAggregationBody> }
    >({
      query: (params) => ({
        url: `/rules/es/search/`,
        method: 'POST',
        body: params.body,
        params: buildQueryParams(params, { time_format: 'elastic' }),
      }),
      transformResponse: (data: HostsCountsAggregation) => ({
        activeHostsCount:
          (data?.aggregations?.services?.buckets['0.0-1.0']?.doc_count || 0) +
          (data?.aggregations?.services?.buckets['1.0-*']?.doc_count || 0),
        hostsWithServicesCount:
          data?.aggregations?.services?.buckets['1.0-*']?.doc_count || 0,
        domainControllersCount:
          data?.aggregations?.roles?.buckets.find(
            (b) => b.key === 'domain controller',
          )?.doc_count || 0,
        dhcpServersCount:
          data?.aggregations?.roles?.buckets.find((b) => b.key === 'dhcp')
            ?.doc_count || 0,
        httpProxiesCount:
          data?.aggregations?.roles?.buckets.find((b) => b.key === 'http proxy')
            ?.doc_count || 0,
        printersCount:
          data?.aggregations?.roles?.buckets.find((b) => b.key === 'printer')
            ?.doc_count || 0,
      }),
      providesTags: ['Reload', 'Hosts'],
    }),
    getNetworkTree: builder.query<
      {
        key: string;
        ips_count: number;
        roles_count: number;
        hostnames_count: number;
        usernames_count: number;
        services_count: number;
      }[],
      Tenant & Dates & QFilter
    >({
      query: ({ start_date, end_date, host_id_qfilter, ...params }) => ({
        url: `/rules/es/search/`,
        method: 'POST',
        params: buildQueryParams(params, { time_format: 'elastic' }),
        body: {
          index:
            params.tenant === undefined
              ? 'logstash-host_id'
              : `host_id-${params.tenant}`,
          size: 0,
          qfilter: host_id_qfilter || '*',
          custom_filter: getCustomFilter(start_date!, end_date!),
          aggs: {
            aggs: {
              network_nodes: {
                terms: {
                  field: 'host_id.net_info.agg.keyword',
                  size: 1000,
                  missing: 'Undefined Network',
                },
                aggs: {
                  unique_ips: {
                    cardinality: {
                      field: 'ip',
                    },
                  },
                  total_roles: {
                    sum: {
                      field: 'host_id.roles_count',
                    },
                  },
                  total_hostnames: {
                    sum: {
                      field: 'host_id.hostname_count',
                    },
                  },
                  total_usernames: {
                    sum: {
                      field: 'host_id.username_count',
                    },
                  },
                  total_services: {
                    sum: {
                      field: 'host_id.services_count',
                    },
                  },
                },
              },
            },
          },
        },
      }),
      transformResponse: (
        data: Aggregation<{
          network_nodes: {
            doc_count_error_upper_bound: number;
            sum_other_doc_count: number;
            buckets: {
              key: string;
              doc_count: number;
              total_roles: {
                value: number;
              };
              total_hostnames: {
                value: number;
              };
              total_usernames: {
                value: number;
              };
              total_services: {
                value: number;
              };
              unique_ips: {
                value: number;
              };
            }[];
          };
        }>,
      ) =>
        data.aggregations.network_nodes.buckets.map((bucket) => ({
          key: bucket.key,
          ips_count: bucket.unique_ips.value,
          roles_count: bucket.total_roles.value,
          hostnames_count: bucket.total_hostnames.value,
          usernames_count: bucket.total_usernames.value,
          services_count: bucket.total_services.value,
        })),
      providesTags: ['Reload', 'Hosts'],
    }),
  }),
});

export const {
  useGetHostsQuery,
  useGetHostsWithAlertsQuery,
  useGetHostWithAlertsQuery,
  useFetchHostsCountsQuery,
  useGetNetworkTreeQuery,
} = HostsAPI;
