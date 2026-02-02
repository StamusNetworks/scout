import { Column } from '@/common/design-system/atoms/layout/column';
import { ExpandableWrapper } from '@/common/design-system/molecules/expandable-wrapper';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';

import { useGetImpactedEntitiesQuery } from '../../api/entities.api';
import { EntitiesForceGraphComponent } from './entities-force-graph.force-graph';
import { formatForcegraph } from './entities-force-graph.utils';

export const EntitiesForceGraph = ({
  familyClass,
}: {
  familyClass: 'doc' | 'dopv';
}) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { data, isLoading } = useGetImpactedEntitiesQuery({
    ...params,
    page_size: 1000000,
    family_class: familyClass,
  });
  if (isLoading)
    return <Column className="h-[850px] w-full">Loading...</Column>;
  if (!data)
    return (
      <Column className="h-[850px] w-full items-center justify-center">
        No data.
      </Column>
    );
  const { nodes, links } = formatForcegraph(data.results);
  return (
    <ExpandableWrapper
      render={(width, height, mode) => (
        <EntitiesForceGraphComponent
          data={{
            nodes,
            links,
          }}
          height={mode === 'detached' ? height : 850}
          width={width}
        />
      )}
    />
  );
};
