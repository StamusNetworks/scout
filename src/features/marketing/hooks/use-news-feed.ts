import { useAppSelector } from '@/store/store';

import { useGetCENewsFeedQuery, useGetEENewsFeedQuery } from '../api/news.api';
import { combineNewsFeed, getLastRead } from '../model/news-feed';
import { selectNewsFeedLastRead } from '../state/marketing.slice';

export const useNewsFeed = () => {
  const isEE = true;
  const storedDate = useAppSelector(selectNewsFeedLastRead);
  const { data: ceNews } = useGetCENewsFeedQuery({ isEE }, { skip: isEE });
  const { data: eeNews } = useGetEENewsFeedQuery({ isEE });

  return combineNewsFeed(ceNews, eeNews, getLastRead(storedDate));
};
