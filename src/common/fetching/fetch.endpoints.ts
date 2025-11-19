export type Endpoint = {
  name: string;
  url: string;
  query_params?: ('host_id_qfilter' | 'params' | 'qfilter')[];
  meta_params?: ('page' | 'page_size' | 'ordering')[];
  force?: Record<string, string>;
  format?: {
    dates?: 'from/to' | 'start/end';
    dates_zeroes?: boolean;
  };
};

const base_config: Partial<Endpoint> = {
  query_params: ['params', 'qfilter'],
  format: {
    dates: 'start/end',
    dates_zeroes: false,
  },
};

const pagination: Partial<Endpoint> = {
  meta_params: ['page', 'page_size', 'ordering'],
};

export const ENDPOINTS: Record<string, Endpoint> = {
  // Retrieving endpoints
  CURRENT_USER: {
    name: 'Fetching user data',
    url: '/accounts/sciriususer/current_user/',
    ...base_config,
  },
  SCIRIUS_CONTEXT: {
    name: 'Fetching scirius context',
    url: '/scirius_context',
    ...base_config,
  },
  SYSTEM_SETTINGS: {
    name: 'Fetching system settings data',
    url: `/system_settings/`,
    ...base_config,
  },
  SOURCES: {
    name: 'Fetching sources data',
    url: `/source/`,
    ...base_config,
  },
  ALL_PERIOD: {
    name: 'Fetching all period data',
    url: `/es/alerts_timerange/`,
    ...base_config,
  },
  RULE_SETS: {
    name: 'Fetching rule sets',
    url: `/ruleset/`,
    ...base_config,
  },
  HUNT_FILTER: {
    name: 'Fetching hunt filter',
    url: `/hunt-filter/`,
    ...base_config,
  },
  SUPPORTED_ACTIONS: {
    name: 'Fetching supported actions',
    url: `/processing-filter/test_actions/`,
    ...base_config,
  },
  HISTORY_FILTERS: {
    name: 'Fetching history filters',
    url: `/history/get_action_type_list/`,
    ...base_config,
  },
  FILTER_SET_SAVE: {
    name: 'Saving Filter Sets',
    url: '/hunt_filter_sets/',
    ...base_config,
  },
  FILTER_SET_DELETE: {
    name: 'Deleting Filter Sets',
    url: `/hunt_filter_sets/$id`,
    ...base_config,
  },
  SESSION_ACTIVITY: {
    name: 'Set session activity idle time',
    url: `/accounts/sciriususer/session_activity/`,
    ...base_config,
  },
  FILTER_SETS: {
    name: 'Fetching filtersets',
    url: `/hunt_filter_sets`,
    ...base_config,
  },
  UPDATE_PUSH_RULESET: {
    name: 'Update / Push ruleset',
    url: '/suricata/update_push_all/',
    ...base_config,
  },
  FIELD_STATS: {
    name: 'Fetch dashboard panel',
    url: '/rest/rules/es/fields_stats/',
    ...base_config,
  },
  TIMELINE: {
    name: 'Fetch Elasticsearch timeline',
    url: '/rules/es/timeline',
    query_params: ['qfilter', 'params'],
    format: {
      dates: 'from/to',
      dates_zeroes: true,
    },
  },
  ALERTS_COUNT: {
    name: 'Fetch Elasticsearch alerts count',
    url: '/rest/rules/es/alerts_count/',
    ...base_config,
  },
  ALERTS_TAIL: {
    name: 'Fetch Elasticsearch alerts tail',
    url: '/rest/rules/es/alerts_tail/',
    ...{
      ...base_config,
      ...pagination,
      format: {
        dates: 'start/end',
        dates_zeroes: false,
      },
    },
  },
  FILTER_ACTIONS: {
    name: 'Processing filter',
    url: '/rules/processing-filter/',
    ...base_config,
  },
  SIGNATURES: {
    name: 'Fetching signature',
    url: `/rule/`,
    ...base_config,
    ...pagination,
  },
  ELASTIC_SEARCH: {
    name: 'Fetching elasticsearch data',
    url: '/rest/rules/es/search/',
    ...base_config,
  },
  EVENTS_FROM_FLOW_ID: {
    name: 'Fetching events from flow id',
    url: '/rest/rules/es/events_from_flow_id/',
    ...base_config,
  },
  ASSET_UPDATE: {
    name: 'Updating entities',
    url: `/threat_event/set_status/`,
    ...base_config,
  },
  // Retrieving endpoints
  GLOBAL_SETTINGS: {
    name: 'Fetching global settings data',
    url: `/global_settings/`,
  },
  NETWORK_DEFINITIONS: {
    name: 'Fetching tenants',
    url: `/network_definition`,
  },
  THREAT_FAMILY_ROOT: {
    name: 'Fetching family',
    url: `/threat_family/`,
  },
  THREAT_FAMILY_TOP_LIST_TIMELINE: {
    name: 'Fetching all families stats data',
    url: `/threat_family/top_list_timeline/`,
  },
  THREAT_FAMILY_TOP_LIST: {
    name: 'Fetching active families data',
    url: `/threat_family/top_list/`,
  },
  THREAT_FAMILY_KILL_CHAIN_GLOBAL: {
    name: 'Fetching kill chain global data',
    url: `/threat_family/kill_chain_family/`,
  },
  THREAT_FAMILY_KILL_CHAIN_FAMILY: {
    name: 'Fetching kill chain family data',
    url: `/threat_family/$id/kill_chain/`,
  },
  THREAT_FAMILY_PERFORMANCE_INDICATORS_STATS: {
    name: 'Fetching performance indicators global statistics',
    url: `/threat_family/global_stats/`,
  },
  THREAT_ROOT: {
    name: 'Updating threat',
    url: `/threat/`,
  },
  THREAT_CREATE: {
    name: 'Creating threat',
    url: `/threat/create_custom/`,
  },
  THREAT_DELETE: {
    name: 'Deleting threat',
    url: `/threat/$threatId/`,
  },
  THREAT_METADATA: {
    name: 'Fetching threat stats data',
    url: `/threat/$threatId/metadata/`,
  },
  THREAT_TOP_LIST: {
    name: 'Fetching active threats data',
    url: `/threat/top_list/`,
  },
  THREAT_VERSION: {
    name: 'Fetching threats version',
    url: `/threat/threats_version/`,
  },
  THREAT_ASSETS: {
    name: 'Fetching entities',
    url: `/threat/threats_per_asset/`,
    format: {
      dates: 'start/end',
      dates_zeroes: false,
    },
    query_params: ['qfilter', 'params', 'host_id_qfilter'],
  },
  THREAT_BYID_ASSETS: {
    name: 'Fetching threat entities',
    url: `/threat/$threatId/assets_from_threat/`,
  },
  THREATS_LIST: {
    name: 'Fetching force graph entities',
    url: `/threat/threats_list/`,
  },
  THREAT_WORLD_MAP: {
    name: 'Fetching world map data',
    url: `/threat/worldmap/`,
  },
  ES_SIGHTINGS: {
    name: 'Fetching sightings',
    url: `/es_discovery_events/`,
  },
  ES_BEACONING: {
    name: 'Fetching beaconing',
    url: `/es_beaconing_events/`,
  },
  ES_TLS_TAIL: {
    name: 'Fetching beacon metadata',
    url: `/es/tls_tail/`,
  },
  ES_FLOW_TIMELINE: {
    name: 'Fetching beacon metadata',
    url: `/es/flow_timeline/`,
  },
  ES_THREAT_ASSETS_EVENTS: {
    name: 'Fetching threat entities events',
    url: `/es_stamus_events/Es`,
  },
  ES_SIGHTINGS_INFO: {
    name: 'Fetching sightings info',
    url: `/es_discovery_events/`,
  },
  ES_SIGHTINGS_NETWORK: {
    name: 'Fetching sightings network',
    url: `/es/events_timeline/`,
  },
  ES_SIGHTINGS_FLOW: {
    name: 'Fetching sightings flow',
    url: `/es/events_tail/`,
  },
  ES_FILTER_ACTIONS_DATA: {
    name: 'Filter Actions data',
    url: `/es/poststats_summary/`,
  },
  ES_IP_FLOW_TIMELINE: {
    name: 'Fetching IP flow timeline',
    url: '/rest/rules/es/ip_flow_timeline/',
  },
  ES_PERFORMANCE_INDICATORS_ALERTS: {
    name: 'Fetching performance indicators alerts count',
    url: `/es/alerts_count/`,
  },
  THREAT_ASSETS_OFFENDERS: {
    name: 'Fetching threat entities offenders',
    url: `/threat_event/sources/`,
  },
  NET_INFO: {
    name: 'Fetching host id info',
    url: `/host_id/$ip`,
  },
  KILL_CHAIN_DEFAULT: {
    name: 'Fetching kill chain family data',
    url: `/$type/$id/kill_chain/`,
  },
  METHOD: {
    name: 'Fetching method',
    url: `/threat_method/$methodId/`,
  },
  HOST_ID_ALERTS: {
    name: 'Host ID Alerts',
    url: '/appliances/host_id_alerts/',
    format: {
      dates: 'start/end',
      dates_zeroes: false,
    },
  },
  HOST_ID_ROOT: {
    name: 'Host ID without QFilter',
    url: '/appliances/host_id/',
  },
  PROCESSING_FILTERS: {
    name: 'Processing filter',
    url: `/processing-filter/test/`,
  },
} as const;
