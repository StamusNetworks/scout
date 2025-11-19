import { DefaultPage } from '@/common/design-system/atoms/default-page';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { usePageTitle } from '@/common/lib/use-page-title';
import { HistoryTable } from '@/features/administration/operations-history/components/history-table/history-table';

export const OperationsHistory = () => {
  usePageTitle('Operations History');

  return (
    <>
      <OutletBreadcrumb>Operations History</OutletBreadcrumb>
      <DefaultPage
        title="History"
        description="Access a comprehensive record of significant actions performed in your Clear NDR ™ manager, helping you trace system changes, monitor user activities, and ensure operational accountability for improved security, auditability, and transparency across your deployment."
      >
        <HistoryTable />
      </DefaultPage>
    </>
  );
};
