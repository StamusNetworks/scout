import { API } from '@/store/api';

import { News } from '../models/news.schema';

const responseHandler = async (response: Response) => {
  const raw = await response.text();
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(raw, 'text/xml');
  const items = xmlDoc.getElementsByTagName('item');
  return Array.from(items).map((item) => {
    return {
      title: item.getElementsByTagName('title')[0].textContent ?? '',
      link: item.getElementsByTagName('link')[0].textContent ?? '',
      pubDate: item.getElementsByTagName('pubDate')[0].textContent ?? '',
      description:
        item.getElementsByTagName('description')[0].textContent ?? '',
      categories: Array.from(item.getElementsByTagName('category')).map(
        (category) => category.textContent ?? '',
      ),
    };
  });
};

const getTracker = (isEE: boolean) =>
  import.meta.env.VITE_APP_MODE === 'development'
    ? ''
    : isEE
      ? '?utm_source=clear-ndr-enterprise&utm_medium=newsfeed&utm_campaign=clear-ndr-news'
      : '?utm_source=clear-ndr-community&utm_medium=newsfeed&utm_campaign=clear-ndr-news';

export const NewsAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    // QUERIES
    getCENewsFeed: builder.query<News[], { isEE: boolean }>({
      query: ({ isEE }) => ({
        url: `/blog/tag/clear-ndr-community/rss.xml${getTracker(isEE)}`,
        method: 'GET',
        responseHandler,
      }),
      providesTags: ['Reload', 'News'],
    }),
    getEENewsFeed: builder.query<News[], { isEE: boolean }>({
      query: ({ isEE }) => ({
        url: `/blog/tag/clear-ndr-enterprise/rss.xml${getTracker(isEE)}`,
        method: 'GET',
        responseHandler,
      }),
      providesTags: ['Reload', 'News'],
    }),
  }),
});

export const { useGetCENewsFeedQuery, useGetEENewsFeedQuery } = NewsAPI;
