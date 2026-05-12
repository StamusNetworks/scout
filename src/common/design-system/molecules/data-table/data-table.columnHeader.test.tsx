import type { Column } from '@tanstack/react-table';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DataTableColumnHeader } from './data-table.columnHeader';

type FakeColumn = Pick<
  Column<unknown, unknown>,
  | 'getCanSort'
  | 'getIsSorted'
  | 'toggleSorting'
  | 'clearSorting'
  | 'toggleVisibility'
>;

const makeColumn = (
  isSorted: false | 'asc' | 'desc',
  canSort = true,
): FakeColumn => ({
  getCanSort: () => canSort,
  getIsSorted: () => isSorted,
  toggleSorting: vi.fn(),
  clearSorting: vi.fn(),
  toggleVisibility: vi.fn(),
});

describe('DataTableColumnHeader', () => {
  it('renders the neutral caret when the column is not sorted', () => {
    render(
      <DataTableColumnHeader
        column={makeColumn(false) as Column<unknown, unknown>}
        title="Asset"
      />,
    );
    const trigger = screen.getByRole('button', { name: /not sorted/i });
    expect(trigger).toBeInTheDocument();
  });

  it('renders an upward arrow when the column is sorted ascending', () => {
    render(
      <DataTableColumnHeader
        column={makeColumn('asc') as Column<unknown, unknown>}
        title="Asset"
      />,
    );
    const trigger = screen.getByRole('button', { name: /sorted ascending/i });
    expect(trigger).toBeInTheDocument();
  });

  it('renders a downward arrow when the column is sorted descending', () => {
    render(
      <DataTableColumnHeader
        column={makeColumn('desc') as Column<unknown, unknown>}
        title="Asset"
      />,
    );
    const trigger = screen.getByRole('button', { name: /sorted descending/i });
    expect(trigger).toBeInTheDocument();
  });

  it('still renders the neutral caret when sorting is disabled on the column', () => {
    render(
      <DataTableColumnHeader
        column={makeColumn(false, false) as Column<unknown, unknown>}
        title="Asset"
      />,
    );
    const trigger = screen.getByRole('button', { name: /not sorted/i });
    expect(trigger).toBeInTheDocument();
  });

  it('renders the neutral caret when no column prop is passed', () => {
    render(<DataTableColumnHeader title="Asset" />);
    const trigger = screen.getByRole('button', { name: /not sorted/i });
    expect(trigger).toBeInTheDocument();
  });

  it('clicking Asc when the column is not sorted sets ascending', async () => {
    const column = makeColumn(false);
    render(
      <DataTableColumnHeader
        column={column as Column<unknown, unknown>}
        title="Asset"
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /not sorted/i }));
    await user.click(await screen.findByRole('menuitem', { name: /asc/i }));
    expect(column.toggleSorting).toHaveBeenCalledWith(false);
    expect(column.clearSorting).not.toHaveBeenCalled();
  });

  it('clicking Asc when the column is already ascending clears the sort', async () => {
    const column = makeColumn('asc');
    render(
      <DataTableColumnHeader
        column={column as Column<unknown, unknown>}
        title="Asset"
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /sorted ascending/i }));
    await user.click(await screen.findByRole('menuitem', { name: /asc/i }));
    expect(column.clearSorting).toHaveBeenCalledTimes(1);
    expect(column.toggleSorting).not.toHaveBeenCalled();
  });

  it('clicking Desc when the column is already descending clears the sort', async () => {
    const column = makeColumn('desc');
    render(
      <DataTableColumnHeader
        column={column as Column<unknown, unknown>}
        title="Asset"
      />,
    );
    const user = userEvent.setup();
    await user.click(
      screen.getByRole('button', { name: /sorted descending/i }),
    );
    await user.click(await screen.findByRole('menuitem', { name: /desc/i }));
    expect(column.clearSorting).toHaveBeenCalledTimes(1);
    expect(column.toggleSorting).not.toHaveBeenCalled();
  });

  it('clicking Desc when the column is ascending sets descending (not toggle)', async () => {
    const column = makeColumn('asc');
    render(
      <DataTableColumnHeader
        column={column as Column<unknown, unknown>}
        title="Asset"
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /sorted ascending/i }));
    await user.click(await screen.findByRole('menuitem', { name: /desc/i }));
    expect(column.toggleSorting).toHaveBeenCalledWith(true);
    expect(column.clearSorting).not.toHaveBeenCalled();
  });
});
