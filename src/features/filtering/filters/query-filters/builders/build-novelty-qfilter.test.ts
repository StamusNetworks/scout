import { describe, expect, it } from 'vitest';

import { buildNoveltyQfilter } from './build-novelty-qfilter';

describe('buildNoveltyQfilter', () => {
  it('returns the stamus_novel clause when novelty is true', () => {
    expect(buildNoveltyQfilter(true)).toBe('stamus_novel:true');
  });

  it('returns undefined when novelty is false', () => {
    expect(buildNoveltyQfilter(false)).toBeUndefined();
  });

  it('returns undefined when novelty is undefined', () => {
    expect(buildNoveltyQfilter()).toBeUndefined();
    expect(buildNoveltyQfilter(undefined)).toBeUndefined();
  });
});
