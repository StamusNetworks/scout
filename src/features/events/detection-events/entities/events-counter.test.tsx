import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';
import { initialState } from '@/store/store.init';

import { EventsCounter } from './events-counter';

const alertsCountHandler = (doc_count = 0, prev_doc_count = 0) =>
  http.get(baseUrl + '/rules/es/alerts_count', () =>
    HttpResponse.json({ doc_count, prev_doc_count }),
  );

describe('EventsCounter', () => {
  it('renders without crashing', async () => {
    server.use(alertsCountHandler());

    const { container } = await renderWithProviders(<EventsCounter />, {
      preloadedState: { ...initialState },
    });

    expect(container).toBeInTheDocument();
  });

  it('shows loading spinner while fetching data', async () => {
    server.use(
      http.get(baseUrl + '/rules/es/alerts_count', async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return HttpResponse.json({ doc_count: 0, prev_doc_count: 0 });
      }),
    );

    await renderWithProviders(<EventsCounter />, {
      preloadedState: { ...initialState },
    });

    expect(screen.getByTestId('spin')).toBeInTheDocument();
  });

  it('shows zero state when there are no events', async () => {
    server.use(alertsCountHandler(0, 0));

    await renderWithProviders(<EventsCounter />, {
      preloadedState: { ...initialState },
    });

    // The empty state renders "0" and "Current count"
    const zeroText = await screen.findByText('0');
    expect(zeroText).toBeInTheDocument();
    expect(screen.getByText('Current count')).toBeInTheDocument();
  });
});
