import { describe, expect, it } from 'vitest';

import { toGlobalSettings } from './global-settings.transforms';
import { toProbe } from './probe.transforms';
import { toSciriusContext } from './scirius-context.transforms';
import { toSource } from './source.transforms';
import { toSystemSettings } from './system-settings.transforms';

describe('toSystemSettings', () => {
  it('renames snake_case wire fields to camelCase domain', () => {
    const result = toSystemSettings({
      id: 7,
      use_arkime: true,
      use_opensearch: false,
      arkime_url: '/arkime',
      use_http_proxy: false,
      http_proxy: '',
      https_proxy: '',
      use_elasticsearch: true,
      custom_elasticsearch: false,
      elasticsearch_url: 'http://es:9200',
      use_proxy_for_es: false,
      custom_cookie_age: 0,
      elasticsearch_user: 'es-user',
      custom_login_banner: '',
      session_cookie_age: 86400,
      kibana: true,
      evebox: false,
      es_keyword: '.keyword',
      kibana_url: '/kibana',
      evebox_url: '/evebox',
      cyberchef: true,
      cyberchef_url: '/cyberchef',
      license: { nta: true, etl: false, mngt: true },
    });

    expect(result.id).toBe(7);
    expect(result.useArkime).toBe(true);
    expect(result.kibanaUrl).toBe('/kibana');
    expect(result.eveboxUrl).toBe('/evebox');
    expect(result.cyberchefUrl).toBe('/cyberchef');
    expect(result.useOpensearch).toBe(false);
    expect(result.elasticsearchUrl).toBe('http://es:9200');
    expect(result.sessionCookieAge).toBe(86400);
    expect(result.license).toEqual({ nta: true, etl: false, mngt: true });
  });
});

describe('toSciriusContext', () => {
  it('maps wire fields including nb_probes to probesCount', () => {
    expect(
      toSciriusContext({
        title: 't',
        short_title: 'st',
        common_long_name: 'cln',
        product_long_name: 'pln',
        content_lead: 'cl',
        content_minor1: 'cm1',
        content_minor2: 'cm2',
        content_minor3: 'cm3',
        admin_title: 'at',
        version: '42.0.0',
        icon: true,
        nb_probes: 3,
      }),
    ).toEqual({
      title: 't',
      shortTitle: 'st',
      commonLongName: 'cln',
      productLongName: 'pln',
      contentLead: 'cl',
      contentMinor1: 'cm1',
      contentMinor2: 'cm2',
      contentMinor3: 'cm3',
      adminTitle: 'at',
      version: '42.0.0',
      icon: true,
      probesCount: 3,
    });
  });
});

describe('toProbe', () => {
  it('renames descr → description and snake_case timestamps', () => {
    const result = toProbe({
      appliance_id: 12,
      name: 'probe-1',
      descr: 'rack 4',
      created_date: '2024-02-01',
      updated_date: '2024-02-02',
      address: '10.0.0.5',
      port: 5555,
      last_seen: '2024-02-03',
      cores_count: 16,
      cpu_model: 'Xeon',
      memory: 64000,
      kernel: '6.1',
      distribution: 'debian',
      app_is_up: true,
      suri_running: true,
      suri_last_seen: '2024-02-03',
    });

    expect(result.applianceId).toBe(12);
    expect(result.description).toBe('rack 4');
    expect(result.createdAt).toBe('2024-02-01');
    expect(result.updatedAt).toBe('2024-02-02');
    expect(result.lastSeenAt).toBe('2024-02-03');
    expect(result.suriLastSeenAt).toBe('2024-02-03');
    expect(result.appIsUp).toBe(true);
  });
});

describe('toSource', () => {
  it('maps pk → id and authkey → authKey', () => {
    const result = toSource({
      pk: 99,
      name: 'stamus-threat-intel',
      created_date: '2024-01-01',
      updated_date: '2024-06-01',
      method: 'http',
      datatype: 'threat',
      uri: 'https://example.com/rules.tar.gz',
      cert_verif: true,
      use_iprepd: false,
      version: '1.2.3',
      use_sys_proxy: false,
      untrusted: false,
      authkey: 'secret',
      remove_original_sids: true,
    });

    expect(result.id).toBe(99);
    expect(result.authKey).toBe('secret');
    expect(result.certVerify).toBe(true);
    expect(result.useIprepd).toBe(false);
    expect(result.removeOriginalSids).toBe(true);
    expect(result.createdAt).toBe('2024-01-01');
  });
});

describe('toGlobalSettings', () => {
  it('renames multi_tenancy to multiTenancy', () => {
    expect(toGlobalSettings({ multi_tenancy: true })).toEqual({
      multiTenancy: true,
    });
  });
});
