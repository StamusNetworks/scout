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
import { useAppDispatch } from '@/store/store';

import { useNewsFeed } from '../hooks/use-news-feed';
import { setNewsFeedLastRead } from '../state/marketing.slice';
import { NewsFeed } from './news-feed';

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
          variant="ghost"
          className="relative"
          size="icon-sm"
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
              News about the Clear NDR® platform from our blog
            </DialogDescription>
          </VisuallyHidden>
          <NewsFeed />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
