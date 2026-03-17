import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { BreadcrumbProvider } from '@/common/design-system/molecules/breadcrumbs';
import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';
import { initialState } from '@/store/store.init';

import { Route } from './detection-events';

const emptyPaginated = { count: 0, next: null, previous: null, results: [] };

const mockEvent = {
  _id: 'test-event-1',
  '@timestamp': '2026-03-17T10:00:00Z',
  timestamp: '2026-03-17T10:00:00Z',
  event_type: 'alert',
  app_proto: 'http',
  src_ip: '192.168.1.10',
  src_port: 54321,
  dest_ip: '10.0.0.1',
  dest_port: 443,
  host: 'probe-1',
  alert: {
    signature: 'ET MALWARE Host Signature',
    category: 'Malware',
    tag: 'relevant',
  },
};

const createTestRouter = () => {
  const rootRoute = createRootRoute();
  const hostRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'hosts/$hostId/detection-events',
  });
  rootRoute.addChildren([hostRoute]);
  return createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({
      initialEntries: ['/hosts/192.168.1.10/detection-events'],
    }),
  });
};

const renderPage = async () => {
  const Component = Route.options.component!;
  return renderWithProviders(
    <BreadcrumbProvider>
      <Component />
    </BreadcrumbProvider>,
    {
      router: createTestRouter(),
      preloadedState: {
        ...initialState,
      },
    },
  );
};

beforeEach(() => {
  server.use(
    // Events list
    http.get(baseUrl + '/rules/es/alerts_tail', () =>
      HttpResponse.json(emptyPaginated),
    ),
    // Timeline
    http.get(baseUrl + '/rules/es/timeline', () =>
      HttpResponse.json({
        from_date: 0,
        to_date: 1,
        interval: 1,
      }),
    ),
    // Host ID lookups (used by Hostname/Network columns)
    http.get(baseUrl + '/appliances/host_id/', () =>
      HttpResponse.json(emptyPaginated),
    ),
  );
});

describe('HostDetectionEventsTab', () => {
  it('shows empty state when no events are returned', async () => {
    await renderPage();

    await waitFor(() => {
      expect(screen.getByText('No detection events found')).toBeInTheDocument();
    });
  });

  it('renders events data when API returns results', async () => {
    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', () =>
        HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [mockEvent],
        }),
      ),
    );

    await renderPage();

    await waitFor(() => {
      expect(screen.getByText('ET MALWARE Host Signature')).toBeInTheDocument();
    });

    // Verify key data columns render
    expect(screen.getByText('192.168.1.10')).toBeInTheDocument();
    expect(screen.getByText('10.0.0.1')).toBeInTheDocument();
    expect(screen.getByText('http')).toBeInTheDocument();
    expect(screen.getByText('probe-1')).toBeInTheDocument();
    expect(screen.getByText('Malware')).toBeInTheDocument();
  });

  it('renders pagination when there are results', async () => {
    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', () =>
        HttpResponse.json({
          count: 25,
          next: null,
          previous: null,
          results: Array.from({ length: 10 }, (_, i) => ({
            ...mockEvent,
            _id: `event-${i}`,
          })),
        }),
      ),
    );

    await renderPage();

    await waitFor(() => {
      expect(
        screen.getAllByText('ET MALWARE Host Signature').length,
      ).toBeGreaterThan(0);
    });

    // Pagination should be visible
    expect(screen.getByText(/25/)).toBeInTheDocument();
  });
});
