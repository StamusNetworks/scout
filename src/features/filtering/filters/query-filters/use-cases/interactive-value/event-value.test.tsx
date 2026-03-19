import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/common/testing/test-utils';
import * as AppStore from '@/store/store';

import { addQueryFilter } from '../../query-filters.store';
import { EventValue } from './event-value';

const createTestRouter = () =>
  createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });

describe('Event Value', () => {
  test('Should dispatch the createFilter action', async () => {
    const dispatch = vi.fn();
    vi.spyOn(AppStore, 'useAppDispatch').mockReturnValue(dispatch);
    await renderWithProviders(
      <EventValue
        query_key="src_ip"
        value="10.0.0.1"
      />,
      { router: createTestRouter() },
    );

    await userEvent.click(screen.getByTestId('event-value'));

    // Use expect.objectContaining to match the filter structure without relying on the specific ID
    expect(dispatch).toHaveBeenCalledWith(
      addQueryFilter({
        key: 'src_ip',
        value: '10.0.0.1',
      }),
    );
  });
});
