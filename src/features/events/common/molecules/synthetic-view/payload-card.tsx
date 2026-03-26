import { Binary } from 'lucide-react';
import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/common/design-system/atoms/ui/dialog';
import {
  DropdownMenuIcon,
  DropdownMenuItem,
} from '@/common/design-system/atoms/ui/dropdown-menu';
import { ScrollArea } from '@/common/design-system/atoms/ui/scroll-area';
import { HexViewer } from '@/common/design-system/molecules/hex-viewer';
import { PayloadVisualizer } from '@/common/design-system/molecules/payload-visualizer';
import { TableCard } from '@/common/design-system/molecules/table-card';
import { base64ToHex, base64ToUtf8 } from '@/common/lib/strings';

export const PayloadCard = ({
  title = 'Payload',
  base64,
  truncated,
}: {
  title?: string;
  base64: string;
  truncated?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const utf8 = base64ToUtf8(base64);
  const hex = base64ToHex(base64);

  return (
    <>
      <TableCard
        title={title}
        className="mt-2"
        data={[{ value: utf8 }]}
        headers={['Payload']}
        extraDropdownItems={
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <DropdownMenuIcon Icon={Binary} /> View Hex
          </DropdownMenuItem>
        }
      >
        <div className="h-48 max-h-[80vh] min-h-16 resize-y overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <PayloadVisualizer hex={hex} />
          </ScrollArea>
        </div>
        {truncated && (
          <p className="text-muted-foreground mt-1 text-xs">
            Content has been truncated
          </p>
        )}
      </TableCard>

      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        <DialogContent className="max-h-[90vh] w-fit max-w-[90vw] overflow-auto">
          <DialogTitle className="sr-only">Hex Viewer</DialogTitle>
          <HexViewer base64={base64} />
        </DialogContent>
      </Dialog>
    </>
  );
};
