import { toast } from 'sonner';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { apiErrorToast } from './api.error';

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}));

const REQUEST = { method: 'GET', url: '/rest/test/' };

afterEach(() => {
  vi.mocked(toast.error).mockClear();
});

describe('apiErrorToast', () => {
  describe('suppresses toast for 401 and 403 (numeric and string)', () => {
    it.each([401, 403, '401', '403'] as const)(
      'does not toast for status %s',
      (status) => {
        apiErrorToast({ args: REQUEST, error: { status } });
        expect(toast.error).not.toHaveBeenCalled();
      },
    );

    it.each([401, 403, '401', '403'] as const)(
      'does not toast when status appears on originalStatus (%s)',
      (originalStatus) => {
        apiErrorToast({
          args: REQUEST,
          error: { status: 'PARSING_ERROR', originalStatus },
        });
        expect(toast.error).not.toHaveBeenCalled();
      },
    );
  });

  describe('still toasts for non-auth errors', () => {
    it('toasts for HTTP 500', () => {
      apiErrorToast({ args: REQUEST, error: { status: 500 } });
      expect(toast.error).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledWith(
        'Request failed (500)',
        expect.objectContaining({ description: 'GET /rest/test/' }),
      );
    });

    it('toasts for a generic network error', () => {
      apiErrorToast({
        args: REQUEST,
        error: { status: 'FETCH_ERROR', error: 'NetworkError' },
      });
      expect(toast.error).toHaveBeenCalledTimes(1);
    });

    it('toasts for HTTP 400 (close to 401 boundary)', () => {
      apiErrorToast({ args: REQUEST, error: { status: 400 } });
      expect(toast.error).toHaveBeenCalledTimes(1);
    });

    it('toasts for HTTP 404 (close to 403 boundary)', () => {
      apiErrorToast({ args: REQUEST, error: { status: 404 } });
      expect(toast.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('preserves existing abort-error suppression', () => {
    it('does not toast for AbortError name', () => {
      apiErrorToast({ args: REQUEST, error: { name: 'AbortError' } });
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('does not toast when error message contains "abort"', () => {
      apiErrorToast({
        args: REQUEST,
        error: { message: 'The user aborted a request.' },
      });
      expect(toast.error).not.toHaveBeenCalled();
    });
  });
});
