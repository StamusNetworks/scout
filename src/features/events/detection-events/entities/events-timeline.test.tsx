import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';
import { initialState } from '@/store/store.init';

import { EventsTimeline } from './events-timeline';

const mockTimeline = {
  from_date: 1700000000000,
  to_date: 1700086400000,
  interval: 3600000,
  probe1: {
    entries: [
      { time: 1700000000000, count: 5 },
      { time: 1700003600000, count: 3 },
    ],
  },
};

const timelineHandler = http.get(baseUrl + '/rules/es/timeline/', () =>
  HttpResponse.json(mockTimeline),
);

const enterpriseState = {
  ...initialState,
  settings: { enterprise: true },
};

const ceState = {
  ...initialState,
  settings: { enterprise: false },
};

describe('EventsTimeline', () => {
  beforeEach(() => {
    server.use(timelineHandler);
  });

  it('renders the chart when timeline data is available', async () => {
    await renderWithProviders(<EventsTimeline />, {
      preloadedState: enterpriseState,
    });

    await waitFor(() => {
      expect(document.querySelector('[data-slot="chart"]')).toBeInTheDocument();
    });
  });

  it('does not render the Tags/Probes toggle for non-enterprise users', async () => {
    await renderWithProviders(<EventsTimeline />, {
      preloadedState: ceState,
    });

    expect(screen.queryByText('Tags')).not.toBeInTheDocument();
    expect(screen.queryByText('Probes')).not.toBeInTheDocument();
  });

  it('renders the Tags/Probes toggle for enterprise users', async () => {
    await renderWithProviders(<EventsTimeline />, {
      preloadedState: enterpriseState,
    });

    expect(screen.getByText('Tags')).toBeInTheDocument();
    expect(screen.getByText('Probes')).toBeInTheDocument();
  });

  it('switches between Tags and Probes', async () => {
    const user = userEvent.setup();

    await renderWithProviders(<EventsTimeline />, {
      preloadedState: enterpriseState,
    });

    const probesTab = screen.getByText('Probes');
    await user.click(probesTab);

    // After clicking Probes the toggle remains visible
    expect(screen.getByText('Tags')).toBeInTheDocument();
    expect(screen.getByText('Probes')).toBeInTheDocument();
  });
});
