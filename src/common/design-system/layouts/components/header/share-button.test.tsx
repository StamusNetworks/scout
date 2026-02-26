import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/common/testing/test-utils';
import { decodeShareableState } from '@/features/ui/share/shareable-state';
import { initialState } from '@/store/store.init';

import { ShareButton } from './share-button';

// Mock clipboard API
const writeText = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText },
  writable: true,
  configurable: true,
});

describe('ShareButton', () => {
  beforeEach(() => {
    writeText.mockClear();
  });

  test('copies a share URL to clipboard on click', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/detection-events']}>
        <ShareButton />
      </MemoryRouter>,
      { preloadedState: initialState },
    );

    await userEvent.click(screen.getByRole('button', { name: /share/i }));

    expect(writeText).toHaveBeenCalledTimes(1);
    const url = writeText.mock.calls[0][0];
    expect(url).toContain('/share?s=');
  });

  test('includes current route path in the share URL', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/hosts/42/incidents']}>
        <ShareButton />
      </MemoryRouter>,
      { preloadedState: initialState },
    );

    await userEvent.click(screen.getByRole('button', { name: /share/i }));

    const url = writeText.mock.calls[0][0];
    expect(url).toContain('/share?s=');
    const s = new URL(url).searchParams.get('s')!;
    const decoded = decodeShareableState(s);
    expect(decoded?.route).toBe('/hosts/42/incidents');
  });
});
