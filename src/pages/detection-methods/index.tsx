import { DefaultPage } from '@/common/design-system/atoms/default-page';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { usePageTitle } from '@/common/lib/use-page-title';
import { SignaturesTable } from '@/features/hunt/detection-methods/signatures/components/signatures-table/signatures-table';

export const DetectionMethods = () => {
  usePageTitle('Detection Methods');
  return (
    <>
      <OutletBreadcrumb>Detection Methods</OutletBreadcrumb>
      <DefaultPage
        title="Detection Methods"
        description="Explore and investigate your detection logic in depth, understanding how network threats are identified, analyzed, and contextualized, to help you enhance detection capabilities and accelerate security investigations within your environment."
      >
        <SignaturesTable />
      </DefaultPage>
    </>
  );
};
