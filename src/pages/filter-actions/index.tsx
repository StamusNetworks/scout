import { ChevronDown, WandSparkles } from 'lucide-react';

import { DefaultPage } from '@/common/design-system/atoms/default-page';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { usePageTitle } from '@/common/lib/use-page-title';
import { FilterActionsDropdown } from '@/features/hunt/filter-actions/components/filter-actions/filter-actions.dropdown';
import { FiltersActionsTable } from '@/features/hunt/filter-actions/components/filter-actions-table/filter-actions-table';

import { UpdatePushRuleset } from './_components/UpdatePushRuleset';

export const FiltersActionsList = () => {
  usePageTitle('Filter Actions');

  return (
    <>
      <OutletBreadcrumb>Filter Actions</OutletBreadcrumb>
      <DefaultPage
        title="Filter Actions"
        description="Manage how your system filters and transforms events, enabling you to tailor detection, reduce noise, and prioritize what matters most. Easily create  automations controlling events suppression, escalation, and tagging."
        actions={
          <Row className="items-center gap-2">
            <UpdatePushRuleset />
            <FilterActionsDropdown
              trigger={(disabled) => (
                <Button
                  className="pointer-events-auto!"
                  variant="default"
                  disabled={disabled}
                >
                  <WandSparkles />
                  Create filter action
                  <ChevronDown size={14} />
                </Button>
              )}
            />
          </Row>
        }
      >
        <FiltersActionsTable />
      </DefaultPage>
    </>
  );
};
