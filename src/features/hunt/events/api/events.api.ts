import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { buildQueryParams } from '@/common/fetching/buildQueryParams';
import {
  Dates,
  Ordering,
  QFilter,
  Tenant,
} from '@/common/fetching/fetching.types';
import { Paginated, Pagination } from '@/common/fetching/fetching.types';
import { API } from '@/store/api';

import { EventTypes } from '../../filtering/query-filters/store/query-filters.slice';
import { Event } from '../model/event.schema';
import { EventsTimeline } from '../model/events-timeline.schema';
import {
  FlowEventFileRetrieve,
  FlowEventFileStatus,
  FlowEvents,
} from '../model/flowEvent.schema';

export const EventsAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    // QUERIES
    getEvents: builder.query<
      Paginated<Event>,
      Pagination & Dates & Tenant & QFilter
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
        Dates & {
          hosts?: string;
          prev?: number;
        } & QFilter &
        EventTypes
    >({
      query: (params) => ({
        url: `/rules/es/alerts_count`,
        method: 'GET',
        params: buildQueryParams(params, { time_format: 'elastic' }),
      }),
      providesTags: ['Reload', 'OpCenter'],
    }),
    getEventsFromFlow: builder.query<FlowEvents, Dates & Tenant & QFilter>({
      query: (params) => {
        return {
          url: `/rules/es/events_from_flow_id/`,
          method: 'GET',
          params: buildQueryParams(params, { time_format: 'elastic' }),
        };
      },
      providesTags: ['Reload'],
    }),
    getEventFilesInfo: builder.query<
      FlowEventFileStatus[],
      Dates & Array<{ host: string; sha256: string }>
    >({
      queryFn: async (params, _api, _extraOptions, baseQuery) => {
        try {
          // Generate the list of requests using the provided `baseQuery`
          const requests = params.map(({ host, sha256 }) =>
            baseQuery({
              url: `/rules/filestore/${sha256}/status/?host=${host}`,
              method: 'GET',
            }),
          );

          // Await all the baseQuery promises
          const results = await Promise.all(requests);

          // Extract the data or handle errors as necessary
          const data = results.map((result) => {
            if (result.error) {
              throw result.error;
            }
            // Ensure the data matches the expected type
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
    getEventsTail: builder.query<
      Paginated<Event>,
      QFilter & Dates & Tenant & Ordering & Pagination
    >({
      query: (params) => ({
        url: `/rules/es/events_tail/`,
        method: 'GET',
        params: buildQueryParams(params),
      }),
      providesTags: ['Reload'],
    }),
    getEventsTimeline: builder.query<
      { time: number; count: number }[],
      QFilter &
        Dates &
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
} = EventsAPI;
