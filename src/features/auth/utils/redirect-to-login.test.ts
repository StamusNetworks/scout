import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { redirectToLogin } from './redirect-to-login';

const STARTING_URL = 'http://localhost/sentinel';
const API_URL = 'https://api.example.test';
const BASE_URL = import.meta.env.BASE_URL;

beforeEach(() => {
  window.config = { apiUrl: API_URL };
  window.location.href = STARTING_URL;
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('redirectToLogin', () => {
  describe('in non-development modes', () => {
    it('navigates to the backend login URL preserving the current SPA path', () => {
      window.location.href = `http://localhost${BASE_URL}explorer/threats`;

      redirectToLogin({ variant: 'login' });

      expect(window.location.href).toBe(
        `${API_URL}/accounts/login${BASE_URL}explorer/threats`,
      );
    });

    it('preserves search and hash when redirecting to login', () => {
      window.location.href = `http://localhost${BASE_URL}explorer?filter=foo#anchor`;

      redirectToLogin({ variant: 'login' });

      expect(window.location.href).toBe(
        `${API_URL}/accounts/login${BASE_URL}explorer?filter=foo#anchor`,
      );
    });

    it('handles the user being at the SPA root', () => {
      window.location.href = `http://localhost${BASE_URL}`;

      redirectToLogin({ variant: 'login' });

      expect(window.location.href).toBe(`${API_URL}/accounts/login${BASE_URL}`);
    });

    it('navigates to ${apiUrl}/accounts/logout/ for variant: "logout"', () => {
      redirectToLogin({ variant: 'logout' });

      expect(window.location.href).toBe(`${API_URL}/accounts/logout/`);
    });
  });

  describe('when VITE_APP_MODE === "development"', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_APP_MODE', 'development');
    });

    it('does NOT mutate window.location for variant: "login"', () => {
      const logSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      redirectToLogin({ variant: 'login' });

      expect(window.location.href).toBe(STARTING_URL);
      expect(logSpy).toHaveBeenCalled();
    });

    it('does NOT mutate window.location for variant: "logout"', () => {
      const logSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      redirectToLogin({ variant: 'logout' });

      expect(window.location.href).toBe(STARTING_URL);
      expect(logSpy).toHaveBeenCalled();
    });
  });
});
