import type { BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  resetReauthForTests,
  setOnUnauthenticated,
  withReauth,
} from './with-reauth';

const fakeBaseQuery = (result: unknown): BaseQueryFn =>
  vi.fn(async () => result) as unknown as BaseQueryFn;

beforeEach(() => {
  resetReauthForTests();
});

afterEach(() => {
  resetReauthForTests();
});

describe('withReauth', () => {
  describe('triggers the unauthenticated handler', () => {
    it.each([401, 403] as const)('on numeric status %s', async (status) => {
      const handler = vi.fn();
      setOnUnauthenticated(handler);

      const inner = fakeBaseQuery({ error: { status, data: 'denied' } });
      const wrapped = withReauth(inner);

      await wrapped({ url: '/x' }, {} as never, {});

      expect(handler).toHaveBeenCalledExactlyOnceWith();
    });

    it.each(['401', '403'] as const)(
      'when status appears as string "%s"',
      async (status) => {
        const handler = vi.fn();
        setOnUnauthenticated(handler);

        const inner = fakeBaseQuery({ error: { status } });
        const wrapped = withReauth(inner);

        await wrapped({ url: '/x' }, {} as never, {});

        expect(handler).toHaveBeenCalledTimes(1);
      },
    );

    it.each([401, 403, '401', '403'] as const)(
      'when status is on originalStatus (%s)',
      async (originalStatus) => {
        const handler = vi.fn();
        setOnUnauthenticated(handler);

        const inner = fakeBaseQuery({
          error: { status: 'PARSING_ERROR', originalStatus, data: 'x' },
        });
        const wrapped = withReauth(inner);

        await wrapped({ url: '/x' }, {} as never, {});

        expect(handler).toHaveBeenCalledTimes(1);
      },
    );
  });

  describe('does NOT trigger the handler', () => {
    it.each([200, 400, 404, 500, 503] as const)(
      'on non-auth status %s',
      async (status) => {
        const handler = vi.fn();
        setOnUnauthenticated(handler);

        const inner = fakeBaseQuery({ error: { status } });
        const wrapped = withReauth(inner);

        await wrapped({ url: '/x' }, {} as never, {});

        expect(handler).not.toHaveBeenCalled();
      },
    );

    it('on successful results', async () => {
      const handler = vi.fn();
      setOnUnauthenticated(handler);

      const inner = fakeBaseQuery({ data: { ok: true } });
      const wrapped = withReauth(inner);

      await wrapped({ url: '/x' }, {} as never, {});

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('concurrency guard', () => {
    it('fires the handler exactly once across N concurrent failing requests', async () => {
      const handler = vi.fn();
      setOnUnauthenticated(handler);

      const inner = fakeBaseQuery({ error: { status: 401 } });
      const wrapped = withReauth(inner);

      await Promise.all(
        Array.from({ length: 8 }, (_, index) =>
          wrapped({ url: `/x-${index}` }, {} as never, {}),
        ),
      );

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('stays silent on subsequent 401s after the first redirect', async () => {
      const handler = vi.fn();
      setOnUnauthenticated(handler);

      const inner = fakeBaseQuery({ error: { status: 401 } });
      const wrapped = withReauth(inner);

      await wrapped({ url: '/a' }, {} as never, {});
      await wrapped({ url: '/b' }, {} as never, {});
      await wrapped({ url: '/c' }, {} as never, {});

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('keeps firing the handler when it returns false (no navigation)', async () => {
      const handler = vi.fn(() => false);
      setOnUnauthenticated(handler);

      const inner = fakeBaseQuery({ error: { status: 401 } });
      const wrapped = withReauth(inner);

      await wrapped({ url: '/a' }, {} as never, {});
      await wrapped({ url: '/b' }, {} as never, {});
      await wrapped({ url: '/c' }, {} as never, {});

      expect(handler).toHaveBeenCalledTimes(3);
    });

    it('latches shut after the first handler call that returns true', async () => {
      const handler = vi
        .fn<() => boolean>()
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true)
        .mockReturnValue(true);
      setOnUnauthenticated(handler);

      const inner = fakeBaseQuery({ error: { status: 401 } });
      const wrapped = withReauth(inner);

      await wrapped({ url: '/a' }, {} as never, {});
      await wrapped({ url: '/b' }, {} as never, {});
      await wrapped({ url: '/c' }, {} as never, {});

      expect(handler).toHaveBeenCalledTimes(2);
    });
  });

  describe('result propagation', () => {
    it('returns the inner result unchanged for auth failures', async () => {
      setOnUnauthenticated(() => {});
      const innerResult = { error: { status: 401, data: 'denied' } };
      const inner = fakeBaseQuery(innerResult);
      const wrapped = withReauth(inner);

      const result = await wrapped({ url: '/x' }, {} as never, {});
      expect(result).toBe(innerResult);
    });

    it('returns the inner result unchanged for successful queries', async () => {
      setOnUnauthenticated(() => {});
      const innerResult = { data: { hello: 'world' } };
      const inner = fakeBaseQuery(innerResult);
      const wrapped = withReauth(inner);

      const result = await wrapped({ url: '/x' }, {} as never, {});
      expect(result).toBe(innerResult);
    });
  });
});
