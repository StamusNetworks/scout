import { DialogDescription } from '@radix-ui/react-dialog';
import { PlusCircledIcon } from '@radix-ui/react-icons';
import { useState } from 'react';

import { DefaultPage } from '@/common/design-system/atoms/default-page';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/common/design-system/atoms/ui/dialog';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { usePageTitle } from '@/common/lib/use-page-title';
import { DeeplinksForm } from '@/features/hunt/deeplinks/components/deeplinks-form/deeplinks-form';
import { DeeplinksTable } from '@/features/hunt/deeplinks/components/deeplinks-table/deeplinks-table';

export const Deeplinks = () => {
  usePageTitle('Deeplinks');
  const [open, setOpen] = useState(false);
  return (
    <>
      <OutletBreadcrumb>Deep links</OutletBreadcrumb>
      <DefaultPage
        title="Deeplinks"
        description="Deep links let you seamlessly pivot from within the app to relevant external resources or tools, using context-aware values to craft precise URLs and integrations—streamlining your investigation flow and bringing outside context directly to your workflow."
        actions={
          <Dialog
            open={open}
            onOpenChange={setOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <PlusCircledIcon /> Create deeplink
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Create deeplink</DialogTitle>
              <DialogDescription>Create a new deeplink.</DialogDescription>
              <DeeplinksForm handleClose={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        }
      >
        <DeeplinksTable />
      </DefaultPage>
    </>
  );
};
