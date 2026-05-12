import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSessionActivityMutation } from '../api/auth.api';
import { redirectToLogin } from '../utils/redirect-to-login';
import { useSessionActivity } from './use-session-activity';

vi.mock('../api/auth.api', () => ({
  useSessionActivityMutation: vi.fn(),
}));

vi.mock('../utils/redirect-to-login', () => ({
  redirectToLogin: vi.fn(),
}));

const HEARTBEAT_MS = 30_000;

type MutationResult = { disconnect: boolean };
type MutationTrigger = (timeout: number) => {
  unwrap: () => Promise<MutationResult>;
};

const setMutationResponses = (responses: MutationResult[]) => {
  const trigger = vi.fn<MutationTrigger>();
  for (const response of responses) {
    trigger.mockReturnValueOnce({
      unwrap: () => Promise.resolve(response),
    });
  }
  vi.mocked(useSessionActivityMutation).mockReturnValue([trigger] as never);
  return trigger;
};

beforeEach(() => {
  vi.stubEnv('VITE_APP_MODE', 'production');
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe('useSessionActivity', () => {
  it('redirects to login when the heartbeat resolves with disconnect: true', async () => {
    setMutationResponses([{ disconnect: true }]);
    renderHook(() => useSessionActivity());

    expect(redirectToLogin).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(HEARTBEAT_MS);

    expect(redirectToLogin).toHaveBeenCalledExactlyOnceWith({
      variant: 'login',
    });
  });

  it('does not redirect when the heartbeat reports disconnect: false', async () => {
    setMutationResponses([{ disconnect: false }, { disconnect: false }]);
    renderHook(() => useSessionActivity());

    await vi.advanceTimersByTimeAsync(HEARTBEAT_MS * 2);

    expect(redirectToLogin).not.toHaveBeenCalled();
  });

  it('stops scheduling further heartbeats after disconnect: true (idempotent)', async () => {
    const trigger = setMutationResponses([
      { disconnect: true },
      { disconnect: true },
    ]);
    renderHook(() => useSessionActivity());

    await vi.advanceTimersByTimeAsync(HEARTBEAT_MS);

    expect(trigger).toHaveBeenCalledTimes(1);
    expect(redirectToLogin).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(HEARTBEAT_MS * 3);

    expect(trigger).toHaveBeenCalledTimes(1);
    expect(redirectToLogin).toHaveBeenCalledTimes(1);
  });

  it('does NOT schedule heartbeats outside production mode', async () => {
    vi.stubEnv('VITE_APP_MODE', 'development');
    const trigger = setMutationResponses([{ disconnect: true }]);
    renderHook(() => useSessionActivity());

    await vi.advanceTimersByTimeAsync(HEARTBEAT_MS * 4);

    expect(trigger).not.toHaveBeenCalled();
    expect(redirectToLogin).not.toHaveBeenCalled();
  });
});
