import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { renderWithProviders } from '@/common/testing/test-utils';
import { decodeShareableState } from '@/features/share';
import { initialState } from '@/store/store.init';

import { ShareButton } from './share-button';

// Mock clipboard API
const writeText = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText },
  writable: true,
  configurable: true,
});

function createTestRouter(initialPath: string) {
  const rootRoute = createRootRoute({
    component: () => <ShareButton />,
  });
  return createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

describe('ShareButton', () => {
  beforeEach(() => {
    writeText.mockClear();
  });

  test('copies a share URL to clipboard on click', async () => {
    const router = createTestRouter('/detection-events');
    await router.load();
    renderWithProviders(<RouterProvider router={router} />, {
      preloadedState: initialState,
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /share/i }),
      ).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: /share/i }));

    expect(writeText).toHaveBeenCalledTimes(1);
    const url = writeText.mock.calls[0][0];
    expect(url).toContain('/share?s=');
  });

  test('includes current route path in the share URL', async () => {
    const router = createTestRouter('/hosts/42/incidents');
    await router.load();
    renderWithProviders(<RouterProvider router={router} />, {
      preloadedState: initialState,
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /share/i }),
      ).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: /share/i }));

    const url = writeText.mock.calls[0][0];
    expect(url).toContain('/share?s=');
    const s = new URL(url).searchParams.get('s')!;
    const decoded = decodeShareableState(s);
    expect(decoded?.route).toBe('/hosts/42/incidents');
  });
});
