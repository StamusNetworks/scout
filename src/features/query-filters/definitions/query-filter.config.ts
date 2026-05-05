/**
 * Prefix that identifies host-scoped filter keys (e.g. `host_id.ip`,
 * `host_id.roles.name`). Filters with this prefix get rolled into the
 * `host_id_qfilter` query param; everything else flows through `qfilter`.
 */
export const HOST_ID_KEY_PREFIX = 'host_id.';

export const ES_Types = {
  date: 'date',
  keyword: 'keyword',
  text: 'text',
  ip: 'ip',
  boolean: 'boolean',
  float: 'float',
  long: 'long',
  half_float: 'half_float',
  geo_point: 'geo_point',
};

export const FilterInputType = {
  TEXT: 'TEXT',
  NUMBER: 'NUMBER',
  SELECT: 'SELECT',
};

export const FilterValidationType = {
  IP: 'IP',
  POSITIVE_INT: 'POSITIVE_INT',
  STRING: 'STRING',
  EMAIL: 'EMAIL',
  DOMAIN: 'DOMAIN',
  NUMBER: 'NUMBER',
} as const;

export const KillChainStepsEnum = {
  reconnaissance: 'Reconnaissance',
  weaponization: 'Weaponization',
  delivery: 'Delivery',
  exploitation: 'Exploitation',
  installation: 'Installation',
  command_and_control: 'Command and Control',
  actions_on_objectives: 'Actions on Objectives',
  pre_condition: 'Policy Violation',
} as const;

export const FilterCategory = {
  EVENT: 'EVENT',
  HISTORY: 'HISTORY',
  SIGNATURE: 'SIGNATURE',
  HOST: 'HOST',
  TRANSACTION: 'TRANSACTION',
} as const;

export type FilterCategory =
  (typeof FilterCategory)[keyof typeof FilterCategory];

export const FilterType = {
  STAMUS_ASSET: 'ASSET',
  IP: 'IP',
  PORT: 'PORT',
  MITRE_TECHNIQUE_NAME: 'MITRE_TECHNIQUE_NAME',
  MITRE_TECHNIQUE_ID: 'MITRE_TECHNIQUE_ID',
  MITRE_TACTIC_NAME: 'MITRE_TACTIC_NAME',
  MITRE_TACTIC_ID: 'MITRE_TACTIC_ID',
  USERNAME: 'USERNAME',
  HOSTNAME: 'HOSTNAME',
  DOMAIN: 'DOMAIN',
  EMAIL: 'EMAIL',
  ROLE: 'ROLE',
  NETWORK_INFO: 'NETWORK_INFO',
  SHA256: 'SHA256',
  SIGNATURE: 'SIGNATURE',
  PROTO: 'PROTO',
  APP_PROTO: 'APP_PROTO',
  USER_AGENT: 'USER_AGENT',
  COMMUNITY_ID: 'COMMUNITY_ID',
  CIPHER: 'CIPHER',
  ASNUMBER: 'ASNUMBER',
  FILE_HASH: 'FILE_HASH',
  MACADDRESS: 'MACADDRESS',
} as const;
