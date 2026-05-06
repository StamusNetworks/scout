import { HelpCircle } from 'lucide-react';

import { Button } from '@/common/design-system/atoms/ui/button';
import { CommandShortcut } from '@/common/design-system/atoms/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/common/design-system/atoms/ui/popover';
import { useDisableHelp, useHelpState } from '@/features/help';

export function TimelineHelpButton() {
  const disableHelp = useDisableHelp();
  const { highlightTimelineHelp } = useHelpState();
  const handleDisableHelp = (open: boolean) => {
    if (!open) disableHelp('highlightTimelineHelp');
  };
  return (
    <Popover onOpenChange={handleDisableHelp}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          aria-label="Timeline help"
          size="sm"
          highlight={highlightTimelineHelp}
        >
          <HelpCircle className="h-5 w-5" /> Help
        </Button>
      </PopoverTrigger>
      <PopoverContent aria-describedby={undefined}>
        <ul className="space-y-2">
          <li>
            <CommandShortcut>Click and Drag</CommandShortcut> to select time
            range
          </li>
          <li>
            <CommandShortcut>Ctrl + Z</CommandShortcut> to zoom out
          </li>
          <li>
            <CommandShortcut>Shift + Mousewheel</CommandShortcut> to zoom
          </li>
          <li>
            <CommandShortcut>Shift + Drag</CommandShortcut> to pan
          </li>
        </ul>
      </PopoverContent>
    </Popover>
  );
}
