import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';
import { initialState } from '@/store/store.init';

import { EventsFlowView } from './events-flow-view';

const emptyProtocolsResponse = {
  aggregations: {
    protocols: { buckets: [] },
  },
};

const protocolsResponse = {
  aggregations: {
    protocols: {
      buckets: [
        { key: 'tls', doc_count: 100 },
        { key: 'http', doc_count: 50 },
      ],
    },
  },
};

const sankeyAggResponse = {
  aggregations: {
    first_seen: { value_as_string: '2026-03-17T10:00:00.000Z' },
    last_seen: { value_as_string: '2026-03-17T12:00:00.000Z' },
    col_0: {
      buckets: [{ key: 'example.com', doc_count: 10 }],
    },
  },
};

const esMappingHandler = http.get(baseUrl + '/rules/es/mapping', () =>
  HttpResponse.json({}),
);

function searchHandler(
  protocolResponse: object,
  aggResponse: object = sankeyAggResponse,
) {
  return http.post(baseUrl + '/rules/es/search/', async ({ request }) => {
    const body = (await request.json()) as {
      aggs?: { aggs?: { protocols?: unknown } };
    };
    // Protocol discovery requests contain aggs.aggs.protocols
    if (body?.aggs?.aggs?.protocols) {
      return HttpResponse.json(protocolResponse);
    }
    // Aggregation requests for individual protocols
    return HttpResponse.json(aggResponse);
  });
}

describe('EventsFlowView', () => {
  beforeEach(() => {
    server.use(esMappingHandler, searchHandler(emptyProtocolsResponse));
  });

  it('renders loading state', async () => {
    server.use(
      http.post(
        baseUrl + '/rules/es/search/',
        async () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve(HttpResponse.json(emptyProtocolsResponse)),
              200,
            ),
          ),
      ),
    );

    await renderWithProviders(<EventsFlowView />, {
      preloadedState: { ...initialState },
    });

    expect(screen.getByTestId('spin')).toBeInTheDocument();
  });

  it('renders empty state when no protocols', async () => {
    await renderWithProviders(<EventsFlowView />, {
      preloadedState: { ...initialState },
    });

    await waitFor(() => {
      expect(screen.getByText('No events found')).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        'Either there are no events or the filters are too restrictive.',
      ),
    ).toBeInTheDocument();
  });

  it('renders protocol sections when protocols are returned', async () => {
    server.use(
      esMappingHandler,
      searchHandler(protocolsResponse, sankeyAggResponse),
    );

    await renderWithProviders(<EventsFlowView />, {
      preloadedState: { ...initialState },
    });

    await waitFor(() => {
      expect(screen.getByText('TLS')).toBeInTheDocument();
    });

    expect(screen.getByText('HTTP')).toBeInTheDocument();
  });
});
