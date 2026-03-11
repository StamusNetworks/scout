import { createMemoryHistory, createRouter } from '@tanstack/react-router';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/common/testing/test-utils';
import { routeTree } from '@/routeTree.gen';
import * as AppStore from '@/store/store';
import { setupStore } from '@/store/store';

import { addQueryFilter } from '../../store/query-filters.slice';
import { EventValue } from './event-value';

const createTestRouter = () =>
  createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
    context: { store: setupStore() },
  });

describe('Event Value', () => {
  test('Should dispatch the createFilter action', async () => {
    const dispatch = vi.fn();
    vi.spyOn(AppStore, 'useAppDispatch').mockReturnValue(dispatch);
    renderWithProviders(
      <EventValue
        query_key="src_ip"
        value="10.0.0.1"
      />,
      { router: createTestRouter() },
    );

    await userEvent.click(screen.getByTestId('event-value'));

    // const filter = createFilter('src_ip', '10.0.0.1');
    // expect(dispatch).toHaveBeenCalledWith(addQueryFilter(filter));

    // Use expect.objectContaining to match the filter structure without relying on the specific ID
    expect(dispatch).toHaveBeenCalledWith(
      addQueryFilter({
        key: 'src_ip',
        value: '10.0.0.1',
      }),
    );
  });
});
