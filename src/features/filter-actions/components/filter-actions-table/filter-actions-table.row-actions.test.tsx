import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, test } from 'vitest';

import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';

import { FilterAction } from '../../model/filter-action';
import { FilterActionRowActions } from './filter-actions-table.row-actions';

const createTestRouter = () =>
  createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });

const filterActionWithMultipleFilters: FilterAction = {
  id: 1,
  kind: 'suppress',
  eventType: 'alert',
  filterDefs: [
    {
      key: 'src_ip',
      value: '10.0.0.1',
      isNegated: false,
      isWildcarded: false,
    },
    {
      key: 'dest_ip',
      value: '10.0.0.2',
      isNegated: true,
      isWildcarded: true,
    },
  ],
  rulesets: [],
  index: 0,
  description: '',
  enabled: true,
  imported: false,
  comment: '',
  username: 'tester',
  createdAt: '2026-04-28T00:00:00Z',
};

describe('FilterActionRowActions - Convert to filters', () => {
  test('replaces query filters with all filter defs, not just the last one', async () => {
    server.use(
      http.get(baseUrl + '/rules/processing-filter/', () =>
        HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [
            {
              pk: 1,
              action: 'suppress',
              event_type: 'alert',
              filter_defs: [
                {
                  key: 'src_ip',
                  value: '10.0.0.1',
                  operator: 'equal',
                  full_string: true,
                },
                {
                  key: 'dest_ip',
                  value: '10.0.0.2',
                  operator: 'different',
                  full_string: false,
                },
              ],
              rulesets: [],
              index: 0,
              description: '',
              enabled: true,
              imported: false,
              comment: '',
              username: 'tester',
              creation_date: '2026-04-28T00:00:00Z',
              options: {},
            },
          ],
        }),
      ),
    );

    const user = userEvent.setup();
    const { store } = await renderWithProviders(
      <FilterActionRowActions filterAction={filterActionWithMultipleFilters} />,
      { router: createTestRouter() },
    );

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeEnabled();
    });

    await user.click(screen.getByRole('button'));
    await user.click(await screen.findByText('Convert to filters'));

    const filters = store.getState().filters.queryFilters.queryFilters;
    expect(filters).toHaveLength(2);
    expect(filters[0]).toMatchObject({
      key: 'src_ip',
      value: '10.0.0.1',
      isNegated: false,
      isWildcarded: false,
      isSuspended: false,
    });
    expect(filters[1]).toMatchObject({
      key: 'dest_ip',
      value: '10.0.0.2',
      isNegated: true,
      isWildcarded: true,
      isSuspended: false,
    });
  });
});
