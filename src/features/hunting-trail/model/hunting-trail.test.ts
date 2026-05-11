import { describe, expect, it } from 'vitest';

import { HUNTING_TRAIL_DOCS_URL } from './hunting-trail';

describe('HUNTING_TRAIL_DOCS_URL', () => {
  it('is a non-empty string', () => {
    expect(typeof HUNTING_TRAIL_DOCS_URL).toBe('string');
    expect(HUNTING_TRAIL_DOCS_URL.length).toBeGreaterThan(0);
  });
});
