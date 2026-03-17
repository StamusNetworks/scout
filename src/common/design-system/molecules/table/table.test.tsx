import { Row } from '@tanstack/react-table';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { renderWithProviders } from '@/common/testing/test-utils';

import { Table } from './table';

type TestRow = { id: string; name: string; age: number };

const columns: CustomColumnDef<TestRow>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
  },
  {
    id: 'age',
    accessorKey: 'age',
    header: 'Age',
  },
];

const data: TestRow[] = [
  { id: '1', name: 'Alice', age: 30 },
  { id: '2', name: 'Bob', age: 25 },
  { id: '3', name: 'Charlie', age: 35 },
];

describe('Table', () => {
  it('renders column headers', async () => {
    await renderWithProviders(
      <Table
        data={data}
        columns={columns}
        reorder={false}
      />,
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
  });

  it('renders rows with data', async () => {
    await renderWithProviders(
      <Table
        data={data}
        columns={columns}
        reorder={false}
      />,
    );

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(screen.getByText('35')).toBeInTheDocument();
  });

  it('renders the default empty state when data is empty', async () => {
    await renderWithProviders(
      <Table
        data={[]}
        columns={columns}
        reorder={false}
      />,
    );

    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('renders a custom empty state when provided', async () => {
    await renderWithProviders(
      <Table
        data={[]}
        columns={columns}
        reorder={false}
        Empty={<div>Custom empty</div>}
      />,
    );

    expect(screen.getByText('Custom empty')).toBeInTheDocument();
    expect(screen.queryByText('No results found')).not.toBeInTheDocument();
  });

  it('renders loading skeletons when isLoading is true', async () => {
    await renderWithProviders(
      <Table
        data={[]}
        columns={columns}
        isLoading
        skeletonRows={3}
        reorder={false}
      />,
    );

    const skeletons = screen.getAllByTestId('skeleton');
    // 3 rows x 2 columns = 6 skeleton cells
    expect(skeletons).toHaveLength(6);
  });

  it('defaults to 10 skeleton rows', async () => {
    await renderWithProviders(
      <Table
        data={[]}
        columns={columns}
        isLoading
        reorder={false}
      />,
    );

    const skeletons = screen.getAllByTestId('skeleton');
    // 10 rows x 2 columns = 20
    expect(skeletons).toHaveLength(20);
  });

  it('calls onRowClick when a row is clicked', async () => {
    const onRowClick = vi.fn();
    const user = userEvent.setup();

    await renderWithProviders(
      <Table
        data={data}
        columns={columns}
        onRowClick={onRowClick}
        reorder={false}
      />,
    );

    await user.click(screen.getByText('Alice'));

    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick.mock.calls[0][0].original).toEqual(data[0]);
  });

  it('renders row selection checkboxes when rowSelection is provided', async () => {
    await renderWithProviders(
      <Table
        data={data}
        columns={columns}
        rowSelection={{}}
        onRowSelectionChange={vi.fn()}
        reorder={false}
      />,
    );

    // 1 header checkbox + 3 row checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(4);
  });

  it('does not render checkboxes when rowSelection is not provided', async () => {
    await renderWithProviders(
      <Table
        data={data}
        columns={columns}
        reorder={false}
      />,
    );

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('renders expanded row content when a row is expanded', async () => {
    const ExpandedRow = ({ row }: { row: Row<TestRow> }) => (
      <div>Expanded: {row.original.name}</div>
    );

    await renderWithProviders(
      <Table
        data={data}
        columns={columns}
        expanded={{ 0: true }}
        onExpandedChange={vi.fn()}
        ExpandedRow={ExpandedRow}
        reorder={false}
      />,
    );

    expect(screen.getByText('Expanded: Alice')).toBeInTheDocument();
    // Only the first row is expanded
    expect(screen.queryByText('Expanded: Bob')).not.toBeInTheDocument();
  });

  it('uses getRowId when provided', async () => {
    const onRowClick = vi.fn();
    const user = userEvent.setup();

    await renderWithProviders(
      <Table
        data={data}
        columns={columns}
        getRowId={(row) => row.id}
        onRowClick={onRowClick}
        reorder={false}
      />,
    );

    await user.click(screen.getByText('Alice'));

    expect(onRowClick.mock.calls[0][0].id).toBe('1');
  });

  it('applies the correct cursor class for rowClickCursor', async () => {
    await renderWithProviders(
      <Table
        data={data}
        columns={columns}
        onRowClick={vi.fn()}
        rowClickCursor="pointer"
        reorder={false}
      />,
    );

    // The row containing "Alice" should have cursor-pointer
    const row = screen.getByText('Alice').closest('tr');
    expect(row).toHaveClass('cursor-pointer');
  });

  it('does not render toolbar or pagination', async () => {
    await renderWithProviders(
      <Table
        data={data}
        columns={columns}
        reorder={false}
      />,
    );

    // No pagination controls
    expect(screen.queryByText('Rows per page')).not.toBeInTheDocument();
    // The table should be the main element, no toolbar wrapping
    const tableEl = screen.getByRole('table');
    expect(tableEl).toBeInTheDocument();
  });

  it('respects column visibility', async () => {
    await renderWithProviders(
      <Table
        data={data}
        columns={columns}
        columnVisibility={{ age: false }}
        onColumnVisibilityChange={vi.fn()}
        reorder={false}
      />,
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.queryByText('Age')).not.toBeInTheDocument();
    // Age values should also be hidden
    expect(screen.queryByText('30')).not.toBeInTheDocument();
  });

  it('respects column order when reorder is enabled', async () => {
    await renderWithProviders(
      <Table
        data={data}
        columns={columns}
        columnOrder={['age', 'name']}
        onColumnOrderChange={vi.fn()}
        reorder
      />,
    );

    // Both headers still present
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();

    // Check the order: Age should come before Name in the header row
    const headerRow = screen.getAllByRole('columnheader');
    const ageIndex = headerRow.findIndex((h) => within(h).queryByText('Age'));
    const nameIndex = headerRow.findIndex((h) => within(h).queryByText('Name'));
    expect(ageIndex).toBeLessThan(nameIndex);
  });
});
