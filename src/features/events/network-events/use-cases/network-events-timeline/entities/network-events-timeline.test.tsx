import { waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';
import { initialState } from '@/store/store.init';

import { NetworkEventsTimeline } from './network-events-timeline';

const mockTimelineResponse = {
  aggregations: {
    date: {
      buckets: [
        { key: 1700000000000, doc_count: 5 },
        { key: 1700003600000, doc_count: 3 },
      ],
    },
  },
};

const timelineHandler = http.get(baseUrl + '/rules/es/events_timeline/', () =>
  HttpResponse.json(mockTimelineResponse),
);

describe('NetworkEventsTimeline', () => {
  beforeEach(() => {
    server.use(timelineHandler);
  });

  it('renders the chart when timeline data is available', async () => {
    await renderWithProviders(<NetworkEventsTimeline />, {
      preloadedState: { ...initialState },
    });

    await waitFor(() => {
      expect(document.querySelector('[data-slot="chart"]')).toBeInTheDocument();
    });
  });
});
