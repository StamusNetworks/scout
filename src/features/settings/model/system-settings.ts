/**
 * Appliance-level system settings: feature toggles for Arkime, Kibana,
 * Evebox, Cyberchef, Elasticsearch, plus the license matrix that
 * determines whether the build is Enterprise (any of NTA / ETL / MNGT
 * licensed).
 */
export type License = {
  nta: boolean;
  etl: boolean;
  mngt: boolean;
};

export type SystemSettings = {
  id: number;
  useArkime: boolean;
  useOpensearch: boolean;
  arkimeUrl: string;
  useHttpProxy: boolean;
  httpProxy: string;
  httpsProxy: string;
  useElasticsearch: boolean;
  customElasticsearch: boolean;
  elasticsearchUrl: string;
  useProxyForEs: boolean;
  customCookieAge: number;
  elasticsearchUser: string;
  customLoginBanner: string;
  sessionCookieAge: number;
  kibana: boolean;
  evebox: boolean;
  esKeyword: string;
  kibanaUrl: string;
  eveboxUrl: string;
  cyberchef: boolean;
  cyberchefUrl: string;
  license: License;
};
