import { describe, expect, it } from 'vitest';

import { base64ToUtf8 } from './strings';

describe('base64ToUtf8', () => {
  it('decodes ASCII text', () => {
    // "Hello" in base64
    expect(base64ToUtf8('SGVsbG8=')).toBe('Hello');
  });

  it('returns empty string for empty input', () => {
    expect(base64ToUtf8('')).toBe('');
  });

  it('handles multi-byte UTF-8 characters', () => {
    // "café" → base64
    const base64 = btoa(
      String.fromCharCode(...new TextEncoder().encode('café')),
    );
    expect(base64ToUtf8(base64)).toBe('café');
  });

  it('replaces invalid UTF-8 sequences with replacement character', () => {
    // 0xFF 0xFE are not valid UTF-8 start bytes
    const base64 = btoa(String.fromCharCode(0xff, 0xfe));
    const result = base64ToUtf8(base64);
    expect(result).toContain('\uFFFD');
  });
});
