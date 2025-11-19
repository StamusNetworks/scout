import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { EntitiesForceGraph } from '@/features/hunt/entities/components/entities-force-graph/entities-force-graph';

export const ThreatsGraphPage = () => {
  return (
    <>
      <OutletBreadcrumb>Entities graph</OutletBreadcrumb>
      <EntitiesForceGraph />
    </>
  );
};
