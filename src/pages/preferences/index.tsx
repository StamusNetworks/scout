import { DefaultPage } from '@/common/design-system/atoms/default-page';
import { Column } from '@/common/design-system/atoms/layout/column';
import { Separator } from '@/common/design-system/atoms/ui/separator';

import { ColorBlindnessSelector } from './_components/color-blindness';
import { DataDisplay } from './_components/data-display';
import { DateTimeSelector } from './_components/date-time-format';
import { ExportFormatSelector } from './_components/export-format-selector';

export const UserSettingsPage = () => {
  return (
    <DefaultPage
      title="User settings"
      description="Customize how information is presented to you for clarity and accessibility, making your experience more intuitive and tailored to your individual needs."
    >
      <Column className="relative gap-4">
        <DateTimeSelector />
        <Separator />
        <DataDisplay />
        <Separator />
        <ColorBlindnessSelector />
        <Separator />
        <ExportFormatSelector />
        <div className="bg-muted/30 dark:bg-card absolute -top-8 right-0 -z-10 h-[calc(100%+4rem)] w-1/2 border">
          <p className="absolute top-6 left-8 text-sm font-bold">Preview</p>
        </div>
      </Column>
    </DefaultPage>
  );
};
