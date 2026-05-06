import { describe, expect, test } from 'vitest';

import { parseDeeplinkValue } from './parse-deeplink-value';

describe('parseDeeplinkValue', () => {
  test('returns plain string unchanged', () => {
    expect(parseDeeplinkValue('foo')).toBe('foo');
  });

  test('coerces numeric strings to numbers', () => {
    expect(parseDeeplinkValue('42')).toBe(42);
  });

  test('strips surrounding double quotes', () => {
    expect(parseDeeplinkValue('"foo"')).toBe('foo');
  });

  test('strips quotes then coerces', () => {
    expect(parseDeeplinkValue('"42"')).toBe(42);
  });

  test('keeps mixed alphanumeric as string after stripping', () => {
    expect(parseDeeplinkValue('"42abc"')).toBe('42abc');
  });

  test('does not strip when only one side is quoted', () => {
    expect(parseDeeplinkValue('"foo')).toBe('"foo');
    expect(parseDeeplinkValue('foo"')).toBe('foo"');
  });
});
