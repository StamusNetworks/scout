import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { renderWithProviders } from '@/common/testing/test-utils';

import { EventValue } from './event-value';

const createTestRouter = () =>
  createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });

describe('Event Value', () => {
  test('Should add a filter to the store when clicked', async () => {
    const { store } = await renderWithProviders(
      <EventValue
        query_key="src_ip"
        value="10.0.0.1"
      />,
      { router: createTestRouter() },
    );

    await userEvent.click(screen.getByTestId('event-value'));

    const filters = store.getState().filters.queryFilters.queryFilters;
    expect(filters).toHaveLength(1);
    expect(filters[0]).toMatchObject({
      key: 'src_ip',
      value: '10.0.0.1',
      isNegated: false,
      isSuspended: false,
    });
  });
});
