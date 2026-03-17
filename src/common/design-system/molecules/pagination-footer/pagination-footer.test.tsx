import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/common/testing/test-utils';

import { PaginationFooter } from './pagination-footer';

const defaultProps = {
  page: 1,
  pageSize: 10,
  total: 100,
  onPageChange: vi.fn(),
  onPageSizeChange: vi.fn(),
};

describe('PaginationFooter', () => {
  it('renders the total count', async () => {
    await renderWithProviders(<PaginationFooter {...defaultProps} />);

    expect(screen.getByText('Total items count: 100')).toBeInTheDocument();
  });

  it('disables previous-page buttons on the first page', async () => {
    await renderWithProviders(
      <PaginationFooter
        {...defaultProps}
        page={1}
      />,
    );

    const prevButtons = screen.getAllByRole('button', {
      name: /go to (first|previous) page/i,
    });
    prevButtons.forEach((btn) => expect(btn).toBeDisabled());
  });

  it('disables next-page buttons on the last page', async () => {
    await renderWithProviders(
      <PaginationFooter
        {...defaultProps}
        page={10}
        pageSize={10}
        total={100}
      />,
    );

    const nextButtons = screen.getAllByRole('button', {
      name: /go to (last|next) page/i,
    });
    nextButtons.forEach((btn) => expect(btn).toBeDisabled());
  });

  it('enables navigation buttons on a middle page', async () => {
    await renderWithProviders(
      <PaginationFooter
        {...defaultProps}
        page={5}
        pageSize={10}
        total={100}
      />,
    );

    const prevButtons = screen.getAllByRole('button', {
      name: /go to (first|previous) page/i,
    });
    const nextButtons = screen.getAllByRole('button', {
      name: /go to (last|next) page/i,
    });

    prevButtons.forEach((btn) => expect(btn).toBeEnabled());
    nextButtons.forEach((btn) => expect(btn).toBeEnabled());
  });

  it('calls onPageChange with the next page number when next is clicked', async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();

    await renderWithProviders(
      <PaginationFooter
        {...defaultProps}
        page={3}
        pageSize={10}
        total={100}
        onPageChange={onPageChange}
      />,
    );

    const nextButton = screen.getByRole('button', { name: /go to next page/i });
    await user.click(nextButton);

    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('calls onPageChange with the previous page number when previous is clicked', async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();

    await renderWithProviders(
      <PaginationFooter
        {...defaultProps}
        page={3}
        pageSize={10}
        total={100}
        onPageChange={onPageChange}
      />,
    );

    const prevButton = screen.getByRole('button', {
      name: /go to previous page/i,
    });
    await user.click(prevButton);

    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
