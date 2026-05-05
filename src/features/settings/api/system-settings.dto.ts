export type SystemSettingsDto = {
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
