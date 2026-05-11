import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/common/testing/test-utils';

import {
  PURPOSE_SLUGS,
  type PurposeGroupData,
  type PurposeSlug,
  type TaggedEvent,
} from '../../model/hunting-trail';
import { SummaryMatrix } from './summary-matrix';

const createTestRouter = () =>
  createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({
      initialEntries: ['/hunting-trail/summary'],
    }),
  });

const renderMatrix = (groups: Record<PurposeSlug, PurposeGroupData>) =>
  renderWithProviders(<SummaryMatrix groups={groups} />, {
    router: createTestRouter(),
  });

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

const setEvents = (
  groups: Record<PurposeSlug, PurposeGroupData>,
  slug: PurposeSlug,
  events: TaggedEvent[],
): Record<PurposeSlug, PurposeGroupData> => ({
  ...groups,
  [slug]: { events, count: events.length, isLoading: false, isError: false },
});

const setLoading = (
  groups: Record<PurposeSlug, PurposeGroupData>,
): Record<PurposeSlug, PurposeGroupData> =>
  Object.fromEntries(
    Object.entries(groups).map(([slug, g]) => [
      slug,
      { ...g, isLoading: true },
    ]),
  ) as Record<PurposeSlug, PurposeGroupData>;

const setAllErrored = (
  groups: Record<PurposeSlug, PurposeGroupData>,
): Record<PurposeSlug, PurposeGroupData> =>
  Object.fromEntries(
    Object.entries(groups).map(([slug, g]) => [slug, { ...g, isError: true }]),
  ) as Record<PurposeSlug, PurposeGroupData>;

describe('SummaryMatrix', () => {
  it('renders one column per purpose slug plus the asset column', async () => {
    const groups = setEvents(emptyGroups(), 'lateral-movement', [
      makeEvent({ src: '10.0.0.5' }),
    ]);
    await renderMatrix(groups);
    const header = screen.getByRole('row', { name: /asset/i });
    const headerCells = within(header).getAllByRole('columnheader');
    expect(headerCells.length).toBeGreaterThanOrEqual(PURPOSE_SLUGS.length + 1);
  });

  it('renders non-empty cells as "<events> events · <queries> queries"', async () => {
    const groups = setEvents(emptyGroups(), 'lateral-movement', [
      makeEvent({ src: '10.0.0.5' }, 'lateral'),
      makeEvent({ src: '10.0.0.5' }, 'remoteAdmin'),
    ]);
    await renderMatrix(groups);
    expect(screen.getByText(/2 events · 2 queries/)).toBeInTheDocument();
  });

  it('shows the empty state copy when no assets have any hits', async () => {
    await renderMatrix(emptyGroups());
    expect(
      screen.getByText(/no suspicious activity in the selected time range/i),
    ).toBeInTheDocument();
  });

  it('shows a table-shaped skeleton when any group is loading', async () => {
    const loadingGroups = setLoading(emptyGroups());
    await renderMatrix(loadingGroups);
    // skeleton renders the real table layout with skeleton-filled cells
    const table = screen.getByRole('table');
    const headerCells = within(table).getAllByRole('columnheader');
    expect(headerCells.length).toBeGreaterThanOrEqual(PURPOSE_SLUGS.length + 1);
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(5);
  });

  it('renders skeleton rows matching the page size from the URL (default 20)', async () => {
    const loadingGroups = setLoading(emptyGroups());
    await renderMatrix(loadingGroups);
    const tbody = screen.getByRole('table').querySelector('tbody');
    expect(tbody).not.toBeNull();
    expect(tbody!.querySelectorAll('tr')).toHaveLength(20);
  });

  it('shows the error state when every group has errored', async () => {
    const erroredGroups = setAllErrored(emptyGroups());
    await renderMatrix(erroredGroups);
    expect(
      screen.getByText(/failed to load summary matrix/i),
    ).toBeInTheDocument();
  });

  it('renders the asset cell as an interactive EventValue (filter key="ip")', async () => {
    const groups = setEvents(emptyGroups(), 'lateral-movement', [
      makeEvent({ src: '10.0.0.5' }),
    ]);
    await renderMatrix(groups);
    const eventValues = screen.getAllByTestId('event-value');
    expect(eventValues.some((el) => el.textContent?.includes('10.0.0.5'))).toBe(
      true,
    );
  });

  it('keeps event-count cells inert — no buttons, no links inside the matrix cells', async () => {
    const groups = setEvents(emptyGroups(), 'lateral-movement', [
      makeEvent({ src: '10.0.0.5' }),
    ]);
    await renderMatrix(groups);
    const cell = screen.getByText(/1 events · 1 queries/i).closest('td')!;
    expect(within(cell).queryAllByRole('button')).toHaveLength(0);
    expect(within(cell).queryAllByRole('link')).toHaveLength(0);
  });

  it('shows an expand toggle per data row', async () => {
    const groups = setEvents(emptyGroups(), 'lateral-movement', [
      makeEvent({ src: '10.0.0.5' }, 'lateral'),
      makeEvent({ src: '10.0.0.7' }, 'lateral'),
    ]);
    await renderMatrix(groups);
    // The Table molecule's DataTableRowExpander button shows '+' when collapsed
    expect(screen.getAllByRole('button', { name: '+' })).toHaveLength(2);
  });

  it('expands a row to show the per-asset hunting trail filtered to that asset', async () => {
    const groups = setEvents(emptyGroups(), 'lateral-movement', [
      makeEvent({ src: '10.0.0.5' }, 'lateral'),
      makeEvent({ src: '10.0.0.5' }, 'lateral'),
      makeEvent({ src: '10.0.0.7' }, 'lateral'),
    ]);
    await renderMatrix(groups);
    const user = userEvent.setup();
    const row = screen.getByText('10.0.0.5').closest('tr')!;
    const expanderBtn = within(row).getByRole('button', { name: '+' });
    await user.click(expanderBtn);
    // PurposeAggregated renders the purpose-group label inside the expanded row
    // — once in the column header, once in the expanded body
    expect(screen.getAllByText(/lateral movement/i).length).toBeGreaterThan(1);
    // Cell sums + PurposeAggregated both report "2 events" for this asset
    expect(screen.getAllByText(/2 events/i).length).toBeGreaterThan(0);
  });

  it('collapses an expanded row when the toggle is clicked again', async () => {
    const groups = setEvents(emptyGroups(), 'lateral-movement', [
      makeEvent({ src: '10.0.0.5' }, 'lateral'),
    ]);
    await renderMatrix(groups);
    const user = userEvent.setup();
    const row = screen.getByText('10.0.0.5').closest('tr')!;
    await user.click(within(row).getByRole('button', { name: '+' }));
    expect(screen.getAllByText(/lateral movement/i).length).toBeGreaterThan(1);
    await user.click(within(row).getByRole('button', { name: '-' }));
    // After collapse, only the column header "Lateral Movement" should remain
    expect(screen.getAllByText(/lateral movement/i)).toHaveLength(1);
  });

  it('paginates with size options 10, 20, 30, 40, 50', async () => {
    const events = Array.from({ length: 25 }, (_, i) =>
      makeEvent({ src: `10.0.0.${i + 1}` }, 'lateral'),
    );
    const groups = setEvents(emptyGroups(), 'lateral-movement', events);
    await renderMatrix(groups);

    // RowsPerPage is the combobox next to the "Rows per page" label
    const rowsPerPageContainer = screen
      .getByText(/rows per page/i)
      .closest('div')!;
    const trigger = within(rowsPerPageContainer).getByRole('combobox');
    const user = userEvent.setup();
    await user.click(trigger);
    for (const size of [10, 20, 30, 40, 50]) {
      expect(
        screen.getByRole('option', { name: String(size) }),
      ).toBeInTheDocument();
    }
  });
});
