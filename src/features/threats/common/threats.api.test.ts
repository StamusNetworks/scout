import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/common/testing/mocks/server';
import { setupStore } from '@/store/store';
import { initialState } from '@/store/store.init';

import { Threat } from './threat.model';
import { ThreatsAPI } from './threats.api';

// /api routes use '/' prefix instead of '/rest/'
const apiV2Url = '/undefined/api/v2';
const restUrl = '/undefined/rest';

const mockCreatedThreat: Threat = {
  pk: 9999,
  threat_id: 9999,
  name: 'New Custom Threat',
  description: 'A new custom threat',
  criticity: 1,
  version: 1,
  active: true,
  creation_date: '2026-04-03',
  family: 1,
  family_class: 'doc',
  links: [],
  user_defined: true,
  nb_methods: 0,
  tenants: [],
  no_tenant: true,
  all_tenants: true,
};

describe('ThreatsAPI cache updates', () => {
  describe('createThreat', () => {
    it('should insert created threat into getCustomThreats cache', async () => {
      let getCallCount = 0;
      server.use(
        http.get(apiV2Url + '/appliances/threats/', async () => {
          getCallCount++;
          if (getCallCount > 1) {
            // Block the refetch so we can verify the cache was updated by onQueryStarted
            await new Promise(() => {});
          }
          return HttpResponse.json({
            count: 0,
            next: null,
            previous: null,
            results: [],
          });
        }),
        http.post(restUrl + '/appliances/threat/create_custom/', () =>
          HttpResponse.json(mockCreatedThreat),
        ),
      );

      const store = setupStore(initialState);

      // Populate the cache
      await store.dispatch(
        ThreatsAPI.endpoints.getCustomThreats.initiate({ tenant: 1 }),
      );

      // Verify cache starts empty
      const before = ThreatsAPI.endpoints.getCustomThreats.select({
        tenant: 1,
      })(store.getState());
      expect(before.data?.ids).toHaveLength(0);

      // Create a new threat
      await store.dispatch(
        ThreatsAPI.endpoints.createThreat.initiate({
          family_class: 'doc',
          name: 'New Custom Threat',
          description: 'A new custom threat',
          no_tenant: true,
          all_tenants: true,
          tenants: [],
        }),
      );

      // Cache should now contain the new threat (inserted by onQueryStarted, not by refetch)
      const after = ThreatsAPI.endpoints.getCustomThreats.select({
        tenant: 1,
      })(store.getState());
      expect(after.data?.entities[9999]).toBeDefined();
      expect(after.data?.entities[9999]?.name).toBe('New Custom Threat');
    });

    it('created threat is available when filtering cache by its family_class', async () => {
      const existingDocThreat: Threat = {
        ...mockCreatedThreat,
        pk: 1001,
        threat_id: 1001,
        name: 'Existing DoC Threat',
        family_class: 'doc',
      };
      const existingDopvThreat: Threat = {
        ...mockCreatedThreat,
        pk: 1002,
        threat_id: 1002,
        name: 'Existing DoPV Threat',
        family_class: 'dopv',
      };

      let getCallCount = 0;
      server.use(
        http.get(apiV2Url + '/appliances/threats/', async () => {
          getCallCount++;
          if (getCallCount > 1) {
            await new Promise(() => {});
          }
          return HttpResponse.json({
            count: 2,
            next: null,
            previous: null,
            results: [existingDocThreat, existingDopvThreat],
          });
        }),
        http.post(restUrl + '/appliances/threat/create_custom/', () =>
          HttpResponse.json(mockCreatedThreat),
        ),
      );

      const store = setupStore(initialState);

      // Populate the cache
      await store.dispatch(
        ThreatsAPI.endpoints.getCustomThreats.initiate({ tenant: 1 }),
      );

      // Create a new DoC threat
      await store.dispatch(
        ThreatsAPI.endpoints.createThreat.initiate({
          family_class: 'doc',
          name: 'New Custom Threat',
          description: 'A new custom threat',
          no_tenant: true,
          all_tenants: true,
          tenants: [],
        }),
      );

      // Get all cached threats
      const cached = ThreatsAPI.endpoints.getCustomThreats.select({
        tenant: 1,
      })(store.getState());
      const allThreats = Object.values(cached.data?.entities ?? {});

      // Filtering by 'doc' should include the new threat
      const docThreats = allThreats.filter((t) => t?.family_class === 'doc');
      expect(docThreats.map((t) => t?.name)).toContain('New Custom Threat');

      // Filtering by 'dopv' should NOT include the new threat
      const dopvThreats = allThreats.filter((t) => t?.family_class === 'dopv');
      expect(dopvThreats.map((t) => t?.name)).not.toContain(
        'New Custom Threat',
      );
      expect(dopvThreats.map((t) => t?.name)).toContain('Existing DoPV Threat');
    });
  });

  describe('updateThreat', () => {
    it('should optimistically update threat in getCustomThreats cache', async () => {
      const existingThreat: Threat = {
        ...mockCreatedThreat,
        pk: 1000,
        threat_id: 1000,
        name: 'Old Name',
      };

      let getCallCount = 0;
      server.use(
        http.get(apiV2Url + '/appliances/threats/', async () => {
          getCallCount++;
          if (getCallCount > 1) {
            await new Promise(() => {});
          }
          return HttpResponse.json({
            count: 1,
            next: null,
            previous: null,
            results: [existingThreat],
          });
        }),
        http.patch(restUrl + '/appliances/threat/1000/', () =>
          HttpResponse.json({ ...existingThreat, name: 'Updated Name' }),
        ),
      );

      const store = setupStore(initialState);

      // Populate the cache
      await store.dispatch(
        ThreatsAPI.endpoints.getCustomThreats.initiate({ tenant: 1 }),
      );

      // Verify original name
      const before = ThreatsAPI.endpoints.getCustomThreats.select({
        tenant: 1,
      })(store.getState());
      expect(before.data?.entities[1000]?.name).toBe('Old Name');

      // Update the threat
      await store.dispatch(
        ThreatsAPI.endpoints.updateThreat.initiate({
          pk: 1000,
          family_class: 'doc',
          name: 'Updated Name',
          description: 'A new custom threat',
          no_tenant: true,
          all_tenants: true,
          tenants: [],
        }),
      );

      // Cache should reflect the update immediately (not waiting for refetch)
      const after = ThreatsAPI.endpoints.getCustomThreats.select({
        tenant: 1,
      })(store.getState());
      expect(after.data?.entities[1000]?.name).toBe('Updated Name');
    });
  });
});
