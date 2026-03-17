import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { BreadcrumbProvider } from '@/common/design-system/molecules/breadcrumbs';
import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';
import { initialState } from '@/store/store.init';

// Import the page component directly (not the Route, since we render it
// through renderWithProviders which injects it as defaultComponent)
import { Route } from './index';

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
    signature: 'ET MALWARE Test Signature',
    category: 'Malware',
    tag: 'relevant',
  },
};

const createTestRouter = () =>
  createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({
      initialEntries: ['/detection-events'],
    }),
  });

const renderPage = async () => {
  // Access the component from the Route
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
    // Events count (used by EventsCounter)
    http.get(baseUrl + '/rules/es/alerts_count', () =>
      HttpResponse.json({ doc_count: 0, prev_doc_count: 0 }),
    ),
    // Timeline (used by EventsCountTimeline)
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

describe('DetectionEventsPage', () => {
  it('renders loading state then page title', async () => {
    await renderPage();

    await waitFor(() => {
      expect(screen.getByText('Events')).toBeInTheDocument();
    });
  });

  it('shows empty state when no events are returned', async () => {
    await renderPage();

    await waitFor(() => {
      expect(screen.getByText('No events found')).toBeInTheDocument();
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
      expect(screen.getByText('ET MALWARE Test Signature')).toBeInTheDocument();
    });

    // Verify key data columns render
    expect(screen.getByText('192.168.1.10')).toBeInTheDocument();
    expect(screen.getByText('10.0.0.1')).toBeInTheDocument();
    expect(screen.getByText('http')).toBeInTheDocument();
    expect(screen.getByText('probe-1')).toBeInTheDocument();
    expect(screen.getByText('Malware')).toBeInTheDocument();
  });

  it('renders page description', async () => {
    await renderPage();

    await waitFor(() => {
      expect(
        screen.getByText(/Monitor, explore, and analyze/),
      ).toBeInTheDocument();
    });
  });
});
