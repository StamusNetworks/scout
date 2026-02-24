export type GlobalSettings = {
  scirius_hostname: string;
  scirius_visible_address: string;
  number_of_replicas: number;
  scirius_only_es: boolean;
  notls_lumberjack: boolean;
  probe_cert_verify: boolean;
  logstash_manage_template: boolean;
  ryod_split: boolean;
  disable_ryod: boolean;
  use_openvpn: boolean;
  multi_tenancy: boolean;
  multi_tenancy_multi_see: boolean;
  etl: boolean;
  etl_net_info: boolean;
  etl_str_sids: boolean;
  use_stamuslogger: boolean;
  custom_es_auth: boolean;
  es_logstash_user: string;
  es_kibana_user: string;
  es_evebox_user: string;
  network_def: string;
  https: {
    ssl_ciphers: string;
    use_custom_cert: boolean;
    https_cert: string;
    https_key: string;
  };
  ldap: {
    method: string;
    ldap_url: string;
    ldap_start_tls: boolean;
    ldap_has_cacert: boolean;
    ldap_option: string;
    ldap_bind_dn: string;
    ldap_user_search: string;
    ldap_scope_user_search: string;
    ldap_filter_user_search: string;
    ldap_group_search: string;
    ldap_scope_group_search: string;
    ldap_filter_group_search: string;
    ldap_auth_method: string;
    ldap_bind_user_dn: string;
    ldap_group_type: string;
    ldap_group_param: string;
    ldap_user_attr_first_name: string;
    ldap_user_attr_last_name: string;
    ldap_user_attr_email: string;
    ldap_cacert_info: string;
  };
  saml: {
    sp_name: string;
    org_name: string;
    org_display_name: string;
    org_url: string;
    contact_given_name: string;
    contact_sur_name: string;
    contact_company: string;
    contact_email: string;
    enabled: boolean;
    idp_url: string;
    sp_debug: boolean;
    sp_url: string;
    sp_name_id_as_username: boolean;
    sp_session_cookie_samesite: string;
    sp_session_cookie_secure: boolean;
    sp_enable_mapping_attrs: boolean;
    sp_mail_mapping: string;
    sp_givenname_mapping: string;
    sp_sn_mapping: string;
    sp_uid_mapping: string;
    sp_metadata_url: string;
  };
  ntp: {
    hosts: string[];
    server_enabled: boolean;
    server_networks: string[];
  };
  smtp: {
    active: boolean;
    address: string;
    port: number;
    encryption: string;
    authentication: string;
    username: string;
    password: string;
    cert_verif: boolean;
  };
  logstash_tcp: {
    type: string;
    description: string;
    active: boolean;
    alert_only: boolean;
    host: string;
    port: number;
  };
  logstash_syslog: {
    type: string;
    description: string;
    active: boolean;
    alert_only: boolean;
    host: string;
    port: number;
    protocol: string;
  };
  logstash_email: {
    type: string;
    description: string;
    active: boolean;
    to: string;
    subject: string;
    body: string;
    from: string;
  };
  logstash_lumberjack: {
    type: string;
    description: string;
    active: boolean;
    alert_only: boolean;
    hosts: string[];
    port: number;
    cacert: string;
  };
  logstash_expert: string;
  openvpn: {
    listen_on_443: boolean;
  };
  splunk: {
    use_ssl: boolean;
    cacert: string;
  };
};

export type SystemSettings = {
  id: number;
  use_arkime: boolean;
  use_opensearch: boolean;
  arkime_url: string;
  use_http_proxy: boolean;
  http_proxy: string;
  https_proxy: string;
  use_elasticsearch: boolean;
  custom_elasticsearch: boolean;
  elasticsearch_url: string;
  use_proxy_for_es: boolean;
  custom_cookie_age: number;
  elasticsearch_user: string;
  custom_login_banner: string;
  session_cookie_age: number;
  kibana: boolean;
  evebox: boolean;
  es_keyword: string;
  kibana_url: string;
  evebox_url: string;
  cyberchef: boolean;
  cyberchef_url: string;
  license: {
    nta: boolean;
    etl: boolean;
    mngt: boolean;
  };
};

export type NetworkDefinition = {
  pk: number;
  name: string;
  net_tree: NetworkDefinitionTree;
};

type NetworkDefinitionTree = {
  name: string;
  addresses: string[];
  children?: NetworkDefinitionTree[];
};

export type SciriusContext = {
  title: string;
  short_title: string;
  common_long_name: string;
  product_long_name: string;
  content_lead: string;
  content_minor1: string;
  content_minor2: string;
  content_minor3: string;
  admin_title: string;
  version: string;
  icon: boolean;
  nb_probes: number;
};

export type Probe = {
  appliance_id: number;
  name: string;
  descr: string;
  created_date: string;
  updated_date: string;
  address: string;
  port: number;
  last_seen: string;
  cores_count: number;
  cpu_model: string;
  memory: number;
  kernel: string;
  distribution: string;
  app_is_up: boolean;
  suri_running: boolean;
  suri_last_seen: string;
};

export type Source = {
  pk: number;
  name: string;
  created_date: string;
  updated_date: string;
  method: string;
  datatype: string;
  uri: string;
  cert_verif: boolean;
  use_iprepd: boolean;
  version: string;
  use_sys_proxy: boolean;
  untrusted: boolean;
  authkey: string;
  remove_original_sids: boolean;
};
