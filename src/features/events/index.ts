// Domain types
export type { Event } from './model/event';
export type { BeaconingEvent, TlsTail } from './model/beaconing-event';
export type { CountsTimeline } from './model/counts-timeline';
export type {
  FlowEvents,
  FlowEventFileStatus,
  FlowEventFileRetrieve,
  RelatedEvent,
} from './model/flow-event.schema';

// Mocks (test fixtures — colocated with the model they fixture)
export {
  makeEvent,
  makeNrdEvent,
  makeSightingEvent,
  makeSightingApiEvent,
  makeFileEvent,
  makeLateralEvent,
  makeHuntingEvent,
} from './model/event.mocks';

// API hooks (RTK Query)
export {
  // IDS events
  useGetEventsQuery,
  useGetEventsCountQuery,
  useGetEventsTimelineQuery,
  // NSM / protocol
  useGetEventsTailQuery,
  useGetEventsFromFlowQuery,
  // Sightings
  useGetSightingEventsQuery,
  // Beaconing
  useGetBeaconingEventsQuery,
  useGetTlsTailQuery,
  // Files & pcaps
  useGetEventFilesInfoQuery,
  useLazyGetEventFileRetrieveQuery,
  useUploadAlertToProbeMutation,
  useRequestPcapExtractionMutation,
  useRequestPcapUploadMutation,
  // Aggregations
  useGetProtocolsFromEventsQuery,
  useGetEventsAggregationQuery,
  useGetCountsTimelineQuery,
} from './api/events.api';
export type { GlobalStats } from './api/dashboard.api';
export {
  useGetDashboardFieldsQuery,
  useGetGlobalStatsQuery,
} from './api/dashboard.api';

// Custom hooks
export { useEvents } from './hooks/use-events';
export { useEventsCount } from './hooks/use-events-count';
export { useCountsTimeline } from './hooks/use-counts-timeline';
export { useEventDetailData } from './hooks/use-event-detail-data';
export { useBeaconReport } from './hooks/use-beacon-report';
export { useGetSightingById } from './hooks/use-get-sighting-by-id';
export { useGetSightingEventsTail } from './hooks/use-get-sighting-events-tail';
export { useDashboard } from './hooks/use-dashboard';
export { useGlobalStats } from './hooks/use-global-stats';
export { useFieldsStats } from './hooks/use-fields-stats';
export { useTimelineVisibility } from './hooks/use-timeline-visibility';
export { useNetworkEventsQfilter } from './hooks/use-network-events-qfilter';

// Builders
export { buildEventsFlowQfilter } from './builders/build-events-flow-qfilter';
export { buildSightingQfilter } from './builders/build-sighting-qfilter';

// Utils
export { formatBeaconMetric } from './utils/format-beacon-metric';

// Definitions (column atoms, configs)
export * from './definitions/event-columns';
export * from './definitions/detection-event-columns';
export * from './definitions/network-event-columns';
export { default as eventsFlowColumns } from './definitions/events-flow.columns';
export type { ProtoColumn } from './definitions/events-flow.columns';

// Components
export { EventDetail } from './components/event-detail/event-detail';
export {
  EventDetailTabs,
  DetectionMethodTab,
  FilesTab,
  JsonTab,
  MetaViewTab,
  PcapTab,
  RelatedEventsTabs,
  SyntheticTab,
} from './components/event-detail';
export { EventsTable } from './components/events-table/events-table';
export {
  exportColumns,
  getColumns,
} from './components/events-table/events.columns';
export { ExpandedEventRow } from './components/expanded-event-row/expanded-event-row';
export { EventsCounter } from './components/events-counter/events-counter';
export { EventsTimeline } from './components/events-timeline/events-timeline';
export { DetectionEventsTable } from './components/detection-events-table/detection-events-table';
export { ExplorerView } from './components/explorer/explorer-view';
export { VolumetryView } from './components/volumetry-view/volumetry-view';
export { NetworkEventsList } from './components/network-events-list/network-events-list';
export { NetworkEventsTimeline } from './components/network-events-timeline/network-events-timeline';
export { SightingDetails } from './components/sighting-details/sighting-details';
export { SightingsTable } from './components/sightings-table/sightings-table';
export {
  allSightingsTableColumns,
  hostSightingTableColumns,
  allSightingsExport,
  sightingTableFilters,
  sightingRoleOptions,
} from './components/sightings-table/sightings-table.columns';
export {
  BeaconingTable,
  beaconingTableColumns,
} from './components/beaconing-table/beaconing-table';
export { BeaconingMetadata } from './components/beaconing-metadata/beaconing-metadata';
export {
  ReportSummary as BeaconingReportSummary,
  JA3SColumns as beaconingJa3sColumns,
  IPColumns as beaconingIpColumns,
  beaconingColumns,
} from './components/beaconing-report-summary/beaconing-report-summary';
export {
  BeaconingIPsTable,
  beaconingIpsTableColumns,
} from './components/beaconing-ips-table/beaconing-ips-table';
export { BeaconingIpDetails } from './components/beaconing-ip-details/beaconing-ip-details';
export { ServingIpsTable } from './components/serving-ips-table/serving-ips-table';
export { BeaconingJa3sDetails } from './components/beaconing-ja3s-details/beaconing-ja3s-details';
export { IpsServingJa3sTable } from './components/ips-serving-ja3s-table/ips-serving-ja3s-table';
export { JA3SHashTable } from './components/ja3s-hash-table/ja3s-hash-table';
export { EventsFlowView } from './components/events-flow/events-flow-view';
export { EventsStream } from './components/events-stream/events-stream';
export { SightingEventsTailFlow } from './components/events-tail-flow/events-tail-flow';
export { PatientZeroDetails } from './components/patient-zero-details/patient-zero-details';
export { SightingsMetadata } from './components/sightings-metadata/sightings-metadata';
export { SightingEventsCountsTimeline } from './components/sighting-events-counts-timeline/sighting-events-counts-timeline';
export {
  HostBeaconsTabBadge,
  HostDetectionEventsTabBadge,
  HostOutlierEventsTabBadge,
  HostSightingsTabBadge,
} from './components/host-tab-badges/host-tab-badges';
