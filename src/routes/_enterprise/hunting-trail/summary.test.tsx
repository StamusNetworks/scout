import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from '@tanstack/react-router';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/common/testing/test-utils';
import { NetworkHuntingTrailProvider } from '@/features/hunting-trail';
import {
  PURPOSE_SLUGS,
  type PurposeGroupData,
  type PurposeSlug,
  type TaggedEvent,
} from '@/features/hunting-trail/model/hunting-trail';

import { Route as SummaryRoute } from './summary';

const makeEvent = (
  asset: { src?: string; dest?: string },
  timelineType: TaggedEvent['timelineType'] = 'lateral',
): TaggedEvent =>
  ({
    src_ip: asset.src,
    dest_ip: asset.dest,
    timelineType,
    timestamp: '2026-01-01T00:00:00Z',
  }) as unknown as TaggedEvent;

const emptyGroups = (): Record<PurposeSlug, PurposeGroupData> =>
  Object.fromEntries(
    PURPOSE_SLUGS.map(({ slug }) => [
      slug,
      { events: [], count: 0, isLoading: false, isError: false },
    ]),
  ) as unknown as Record<PurposeSlug, PurposeGroupData>;

const fixtureGroups = (): Record<PurposeSlug, PurposeGroupData> => {
  const base = emptyGroups();
  base['lateral-movement'] = {
    events: [
      makeEvent({ src: '10.0.0.1' }, 'lateral'),
      makeEvent({ src: '10.0.0.2' }, 'lateral'),
      makeEvent({ src: '10.0.0.2' }, 'remoteAdmin'),
    ],
    count: 3,
    isLoading: false,
    isError: false,
  };
  base['file-activity'] = {
    events: [makeEvent({ src: '10.0.0.2' }, 'file')],
    count: 1,
    isLoading: false,
    isError: false,
  };
  return base;
};

// Mount the real Summary route under a fake root that provides the
// NetworkHuntingTrailProvider value that the real parent route normally sets up.
const createTestRouter = (initialPath: string) => {
  const rootRoute = createRootRoute({
    component: () => (
      <NetworkHuntingTrailProvider value={{ groups: fixtureGroups() }}>
        <Outlet />
      </NetworkHuntingTrailProvider>
    ),
  });
  const summaryRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/summary',
    validateSearch: SummaryRoute.options.validateSearch,
    component: SummaryRoute.options.component,
  });
  rootRoute.addChildren([summaryRoute]);
  return createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
};

const renderRoute = async (initialPath: string) => {
  const router = createTestRouter(initialPath);
  const result = await renderWithProviders(<></>, { router });
  return { ...result, router };
};

describe('Hunting Trail Summary route', () => {
  it('renders with default order when no sort param is present', async () => {
    await renderRoute('/summary');

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    const tbody = screen.getByRole('table').querySelector('tbody')!;
    const ipCells = Array.from(tbody.querySelectorAll('tr')).map(
      (tr) => tr.querySelector('[data-testid="event-value"]')?.textContent,
    );
    // .2 has 3 queries-with-results (lateral, remoteAdmin, file), .1 has 1 → .2 first
    expect(ipCells[0]).toContain('10.0.0.2');
    expect(ipCells[1]).toContain('10.0.0.1');
  });

  it('renders sorted by URL sort param on first paint (?sort=-lateral-movement)', async () => {
    await renderRoute('/summary?sort=-lateral-movement');

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    // The Lateral Movement header should show the descending arrow on first paint.
    const headerRow = screen.getByRole('row', { name: /asset/i });
    const lateralHeader = within(headerRow)
      .getByText(/lateral movement/i)
      .closest('th') as HTMLElement;
    expect(
      within(lateralHeader).getByRole('button', { name: /sorted descending/i }),
    ).toBeInTheDocument();
  });

  it('writes the new sort value to the URL when a header sort is chosen', async () => {
    const user = userEvent.setup();
    const { router } = await renderRoute('/summary');

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    const headerRow = screen.getByRole('row', { name: /asset/i });
    const lateralHeader = within(headerRow)
      .getByText(/lateral movement/i)
      .closest('th') as HTMLElement;
    await user.click(
      within(lateralHeader).getByRole('button', { name: /not sorted/i }),
    );
    const descItem = await screen.findByRole('menuitem', { name: /desc/i });
    await user.click(descItem);

    await waitFor(() => {
      expect(router.state.location.search).toEqual(
        expect.objectContaining({ sort: '-lateral-movement' }),
      );
    });
  });

  it('resets page to 1 when sort changes from page=2', async () => {
    const user = userEvent.setup();
    const { router } = await renderRoute('/summary?page=2');

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    const headerRow = screen.getByRole('row', { name: /asset/i });
    const lateralHeader = within(headerRow)
      .getByText(/lateral movement/i)
      .closest('th') as HTMLElement;
    await user.click(
      within(lateralHeader).getByRole('button', { name: /not sorted/i }),
    );
    const ascItem = await screen.findByRole('menuitem', { name: /asc/i });
    await user.click(ascItem);

    await waitFor(() => {
      expect(router.state.location.search).toEqual(
        expect.objectContaining({ sort: 'lateral-movement', page: 1 }),
      );
    });
  });
});
