import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';
import { initialState } from '@/store/store.init';

import { EventDetail } from './event-detail';

const mockEvent = {
  _id: 'evt-001',
  '@timestamp': '2026-03-17T12:00:00.000Z',
  timestamp: '2026-03-17T12:00:00.000Z',
  event_type: 'alert',
  src_ip: '192.168.1.10',
  src_port: 54321,
  dest_ip: '10.0.0.1',
  dest_port: 443,
  app_proto: 'tls',
  host: 'sensor-01',
  alert: {
    signature: 'ET MALWARE Known Bot Command',
    signature_id: 2024792,
    category: 'A Network Trojan was detected',
    severity: 1,
    action: 'allowed',
    rev: 3,
    gid: 1,
    tag: 'relevant',
    metadata: {
      mitre_tactic_name: ['Initial Access'],
      mitre_technique_name: ['Exploit Public-Facing Application'],
    },
  },
};

const emptyPaginated = { count: 0, next: null, previous: null, results: [] };

const createTestRouter = () =>
  createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({
      initialEntries: ['/detection-events/event?_id=evt-001'],
    }),
  });

const alertsTailHandler = (results = [mockEvent]) =>
  http.get(baseUrl + '/rules/es/alerts_tail', () =>
    HttpResponse.json({
      count: results.length,
      next: null,
      previous: null,
      results,
    }),
  );

const hostHandler = http.get(baseUrl + '/appliances/host_id/:entity', () =>
  HttpResponse.json({
    ip: '192.168.1.10',
    host_id: { hostname: [], roles: [], username: [] },
  }),
);

const entitiesHandler = http.get(
  baseUrl + '/appliances/threat/threats_per_asset/',
  () => HttpResponse.json(emptyPaginated),
);

const flowEventsHandler = http.get(
  baseUrl + '/rules/es/events_from_flow_id/',
  () => HttpResponse.json({}),
);

const renderEventDetail = async (eventId = 'evt-001') =>
  renderWithProviders(<EventDetail eventId={eventId} />, {
    router: createTestRouter(),
    preloadedState: { ...initialState },
  });

describe('EventDetail', () => {
  beforeEach(() => {
    server.use(
      alertsTailHandler(),
      hostHandler,
      entitiesHandler,
      flowEventsHandler,
    );
  });

  it('shows loading state initially', async () => {
    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [mockEvent],
        });
      }),
    );

    await renderEventDetail();

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders event signature when data loads', async () => {
    await renderEventDetail();

    await waitFor(() => {
      expect(
        screen.getByText('ET MALWARE Known Bot Command'),
      ).toBeInTheDocument();
    });
  });

  it('renders event detail tabs', async () => {
    await renderEventDetail();

    await waitFor(() => {
      expect(screen.getByText('Synthetic view')).toBeInTheDocument();
    });

    expect(screen.getByText('JSON View')).toBeInTheDocument();
  });

  it('renders error state when event is not found', async () => {
    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', () =>
        HttpResponse.json(emptyPaginated),
      ),
    );

    await renderEventDetail();

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });
});
