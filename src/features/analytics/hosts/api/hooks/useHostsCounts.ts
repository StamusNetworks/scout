import { isNil } from 'ramda';
import { z } from 'zod';

import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { selectDates } from '@/features/hunt/filtering/dates-filters/dates-filters';
import { useAppSelector } from '@/store/store';

import { useFetchHostsCountsQuery } from '../hosts.api';

export const useFetchHostsCounts = ({
  inHomeNetwork,
}: {
  inHomeNetwork: 'true' | 'false' | 'all';
}) => {
  const dateFilters = useAppSelector(selectDates);
  const { tenant, start_date, end_date } = useGlobalQueryParams([
    'tenant',
    'dates',
  ]);
  const customFilter =
    dateFilters.type === 'range'
      ? getCustomFilter(start_date!, end_date!)
      : undefined;
  const agg = getAggregationBody(tenant, inHomeNetwork, customFilter);

  return useFetchHostsCountsQuery({
    body: agg,
    start_date,
    end_date,
    tenant,
  });
};

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
