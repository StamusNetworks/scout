import { Link } from '@tanstack/react-router';
import { isAfter, sub } from 'date-fns';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Badge } from '@/common/design-system/atoms/ui/badge';
import { cn } from '@/common/lib/utils';
import { useAppSelector } from '@/store/store';

import { useNewsFeed } from '../hooks/use-news-feed';
import { selectNewsFeedLastRead } from '../state/marketing.slice';

export const NewsFeed = () => {
  const storedReadDate = useAppSelector(selectNewsFeedLastRead);
  const readDate = getLastRead(storedReadDate);
  const { lastNews } = useNewsFeed();

  return (
    <Column className="gap-1">
      {lastNews.map((item) => {
        const isUnread = isAfter(new Date(item.publishedAt), readDate);
        return (
          <Link
            key={item.title}
            to={item.link}
            target="_blank"
            rel="noreferrer"
            className="hover:bg-primary/5 rounded-md p-2"
          >
            <p className="text-muted-foreground text-xs">{item.publishedAt}</p>
            <p
              className={cn(
                'mt-1 mb-2 text-sm font-medium',
                isUnread && 'font-bold',
              )}
            >
              {isUnread && (
                <div className="bg-primary mr-1 inline-block size-2 rounded-full" />
              )}
              {item.title}
            </p>
            <Row className="flex-wrap gap-1">
              {item.categories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="text-xs font-normal text-nowrap"
                >
                  {category}
                </Badge>
              ))}
            </Row>
          </Link>
        );
      })}
    </Column>
  );
};

export const getLastRead = (lastRead?: string) => {
  const thirtyDaysAgo = sub(new Date(), { days: 30 });

  if (!lastRead) return thirtyDaysAgo;

  if (isAfter(new Date(lastRead), thirtyDaysAgo)) {
    return lastRead;
  }

  return thirtyDaysAgo;
};
