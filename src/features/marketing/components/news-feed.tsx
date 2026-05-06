import { Link } from '@tanstack/react-router';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Badge } from '@/common/design-system/atoms/ui/badge';
import { cn } from '@/common/lib/utils';

import { useNewsFeed } from '../hooks/use-news-feed';

export const NewsFeed = () => {
  const { lastNews } = useNewsFeed();

  return (
    <Column className="gap-1">
      {lastNews.map((item) => {
        const isUnread = !item.isRead;
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
