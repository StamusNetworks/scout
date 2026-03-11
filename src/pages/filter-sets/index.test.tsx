import { createMemoryHistory, createRouter } from '@tanstack/react-router';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';
import { routeTree } from '@/routeTree.gen';

import { FilterSetsPage } from './index';

const createTestRouter = () =>
  createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });

const mockFilterSets = [
  {
    id: 1,
    name: 'My Filter Set',
    description: 'A test filter set',
    page: 'ALERTS_LIST',
    share: 'private',
    imported: false,
    content: [
      {
        id: 'src_ip',
        label: 'src_ip',
        value: '10.0.0.1',
        negated: false,
        fullString: true,
      },
    ],
  },
  {
    id: 2,
    name: 'Another Set',
    description: 'Another test',
    page: 'ALERTS_LIST',
    share: 'global',
    imported: false,
    content: [],
  },
];

const renderPage = () =>
  renderWithProviders(<FilterSetsPage />, {
    router: createTestRouter(),
  });

const getDeleteButtons = () =>
  screen.getAllByTestId('delete-filter-set-trigger');

beforeEach(() => {
  server.use(
    http.get(baseUrl + '/rules/hunt_filter_sets/', () =>
      HttpResponse.json(mockFilterSets),
    ),
  );
});

describe('FilterSetsPage - Delete', () => {
  it('shows delete button for user-created filter sets', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('My Filter Set')).toBeInTheDocument();
    });

    expect(getDeleteButtons().length).toBe(2);
  });

  it('opens delete confirmation modal when clicking delete', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('My Filter Set')).toBeInTheDocument();
    });

    await user.click(getDeleteButtons()[0]);

    await waitFor(() => {
      expect(screen.getByText('Delete "My Filter Set"')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Deleting a filter set is permanent and cannot be undone.',
        ),
      ).toBeInTheDocument();
    });
  });

  it('calls delete API and shows success toast on confirm', async () => {
    let deleteCalled = false;
    server.use(
      http.delete(baseUrl + '/rules/hunt_filter_sets/1/', () => {
        deleteCalled = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('My Filter Set')).toBeInTheDocument();
    });

    await user.click(getDeleteButtons()[0]);

    await waitFor(() => {
      expect(screen.getByText('Delete "My Filter Set"')).toBeInTheDocument();
    });

    const dialog = screen.getByRole('dialog');
    const confirmButton = within(dialog).getByRole('button', {
      name: /delete/i,
    });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(deleteCalled).toBe(true);
    });
  });

  it('can cancel the delete modal', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('My Filter Set')).toBeInTheDocument();
    });

    await user.click(getDeleteButtons()[0]);

    await waitFor(() => {
      expect(screen.getByText('Delete "My Filter Set"')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(
        screen.queryByText('Delete "My Filter Set"'),
      ).not.toBeInTheDocument();
    });
  });
});
