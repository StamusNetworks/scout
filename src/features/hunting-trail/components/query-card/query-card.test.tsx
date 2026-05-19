import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/common/testing/test-utils';

import type { QueryGroup } from '../../model/purpose-grouping';
import { QueryCard } from './query-card';

const baseGroup: QueryGroup = {
  type: 'nrd',
  name: 'My Filterset Name',
  description: 'My filterset **description**.',
  events: [],
  startTime: '2026-01-12T00:00:00Z',
  endTime: '2026-01-12T01:00:00Z',
};

describe('QueryCard', () => {
  it('renders the title from group.name (not TYPE_LABEL)', async () => {
    await renderWithProviders(<QueryCard group={baseGroup} />);
    expect(screen.getByText('My Filterset Name')).toBeInTheDocument();
  });

  it('renders the description markdown from group.description (not QUERY_DESCRIPTION)', async () => {
    await renderWithProviders(<QueryCard group={baseGroup} />);
    // The markdown renderer surfaces the description text
    expect(screen.getByText(/My filterset/)).toBeInTheDocument();
  });
});
