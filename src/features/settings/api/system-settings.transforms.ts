import type { SystemSettings } from '../model/system-settings';
import type { SystemSettingsDto } from './system-settings.dto';

export const toSystemSettings = (dto: SystemSettingsDto): SystemSettings => ({
  id: dto.id,
  useArkime: dto.use_arkime,
  useOpensearch: dto.use_opensearch,
  arkimeUrl: dto.arkime_url,
  useHttpProxy: dto.use_http_proxy,
  httpProxy: dto.http_proxy,
  httpsProxy: dto.https_proxy,
  useElasticsearch: dto.use_elasticsearch,
  customElasticsearch: dto.custom_elasticsearch,
  elasticsearchUrl: dto.elasticsearch_url,
  useProxyForEs: dto.use_proxy_for_es,
  customCookieAge: dto.custom_cookie_age,
  elasticsearchUser: dto.elasticsearch_user,
  customLoginBanner: dto.custom_login_banner,
  sessionCookieAge: dto.session_cookie_age,
  kibana: dto.kibana,
  evebox: dto.evebox,
  esKeyword: dto.es_keyword,
  kibanaUrl: dto.kibana_url,
  eveboxUrl: dto.evebox_url,
  cyberchef: dto.cyberchef,
  cyberchefUrl: dto.cyberchef_url,
  license: dto.license,
});
