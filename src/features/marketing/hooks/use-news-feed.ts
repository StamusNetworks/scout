import { isBefore } from 'date-fns';
import { useMemo } from 'react';

import { useAppSelector } from '@/store/store';

import { useGetCENewsFeedQuery, useGetEENewsFeedQuery } from '../api/news.api';
import { getLastRead } from '../components/news-feed';
import { selectNewsFeedLastRead } from '../state/marketing.slice';

export const useNewsFeed = () => {
  const isEE = true;
  const storedDate = useAppSelector(selectNewsFeedLastRead);
  const readDate = getLastRead(storedDate);
  const { data: ceNews } = useGetCENewsFeedQuery({ isEE }, { skip: isEE });
  const { data: eeNews } = useGetEENewsFeedQuery({ isEE });

  return useMemo(() => {
    const combinedFeed = [...(ceNews ?? []), ...(eeNews ?? [])];
    const uniqueFeed = combinedFeed.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.title === item.title),
    );
    const sortedFeed = uniqueFeed
      .toSorted((a, b) =>
        isBefore(new Date(a.publishedAt), new Date(b.publishedAt)) ? 1 : -1,
      )
      .map((news) => ({
        ...news,
        isRead: isBefore(new Date(news.publishedAt), readDate),
      }));
    return {
      lastNews: sortedFeed.slice(0, 10),
      unreadCount: sortedFeed.filter((item) => item.isRead === false).length,
    };
  }, [ceNews, eeNews, readDate]);
};
