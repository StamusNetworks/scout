import { ScrollArea } from '@/common/design-system/atoms/ui/scroll-area';
import { cn } from '@/common/lib/utils';

export const Scrollable = ({
  string,
  className,
}: {
  string: string;
  className?: string;
}) => {
  return (
    <div className="flex">
      <ScrollArea
        className={cn(
          'flex max-h-48 w-full max-w-[600px] overflow-clip text-xs wrap-anywhere',
          className,
        )}
      >
        <pre className="block">{string}</pre>
      </ScrollArea>
    </div>
  );
};
