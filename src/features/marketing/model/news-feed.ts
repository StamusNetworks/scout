import { isAfter, isBefore, sub } from 'date-fns';

import type { News } from './news';

export type NewsFeedItem = News & { isRead: boolean };

export type CombinedNewsFeed = {
  lastNews: NewsFeedItem[];
  unreadCount: number;
};

const READ_WINDOW_DAYS = 30;
const FEED_SIZE = 10;

export const getLastRead = (lastRead?: string): Date | string => {
  const oldestRead = sub(new Date(), { days: READ_WINDOW_DAYS });
  if (!lastRead) return oldestRead;
  return isAfter(new Date(lastRead), oldestRead) ? lastRead : oldestRead;
};

const dedupByTitle = (items: News[]): News[] =>
  items.filter(
    (item, index, self) =>
      index === self.findIndex((t) => t.title === item.title),
  );

const sortNewestFirst = (items: News[]): News[] =>
  items.toSorted((a, b) =>
    isBefore(new Date(a.publishedAt), new Date(b.publishedAt)) ? 1 : -1,
  );

const tagAsRead = (items: News[], readDate: Date | string): NewsFeedItem[] =>
  items.map((item) => ({
    ...item,
    isRead: isBefore(new Date(item.publishedAt), readDate),
  }));

export const combineNewsFeed = (
  ceNews: News[] | undefined,
  eeNews: News[] | undefined,
  readDate: Date | string,
): CombinedNewsFeed => {
  const tagged = tagAsRead(
    sortNewestFirst(dedupByTitle([...(ceNews ?? []), ...(eeNews ?? [])])),
    readDate,
  );
  return {
    lastNews: tagged.slice(0, FEED_SIZE),
    unreadCount: tagged.filter((item) => !item.isRead).length,
  };
};
