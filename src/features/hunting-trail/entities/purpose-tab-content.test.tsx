import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/common/testing/test-utils';
import {
  makeLateralEvent,
  makeNrdEvent,
} from '@/features/events/common/events.mocks';
import { PurposeGroupData } from '@/features/hunting-trail/hooks/use-network-hunting-trail';

import { PurposeTabContent } from './purpose-tab-content';

const createTestRouter = () =>
  createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });

const makeEmptyGroup = (
  overrides: Partial<PurposeGroupData> = {},
): PurposeGroupData => ({
  events: [],
  count: 0,
  isLoading: false,
  isError: false,
  ...overrides,
});

describe('PurposeTabContent', () => {
  it('renders loading skeletons when group is loading', () => {
    renderWithProviders(
      <PurposeTabContent group={makeEmptyGroup({ isLoading: true })} />,
    );
    expect(document.querySelectorAll('.animate-pulse')).toHaveLength(3);
  });

  it('renders error state on failure', async () => {
    await renderWithProviders(
      <PurposeTabContent group={makeEmptyGroup({ isError: true })} />,
    );
    expect(
      screen.getByText(/failed to load data for this category/i),
    ).toBeInTheDocument();
  });

  it('renders empty state when no events', async () => {
    await renderWithProviders(<PurposeTabContent group={makeEmptyGroup()} />);
    expect(
      screen.getByText(
        /no events found for this category in the selected time range/i,
      ),
    ).toBeInTheDocument();
  });

  it('renders query cards with descriptions when data is present', async () => {
    const nrd = {
      ...makeNrdEvent({ _id: 'n1', timestamp: '2026-01-12T08:00:00Z' }),
      timelineType: 'nrd' as const,
    };
    await renderWithProviders(
      <PurposeTabContent group={makeEmptyGroup({ events: [nrd], count: 1 })} />,
      { router: createTestRouter() },
    );
    expect(screen.getByText('NRD')).toBeInTheDocument();
    expect(
      screen.getByText(/newly registered domains are disproportionately used/i),
    ).toBeInTheDocument();
  });

  it('renders multiple query cards for different types', async () => {
    const nrd = {
      ...makeNrdEvent({ _id: 'n1', timestamp: '2026-01-12T08:00:00Z' }),
      timelineType: 'nrd' as const,
    };
    const lateral = {
      ...makeLateralEvent({ _id: 'l1', timestamp: '2026-01-12T09:00:00Z' }),
      timelineType: 'lateral' as const,
    };
    await renderWithProviders(
      <PurposeTabContent
        group={makeEmptyGroup({ events: [nrd, lateral], count: 2 })}
      />,
      { router: createTestRouter() },
    );
    expect(screen.getByText('NRD')).toBeInTheDocument();
    expect(screen.getByText('Lateral')).toBeInTheDocument();
  });

  it('toggles between summary and events view', async () => {
    const nrd = {
      ...makeNrdEvent({ _id: 'n1', timestamp: '2026-01-12T08:00:00Z' }),
      timelineType: 'nrd' as const,
    };
    await renderWithProviders(
      <PurposeTabContent group={makeEmptyGroup({ events: [nrd], count: 1 })} />,
      { router: createTestRouter() },
    );
    expect(screen.getByText('Show events')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Show events'));
    expect(screen.getByText('Show summary')).toBeInTheDocument();
  });
});
