import { sub } from 'date-fns';
import { describe, expect, test } from 'vitest';

import type { News } from './news';
import { combineNewsFeed, getLastRead } from './news-feed';

const news = (title: string, publishedAt: string): News => ({
  title,
  link: 'http://x',
  publishedAt,
  description: '',
  categories: [],
});

describe('getLastRead', () => {
  test('returns 30 days ago when storedDate is missing', () => {
    const result = getLastRead(undefined);
    expect(result).toBeInstanceOf(Date);
  });

  test('returns the stored date when it is recent', () => {
    const recent = sub(new Date(), { days: 1 }).toISOString();
    expect(getLastRead(recent)).toBe(recent);
  });

  test('clamps a stored date older than 30 days to 30 days ago', () => {
    const old = sub(new Date(), { days: 100 }).toISOString();
    expect(getLastRead(old)).toBeInstanceOf(Date);
    expect(getLastRead(old)).not.toBe(old);
  });
});

describe('combineNewsFeed', () => {
  test('merges ce + ee feeds, sorts newest first, caps at 10', () => {
    const ce = Array.from({ length: 6 }, (_, i) =>
      news(`ce-${i}`, `2024-01-${String(i + 1).padStart(2, '0')}`),
    );
    const ee = Array.from({ length: 6 }, (_, i) =>
      news(`ee-${i}`, `2024-02-${String(i + 1).padStart(2, '0')}`),
    );
    const result = combineNewsFeed(ce, ee, new Date('2020-01-01'));
    expect(result.lastNews).toHaveLength(10);
    expect(result.lastNews[0].publishedAt).toBe('2024-02-06');
    expect(result.lastNews[9].publishedAt).toBe('2024-01-03');
  });

  test('dedupes by title with first occurrence winning', () => {
    const ce = [news('shared', '2024-01-01')];
    const ee = [news('shared', '2024-02-01'), news('unique', '2024-03-01')];
    const result = combineNewsFeed(ce, ee, new Date('2020-01-01'));
    expect(result.lastNews).toHaveLength(2);
    expect(result.lastNews.map((n) => n.title)).toEqual(['unique', 'shared']);
    expect(result.lastNews.find((n) => n.title === 'shared')?.publishedAt).toBe(
      '2024-01-01',
    );
  });

  test('unreadCount counts items published after readDate', () => {
    const items = [
      news('a', '2024-01-01'),
      news('b', '2024-02-01'),
      news('c', '2024-03-01'),
    ];
    expect(
      combineNewsFeed(items, undefined, new Date('2024-02-15')).unreadCount,
    ).toBe(1);
  });

  test('handles undefined feeds', () => {
    expect(combineNewsFeed(undefined, undefined, new Date())).toEqual({
      lastNews: [],
      unreadCount: 0,
    });
  });
});
