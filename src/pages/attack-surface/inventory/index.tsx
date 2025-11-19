import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { useHomeNetParam } from '@/features/analytics/hosts/components/home-net-picker/use-home-net-param';
import { InventoryTable } from '@/features/analytics/hosts/components/hostsTable/inventory-table';

export const AttackSurfaceInventory = () => {
  const [inHomeNetwork] = useHomeNetParam();
  return (
    <>
      <OutletBreadcrumb>Inventory</OutletBreadcrumb>
      <InventoryTable inHomeNetwork={inHomeNetwork} />
    </>
  );
};
