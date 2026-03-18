import { Column } from '@/common/design-system/atoms/layout/column';
import { ExpandablePortalWrapper } from '@/common/design-system/molecules/expandable-portal-wrapper';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';

import { useGetAttackerInfrastructureQuery } from '../../entities.api';
import { AttackerInfrastructureForceGraph } from './attacker-infrastructure.force-graph';
import { formatForcegraph } from './attacker-infrastructure.utils';

interface AttackerInfrastructureProps {
  entity: string;
}
export const AttackerInfrastructure = ({
  entity,
}: AttackerInfrastructureProps) => {
  const params = useGlobalQueryParams(['dates', 'tenant']);
  const { data, isLoading } = useGetAttackerInfrastructureQuery({
    ...params,
    asset: entity,
  });
  if (isLoading)
    return <Column className="h-[800px] w-full">Loading...</Column>;
  if (!data)
    return (
      <Column className="h-[800px] w-full items-center justify-center">
        No data.
      </Column>
    );
  const { nodes, links } = formatForcegraph(data.aggregations);
  return (
    <ExpandablePortalWrapper
      render={(width, height, mode) => (
        <AttackerInfrastructureForceGraph
          data={{
            nodes,
            links,
          }}
          width={width}
          height={mode === 'detached' ? height : 800}
        />
      )}
    />
  );
};
