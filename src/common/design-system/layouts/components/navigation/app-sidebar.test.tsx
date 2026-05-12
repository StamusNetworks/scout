import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { redirectToLogin } from '@/features/auth';

import { SidebarUserFooter } from './app-sidebar';

vi.mock('@/features/auth', () => ({
  redirectToLogin: vi.fn(),
  useCurrentUser: () => ({ data: { username: 'jdoe' } }),
}));

vi.mock('@/common/design-system/atoms/ui/sidebar', async () => {
  const actual = await vi.importActual<
    typeof import('@/common/design-system/atoms/ui/sidebar')
  >('@/common/design-system/atoms/ui/sidebar');
  return {
    ...actual,
    useSidebar: () => ({ state: 'expanded' }),
  };
});

beforeEach(() => {
  window.config = { apiUrl: 'https://api.example.test' };
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('SidebarUserFooter', () => {
  it('calls redirectToLogin with variant: "logout" when Log Out is clicked', async () => {
    const user = userEvent.setup();
    render(<SidebarUserFooter />);

    await user.click(screen.getByRole('button', { name: /log out/i }));

    expect(redirectToLogin).toHaveBeenCalledExactlyOnceWith({
      variant: 'logout',
    });
  });
});
