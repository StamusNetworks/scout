import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { Column } from '@/common/design-system/atoms/layout/column';
import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from '@/common/design-system/atoms/page';
import { Separator } from '@/common/design-system/atoms/ui/separator';
import { TogglePageContainer } from '@/common/design-system/molecules/toggle-container';
import { ColorBlindnessSelector } from '@/features/user/settings/components/color-blindness';
import { DataDisplay } from '@/features/user/settings/components/data-display';
import { DateTimeSelector } from '@/features/user/settings/components/date-time-format';
import { DefaultEventTab } from '@/features/user/settings/components/default-event-tab';
import { ExportFormatSelector } from '@/features/user/settings/components/export-format-selector';
import { SidebarConfig } from '@/features/user/settings/components/sidebars';
import { selectIsEnterprise } from '@/features/user/settings/settings.slice';
import { useAppSelector } from '@/store/store';

export const Route = createFileRoute('/user-settings')({
  component: () => (
    <PageBoundary key="user-settings">
      <UserSettingsPage />
    </PageBoundary>
  ),
});

function UserSettingsPage() {
  const isEnterprise = useAppSelector(selectIsEnterprise);
  return (
    <Page>
      <TogglePageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>User settings</PageTitle>
            <PageDescription>
              Customize how information is presented to you for clarity and
              accessibility, making your experience more intuitive and tailored
              to your individual needs.
            </PageDescription>
          </PageHeaderContent>
        </PageHeader>
        <Column className="relative gap-4">
          <DateTimeSelector />
          <Separator />
          <DataDisplay />
          <Separator />
          {isEnterprise ? (
            <>
              <ColorBlindnessSelector />
              <Separator />
            </>
          ) : null}
          <ExportFormatSelector />
          <Separator />
          <SidebarConfig />
          <Separator />
          <DefaultEventTab />
          <div className="bg-muted/30 dark:bg-card absolute -top-8 right-0 -z-10 h-[calc(100%+4rem)] w-1/2 border">
            <p className="absolute top-6 left-8 text-sm font-bold">Preview</p>
          </div>
        </Column>
      </TogglePageContainer>
    </Page>
  );
}
