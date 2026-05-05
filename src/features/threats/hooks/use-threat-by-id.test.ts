import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/common/testing/mocks/server';
import { setupStore } from '@/store/store';
import { initialState } from '@/store/store.init';

import { ThreatDto } from '../api/threat.dto';
import { ThreatsAPI } from '../api/threats.api';

const restUrl = '/undefined/rest';

const mockDto: ThreatDto = {
  pk: 42,
  threat_id: 1024,
  name: 'LOLBins',
  description: 'Living off the land binaries.',
  additional_info: 'See MITRE T1218.',
  criticity: 6,
  version: 2,
  active: true,
  creation_date: '2026-04-01',
  family: 9,
  family_class: 'doc',
  links: {
    threat: [
      {
        name: 'MITRE',
        link: 'https://attack.mitre.org/T1218',
        reference_type: 'mitre',
      },
    ],
    family: [],
  },
  user_defined: false,
  nb_methods: 5,
  tenants: [],
  no_tenant: true,
  all_tenants: false,
};

describe('useThreatById', () => {
  it('returns the threat in domain shape (transformResponse applied)', async () => {
    server.use(
      http.get(restUrl + '/appliances/threat/42/', () =>
        HttpResponse.json(mockDto),
      ),
    );
    const store = setupStore(initialState);

    const { data } = await store
      .dispatch(ThreatsAPI.endpoints.getThreatById.initiate({ threatId: '42' }))
      .unwrap()
      .then((result) => ({ data: result }));

    expect(data.id).toBe(42);
    expect(data.kind).toBe('compromise');
    expect(data.severity).toBe(6);
    expect(data.isUserDefined).toBe(false);
    expect(data.isVisibleWithoutTenant).toBe(true);
    expect(data.tenantScope).toEqual({ mode: 'specific', tenantIds: [] });
    expect(data.createdAt).toBeInstanceOf(Date);
  });
});
