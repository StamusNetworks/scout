import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { NetworkTreeSunburst } from '@/features/analytics/hosts/components/network-tree/network-tree-sunburst';

export const AttackSurfaceVisualisation = () => (
  <>
    <OutletBreadcrumb>Visualisation</OutletBreadcrumb>
    <div className="mt-4">
      <NetworkTreeSunburst />
    </div>
  </>
);
