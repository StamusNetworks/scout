import { describe, expect, test } from 'vitest';

import { FilterCategory } from '../definitions/query-filter.config';
import { getCategoryOrderForPath } from './filter-category-order';

describe('getCategoryOrderForPath', () => {
  test('puts host first under /hosts', () => {
    expect(getCategoryOrderForPath('/hosts/10.0.0.1')[0]).toBe(
      FilterCategory.HOST,
    );
  });

  test('puts host first under /attack-surface', () => {
    expect(getCategoryOrderForPath('/attack-surface/inventory')[0]).toBe(
      FilterCategory.HOST,
    );
  });

  test('puts signature first under /detection-methods', () => {
    expect(getCategoryOrderForPath('/detection-methods')[0]).toBe(
      FilterCategory.SIGNATURE,
    );
  });

  test('defaults to event-focused order', () => {
    expect(getCategoryOrderForPath('/threats')[0]).toBe(FilterCategory.EVENT);
    expect(getCategoryOrderForPath('/explorer')[0]).toBe(FilterCategory.EVENT);
  });
});
