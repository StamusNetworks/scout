import { Inbox } from 'lucide-react';

import { Badge } from '@/common/design-system/atoms/ui/badge';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/common/design-system/atoms/ui/dialog';
import { ScrollArea } from '@/common/design-system/atoms/ui/scroll-area';
import { VisuallyHidden } from '@/common/design-system/atoms/ui/visually-hidden';
import { NewsFeed } from '@/features/marketing/components/news-feed';
import { useNewsFeed } from '@/features/marketing/hooks/use-news-feed';
import { useAppDispatch } from '@/store/store';

import { setNewsFeedLastRead } from '../store/marketing.store';

export const NewsFeedModal = () => {
  const { unreadCount } = useNewsFeed();
  const dispatch = useAppDispatch();
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      dispatch(setNewsFeedLastRead(new Date().toISOString()));
    }
  };
  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="relative"
          size="icon"
        >
          {unreadCount > 0 && (
            <Badge
              variant="notification"
              className="absolute -top-1.5 -right-1.5"
            >
              {unreadCount}
            </Badge>
          )}
          <Inbox />
        </Button>
      </DialogTrigger>
      <DialogContent className="block h-full max-h-[80vh] max-w-2xl p-2 pr-1">
        <ScrollArea className="h-full overflow-clip">
          <VisuallyHidden>
            <DialogTitle>News Feed</DialogTitle>
          </VisuallyHidden>
          <VisuallyHidden>
            <DialogDescription>
              News about the Clear NDR platform from our blog
            </DialogDescription>
          </VisuallyHidden>
          <NewsFeed />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
