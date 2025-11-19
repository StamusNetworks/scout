import { isBefore } from 'date-fns';
import { useMemo } from 'react';

import { useAppSelector } from '@/store/store';

import { useGetCENewsFeedQuery, useGetEENewsFeedQuery } from '../api/news.api';
import { getLastRead } from '../components/news-feed';
import { selectNewstFeedLastRead } from '../store/marketing.store';

export const useNewsFeed = () => {
  const isEE = true;
  const storedDate = useAppSelector(selectNewstFeedLastRead);
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
      .sort((a, b) =>
        isBefore(new Date(a.pubDate), new Date(b.pubDate)) ? 1 : -1,
      )
      .map((news) => ({
        ...news,
        isRead: isBefore(new Date(news.pubDate), readDate),
      }));
    return {
      lastNews: sortedFeed.slice(0, 10),
      unreadCount: sortedFeed.filter((item) => item.isRead === false).length,
    };
  }, [ceNews, eeNews, readDate]);
};
