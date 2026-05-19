import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { baseUrl, server } from '@/common/testing/mocks/server';
import { setupStore } from '@/store/store';
import { initialState } from '@/store/store.init';

import type { ResolvedQuery } from '../builders/build-query-params';
import { HuntingTrailAPI } from './hunting-trail.api';

const range = { from: 1, to: 2, tenant: undefined };

const emptyPaginated = { count: 0, next: null, previous: null, results: [] };

describe('useGetHuntingTrailQuery (queryFn fan-out)', () => {
  it('dispatches one request per non-missing resolved query', async () => {
    const alertSpy = vi.fn();
    const tailSpy = vi.fn();
    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', () => {
        alertSpy();
        return HttpResponse.json(emptyPaginated);
      }),
      http.get(baseUrl + '/rules/es/events_tail/', () => {
        tailSpy();
        return HttpResponse.json(emptyPaginated);
      }),
    );

    const defaultFlags = { alert: true, stamus: true, discovery: true };
    const resolvedQueries: ResolvedQuery[] = [
      {
        id: 'nrd',
        endpoint: 'alerts_tail',
        qfilter: 'alert.signature:NRD',
        name: 'NRD',
        description: '',
        eventTypeFlags: defaultFlags,
      },
      {
        id: 'sightings',
        endpoint: 'alerts_tail',
        qfilter: 'discovery:*',
        name: 'Sightings',
        description: '',
        eventTypeFlags: defaultFlags,
      },
      {
        id: 'ssh',
        endpoint: 'events_tail',
        qfilter: 'app_proto:ssh',
        name: 'SSH',
        description: '',
        eventTypeFlags: defaultFlags,
      },
    ];

    const store = setupStore(initialState);
    const result = await store.dispatch(
      HuntingTrailAPI.endpoints.getHuntingTrail.initiate({
        ...range,
        resolvedQueries,
      }),
    );

    expect(alertSpy).toHaveBeenCalledTimes(2);
    expect(tailSpy).toHaveBeenCalledTimes(1);
    expect(result.data).toBeDefined();
    expect(Object.keys(result.data!)).toEqual(['nrd', 'sightings', 'ssh']);
  });

  it('returns a synthetic error for isMissing entries without firing a request', async () => {
    const alertSpy = vi.fn();
    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', () => {
        alertSpy();
        return HttpResponse.json(emptyPaginated);
      }),
    );

    const resolvedQueries: ResolvedQuery[] = [
      { id: 'phantom', isMissing: true },
      {
        id: 'nrd',
        endpoint: 'alerts_tail',
        qfilter: 'alert.signature:NRD',
        name: 'NRD',
        description: '',
        eventTypeFlags: { alert: true, stamus: true, discovery: true },
      },
    ];

    const store = setupStore(initialState);
    const result = await store.dispatch(
      HuntingTrailAPI.endpoints.getHuntingTrail.initiate({
        ...range,
        resolvedQueries,
      }),
    );

    expect(alertSpy).toHaveBeenCalledTimes(1); // only nrd
    expect(result.data!.phantom.isError).toBe(true);
    expect(result.data!.phantom.errorReason).toBe('FILTERSET_MISSING');
    expect(result.data!.nrd.isError).toBeFalsy();
  });

  it('surfaces partial success when some requests fail', async () => {
    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', ({ request }) => {
        const url = new URL(request.url);
        const qf = url.searchParams.get('qfilter') ?? '';
        if (qf.includes('NRD')) return HttpResponse.error();
        return HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [{ _id: 'e1' }],
        });
      }),
    );

    const resolvedQueries: ResolvedQuery[] = [
      {
        id: 'nrd',
        endpoint: 'alerts_tail',
        qfilter: 'alert.signature:NRD',
        name: 'NRD',
        description: '',
        eventTypeFlags: { alert: true, stamus: true, discovery: true },
      },
      {
        id: 'sightings',
        endpoint: 'alerts_tail',
        qfilter: 'discovery:*',
        name: 'Sightings',
        description: '',
        eventTypeFlags: { alert: true, stamus: true, discovery: true },
      },
    ];

    const store = setupStore(initialState);
    const result = await store.dispatch(
      HuntingTrailAPI.endpoints.getHuntingTrail.initiate({
        ...range,
        resolvedQueries,
      }),
    );

    expect(result.data!.nrd.isError).toBe(true);
    expect(result.data!.sightings.isError).toBeFalsy();
    expect(result.data!.sightings.data?.results).toHaveLength(1);
  });

  it('passes the qfilter as a query string param to the correct endpoint', async () => {
    const captured: Array<{ url: string; qfilter: string | null }> = [];
    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', ({ request }) => {
        const url = new URL(request.url);
        captured.push({
          url: 'alerts_tail',
          qfilter: url.searchParams.get('qfilter'),
        });
        return HttpResponse.json(emptyPaginated);
      }),
      http.get(baseUrl + '/rules/es/events_tail/', ({ request }) => {
        const url = new URL(request.url);
        captured.push({
          url: 'events_tail',
          qfilter: url.searchParams.get('qfilter'),
        });
        return HttpResponse.json(emptyPaginated);
      }),
    );

    const resolvedQueries: ResolvedQuery[] = [
      {
        id: 'sightings',
        endpoint: 'alerts_tail',
        qfilter: 'discovery:*',
        name: 'Sightings',
        description: '',
        eventTypeFlags: { alert: true, stamus: true, discovery: true },
      },
      {
        id: 'ssh',
        endpoint: 'events_tail',
        qfilter: 'app_proto:ssh',
        name: 'SSH',
        description: '',
        eventTypeFlags: { alert: true, stamus: true, discovery: true },
      },
    ];

    const store = setupStore(initialState);
    await store.dispatch(
      HuntingTrailAPI.endpoints.getHuntingTrail.initiate({
        ...range,
        resolvedQueries,
      }),
    );

    const sightings = captured.find((c) => c.qfilter?.includes('discovery'));
    const ssh = captured.find((c) => c.qfilter?.includes('ssh'));
    expect(sightings?.url).toBe('alerts_tail');
    expect(ssh?.url).toBe('events_tail');
  });

  it('passes eventTypeFlags to the endpoint as alert/stamus/discovery params', async () => {
    const captured: Array<URLSearchParams> = [];
    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', ({ request }) => {
        captured.push(new URL(request.url).searchParams);
        return HttpResponse.json(emptyPaginated);
      }),
    );
    const resolvedQueries: ResolvedQuery[] = [
      {
        id: 'nrd',
        endpoint: 'alerts_tail',
        qfilter: 'alert.signature:NRD',
        name: 'NRD',
        description: '',
        eventTypeFlags: { alert: true, stamus: false, discovery: true },
      },
    ];
    const store = setupStore(initialState);
    await store.dispatch(
      HuntingTrailAPI.endpoints.getHuntingTrail.initiate({
        ...range,
        resolvedQueries,
      }),
    );
    expect(captured).toHaveLength(1);
    expect(captured[0].get('alert')).toBe('true');
    expect(captured[0].get('stamus')).toBe('false');
    expect(captured[0].get('discovery')).toBe('true');
  });

  it('reuses the cache when called with stable args', async () => {
    const alertSpy = vi.fn();
    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', () => {
        alertSpy();
        return HttpResponse.json(emptyPaginated);
      }),
    );

    const resolvedQueries: ResolvedQuery[] = [
      {
        id: 'nrd',
        endpoint: 'alerts_tail',
        qfilter: 'alert.signature:NRD',
        name: 'NRD',
        description: '',
        eventTypeFlags: { alert: true, stamus: true, discovery: true },
      },
    ];

    const store = setupStore(initialState);
    await store.dispatch(
      HuntingTrailAPI.endpoints.getHuntingTrail.initiate({
        ...range,
        resolvedQueries,
      }),
    );
    await store.dispatch(
      HuntingTrailAPI.endpoints.getHuntingTrail.initiate({
        ...range,
        resolvedQueries,
      }),
    );
    // RTK Query dedupes on identical args; spy should only see one wire call.
    expect(alertSpy).toHaveBeenCalledTimes(1);
  });
});
