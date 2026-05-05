import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/common/testing/test-utils';

import { PayloadCard } from './payload-card';

// "Hello" in base64
const HELLO_BASE64 = 'SGVsbG8=';

describe('PayloadCard', () => {
  it('renders the Payload title', () => {
    renderWithProviders(<PayloadCard base64={HELLO_BASE64} />);
    expect(screen.getByText('Payload')).toBeInTheDocument();
  });

  it('renders the View Hex menu item in the dropdown', async () => {
    renderWithProviders(<PayloadCard base64={HELLO_BASE64} />);

    await userEvent.click(
      screen.getByTestId('dashboard-card-dropdown-trigger'),
    );

    expect(screen.getByText('View Hex')).toBeInTheDocument();
  });

  it('opens the hex viewer dialog from the dropdown', async () => {
    renderWithProviders(<PayloadCard base64={HELLO_BASE64} />);

    await userEvent.click(
      screen.getByTestId('dashboard-card-dropdown-trigger'),
    );
    await userEvent.click(screen.getByText('View Hex'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
