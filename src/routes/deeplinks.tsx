import { DialogDescription } from '@radix-ui/react-dialog';
import { PlusCircledIcon } from '@radix-ui/react-icons';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import {
  Page,
  PageActions,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from '@/common/design-system/atoms/page';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/common/design-system/atoms/ui/dialog';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { TogglePageContainer } from '@/common/design-system/molecules/toggle-container';
import { usePageTitle } from '@/common/lib/use-page-title';
import { DeeplinksForm, DeeplinksTable } from '@/features/deeplinks';

export const Route = createFileRoute('/deeplinks')({
  component: () => (
    <PageBoundary key="deeplinks">
      <DeeplinksPage />
    </PageBoundary>
  ),
});

function DeeplinksPage() {
  usePageTitle('Deeplinks');
  const [open, setOpen] = useState(false);

  return (
    <>
      <OutletBreadcrumb>Deep links</OutletBreadcrumb>
      <Page>
        <TogglePageContainer>
          <PageHeader>
            <PageHeaderContent>
              <PageTitle>Deeplinks</PageTitle>
              <PageDescription>
                Deep links let you seamlessly pivot from within the app to
                relevant external resources or tools, using context-aware values
                to craft precise URLs and integrations--streamlining your
                investigation flow and bringing outside context directly to your
                workflow.
              </PageDescription>
            </PageHeaderContent>
            <PageActions>
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
            </PageActions>
          </PageHeader>
          <DeeplinksTable />
        </TogglePageContainer>
      </Page>
    </>
  );
}
