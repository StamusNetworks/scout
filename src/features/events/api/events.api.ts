import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { buildQueryParams } from '@/common/fetching/buildQueryParams';
import { ENDPOINTS } from '@/common/fetching/fetch.endpoints';
import {
  DateRange,
  Ordering,
  Paginated,
  Pagination,
  QFilter,
  Tenant,
} from '@/common/fetching/fetching.types';
import { esEscape } from '@/common/lib/strings';
import {
  BeaconingEvent,
  TlsTail,
} from '@/features/events/model/beaconing-event';
import { CountsTimeline } from '@/features/events/model/counts-timeline';
import { Event } from '@/features/events/model/event';
import { EventsTimeline } from '@/features/events/model/events-timeline.schema';
import {
  FlowEventFileRetrieve,
  FlowEventFileStatus,
  FlowEvents,
} from '@/features/events/model/flow-event.schema';
import { type EventTypeFlags } from '@/features/query-filters';
import { API } from '@/store/api';

/**
 * Single API surface for the events context. Wraps every endpoint that
 * reads from the `logstash-*` index family — alert/IDS events, NSM/protocol
 * events, sightings (discovery), beaconing reports, files/pcaps, and
 * aggregations. Endpoint URLs reflect the legacy server vocabulary
 * (`/alerts_tail`, `/events_tail`); domain-language renames will land
 * with the model+ACL phase.
 */
export const EventsAPI = API.injectEndpoints({
  overrideExisting: import.meta.env.VITE_APP_MODE === 'development',
  endpoints: (builder) => ({
    // === IDS events (alert / stamus / discovery) ===
    getEvents: builder.query<
      Paginated<Event>,
      Pagination & DateRange & Tenant & QFilter
    >({
      query: (params) => ({
        url: `/rules/es/alerts_tail`,
        method: 'GET',
        params: buildQueryParams(params, { time_format: 'elastic' }),
      }),
      providesTags: ['Reload', 'Dashboard'],
    }),
    getEventsCount: builder.query<
      { prev_doc_count: number; doc_count: number },
      Tenant &
        DateRange & {
          hosts?: string;
          prev?: number;
        } & QFilter &
        Partial<EventTypeFlags>
    >({
      query: (params) => ({
        url: `/rules/es/alerts_count`,
        method: 'GET',
        params: buildQueryParams(params, { time_format: 'elastic' }),
      }),
      providesTags: ['Reload', 'OpCenter'],
    }),
    getEventsTimeline: builder.query<
      { time: number; count: number }[],
      QFilter &
        DateRange &
        Tenant & {
          interval?: number;
        }
    >({
      query: (params) => ({
        url: `/rules/es/events_timeline/`,
        method: 'GET',
        params: buildQueryParams(params),
      }),
      transformResponse: (data: EventsTimeline) =>
        data.aggregations.date.buckets.map((bucket) => ({
          time: bucket.key,
          count: bucket.doc_count,
        })),
      providesTags: ['Reload'],
    }),

    // === NSM / protocol events ===
    getEventsTail: builder.query<
      Paginated<Event>,
      QFilter & DateRange & Tenant & Ordering & Pagination
    >({
      query: (params) => ({
        url: `/rules/es/events_tail/`,
        method: 'GET',
        params: buildQueryParams(params),
      }),
      providesTags: ['Reload'],
    }),
    getEventsFromFlow: builder.query<FlowEvents, DateRange & Tenant & QFilter>({
      query: (params) => ({
        url: `/rules/es/events_from_flow_id/`,
        method: 'GET',
        params: buildQueryParams(params, { time_format: 'elastic' }),
      }),
      providesTags: ['Reload'],
    }),

    // === Sightings (discovery) ===
    getSightingEvents: builder.query<
      Paginated<Event>,
      QFilter & DateRange & Tenant & Pagination
    >({
      query: (params) => ({
        url: `appliances/es_discovery_events/`,
        method: 'GET',
        params: buildQueryParams(params),
      }),
      providesTags: ['Reload', 'Beaconing'],
    }),

    // === Beaconing reports ===
    getBeaconingEvents: builder.query<
      Paginated<BeaconingEvent>,
      QFilter & DateRange & Tenant & Pagination & Ordering
    >({
      query: (params) => ({
        url: `appliances/es_beaconing_events/`,
        method: 'GET',
        params: buildQueryParams(params),
      }),
      providesTags: ['Reload', 'Beaconing'],
    }),
    getTlsTail: builder.query<
      Paginated<TlsTail>,
      QFilter & DateRange & Tenant & Pagination
    >({
      query: (params) => ({
        url: `rules/es/tls_tail/`,
        method: 'GET',
        params: buildQueryParams(params),
      }),
      providesTags: ['Reload', 'Beaconing'],
    }),

    // === Files & pcaps ===
    getEventFilesInfo: builder.query<
      FlowEventFileStatus[],
      DateRange & Array<{ host: string; sha256: string }>
    >({
      queryFn: async (params, _api, _extraOptions, baseQuery) => {
        try {
          const requests = params.map(({ host, sha256 }) =>
            baseQuery({
              url: `/rules/filestore/${sha256}/status/?host=${host}`,
              method: 'GET',
            }),
          );
          const results = await Promise.all(requests);
          const data = results.map((result) => {
            if (result.error) {
              throw result.error;
            }
            return result.data as FlowEventFileStatus;
          });
          return { data };
        } catch (error) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              data:
                error instanceof Error
                  ? error.message
                  : 'An unknown error occurred',
            } as FetchBaseQueryError,
          };
        }
      },
      providesTags: ['Reload'],
    }),
    getEventFileRetrieve: builder.query<
      FlowEventFileRetrieve,
      { host: string; sha256: string }
    >({
      query: (params) => ({
        url: `/rules/filestore/${params.sha256}/retrieve/?host=${params.host}`,
        method: 'GET',
      }),
      providesTags: ['Reload'],
    }),
    uploadAlertToProbe: builder.mutation<
      { data: { upload: string } },
      { host: string; event: FormData }
    >({
      query: ({ host, event }) => ({
        url: `/rules/filestore_pcap/upload/?host=${host}`,
        method: 'POST',
        body: event,
      }),
    }),
    requestPcapExtraction: builder.mutation<
      { data: { extraction: string } },
      { host: string; eventId: string }
    >({
      query: ({ eventId, host }) => ({
        url: `/rules/filestore_pcap/${eventId}/extract_pcap/?host=${host}`,
        method: 'POST',
      }),
    }),
    requestPcapUpload: builder.mutation<
      { data: { retrieve: string } },
      { host: string; eventId: string }
    >({
      query: ({ host, eventId }) => ({
        url: `/rules/filestore_pcap/${eventId}/retrieve/?host=${host}`,
        method: 'GET',
      }),
    }),

    // === Aggregations ===
    getProtocolsFromEvents: builder.query<
      string[],
      DateRange & Tenant & { qfilter?: string }
    >({
      query: ({ qfilter, tenant, ...rest }) => {
        const qfilterParts: string[] = [];
        if (qfilter) qfilterParts.push(qfilter);
        qfilterParts.push(
          '(event_type:alert OR event_type:discovery OR event_type:stamus)',
        );
        if (tenant !== undefined)
          qfilterParts.push(`tenant:${esEscape(String(tenant))}`);
        return {
          url: `/rules/es/search/`,
          method: 'POST',
          params: buildQueryParams(rest, { time_format: 'elastic' }),
          body: {
            index: 'logstash-*',
            size: 0,
            tenant,
            qfilter: qfilterParts.join(' AND '),
            aggs: {
              aggs: {
                protocols: {
                  terms: { field: 'app_proto.keyword', size: 20 },
                },
              },
            },
          },
        };
      },
      transformResponse: (data: {
        aggregations: {
          protocols: { buckets: { key: string; doc_count: number }[] };
        };
      }) => {
        const blacklist = new Set(['failed', 'unknown']);
        return data.aggregations.protocols.buckets
          .map((b) => b.key)
          .filter((key) => !blacklist.has(key));
      },
      providesTags: ['Reload'],
    }),
    getEventsAggregation: builder.query<
      { aggregations: Record<string, unknown> },
      DateRange & Tenant & { qfilter?: string; aggs: Record<string, unknown> }
    >({
      query: ({ aggs, qfilter, tenant, ...rest }) => {
        const qfilterParts: string[] = [];
        if (qfilter) qfilterParts.push(qfilter);
        if (tenant !== undefined)
          qfilterParts.push(`tenant:${esEscape(String(tenant))}`);
        return {
          url: `/rules/es/search/`,
          method: 'POST',
          params: buildQueryParams(rest, { time_format: 'elastic' }),
          body: {
            index: 'logstash-*',
            size: 0,
            tenant,
            qfilter: qfilterParts.join(' AND '),
            aggs,
          },
        };
      },
      providesTags: ['Reload'],
    }),
    getCountsTimeline: builder.query<
      CountsTimeline,
      Tenant & DateRange & QFilter & { target: string }
    >({
      query: (params) => ({
        url: `${ENDPOINTS.TIMELINE.url}/?hosts=*`,
        method: 'GET',
        params: buildQueryParams(params),
      }),
      providesTags: ['Reload', 'Dashboard'],
    }),
  }),
});

export const {
  useGetEventsQuery,
  useGetEventsCountQuery,
  useGetEventsFromFlowQuery,
  useGetEventFilesInfoQuery,
  useLazyGetEventFileRetrieveQuery,
  useGetEventsTailQuery,
  useGetEventsTimelineQuery,
  useUploadAlertToProbeMutation,
  useRequestPcapExtractionMutation,
  useRequestPcapUploadMutation,
  useGetProtocolsFromEventsQuery,
  useGetEventsAggregationQuery,
  useGetSightingEventsQuery,
  useGetBeaconingEventsQuery,
  useGetTlsTailQuery,
  useGetCountsTimelineQuery,
} = EventsAPI;
