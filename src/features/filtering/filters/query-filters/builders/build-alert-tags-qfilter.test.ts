import { describe, expect, it } from 'vitest';

import { buildAlertTagsQfilter } from './build-alert-tags-qfilter';

describe('buildAlertTagsQfilter', () => {
  it('returns undefined when flags is null/undefined', () => {
    expect(buildAlertTagsQfilter(null)).toBeUndefined();
    expect(buildAlertTagsQfilter(undefined)).toBeUndefined();
  });

  it('returns the "none" sentinel when all three are off', () => {
    expect(
      buildAlertTagsQfilter({
        relevant: false,
        informational: false,
        untagged: false,
      }),
    ).toBe('(alert.tag:"none")');
  });

  it('emits a single relevant clause', () => {
    expect(
      buildAlertTagsQfilter({
        relevant: true,
        informational: false,
        untagged: false,
      }),
    ).toBe('(alert.tag:"relevant")');
  });

  it('emits a single informational clause', () => {
    expect(
      buildAlertTagsQfilter({
        relevant: false,
        informational: true,
        untagged: false,
      }),
    ).toBe('(alert.tag:"informational")');
  });

  it('emits a single untagged clause', () => {
    expect(
      buildAlertTagsQfilter({
        relevant: false,
        informational: false,
        untagged: true,
      }),
    ).toBe('((NOT alert.tag:*))');
  });

  it('emits informational + relevant joined with OR', () => {
    expect(
      buildAlertTagsQfilter({
        relevant: true,
        informational: true,
        untagged: false,
      }),
    ).toBe('(alert.tag:"informational" OR alert.tag:"relevant")');
  });

  it('emits all three in canonical order: untagged, informational, relevant', () => {
    expect(
      buildAlertTagsQfilter({
        relevant: true,
        informational: true,
        untagged: true,
      }),
    ).toBe(
      '((NOT alert.tag:*) OR alert.tag:"informational" OR alert.tag:"relevant")',
    );
  });

  it('preserves order regardless of input object key order', () => {
    const reverseOrder = buildAlertTagsQfilter({
      untagged: true,
      relevant: true,
      informational: true,
    });
    const forwardOrder = buildAlertTagsQfilter({
      informational: true,
      relevant: true,
      untagged: true,
    });
    expect(reverseOrder).toBe(forwardOrder);
  });
});
