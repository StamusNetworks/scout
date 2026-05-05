import { Column } from '@/common/design-system/atoms/layout/column';
import { ExpandableWrapper } from '@/common/design-system/molecules/expandable-wrapper';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import { useGetImpactedEntitiesQuery } from '../../api/entities.api';
import { ThreatKind } from '../../model/threat';
import { EntitiesForceGraphComponent } from './entities-force-graph.force-graph';
import { formatForcegraph } from './entities-force-graph.utils';

const FAMILY_CLASS_BY_KIND = {
  compromise: 'doc',
  policyViolation: 'dopv',
} as const;

export const EntitiesForceGraph = ({ kind }: { kind: ThreatKind }) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { data, isLoading } = useGetImpactedEntitiesQuery({
    ...params,
    page_size: 1000000,
    family_class: FAMILY_CLASS_BY_KIND[kind],
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
