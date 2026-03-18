import { createSelector } from '@reduxjs/toolkit';
import {
  LaptopMinimal,
  LucideIcon,
  MapPin,
  Settings,
  User,
} from 'lucide-react';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { useCallback, useEffect, useMemo } from 'react';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Badge } from '@/common/design-system/atoms/ui/badge';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from '@/common/design-system/atoms/ui/empty';
import {
  SunburstGraph,
  type SunburstNode,
} from '@/common/design-system/graphs/sunburst/sunburst';
import { CommandFilterSingle } from '@/common/design-system/molecules/data-table/filters/command-filter-single';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { formatNumber } from '@/common/lib/numbers';
import { esEscape } from '@/common/lib/strings';
import { useGetNetworkTreeQuery } from '@/features/host-insights/common/host-insights.api';
import {
  selectHostIDQFilter,
  selectQueryFilters,
} from '@/features/hunt/filtering/query-filters/store/query-filters.selector';
import { useAppSelector } from '@/store/store';

import { useHomeNetParam } from '../home-net-picker/use-home-net-param';
import { NetworkTreeFilterService } from './network-tree.filter-service';

export type TreeDataPayload = {
  path: string;
  ips_count: number;
  roles_count: number;
  hostnames_count: number;
  usernames_count: number;
  services_count: number;
};

export type TreeData = SunburstNode<TreeDataPayload>;

const options = [
  {
    label: 'IPs',
    value: 'ips',
    key: 'ips_count',
    Icon: MapPin,
  },
  {
    label: 'Roles',
    value: 'roles',
    key: 'roles_count',
    Icon: Settings,
  },
  {
    label: 'Hostnames',
    value: 'hostnames',
    key: 'hostnames_count',
    Icon: LaptopMinimal,
  },
  {
    label: 'Usernames',
    value: 'usernames',
    key: 'usernames_count',
    Icon: User,
  },
  {
    label: 'Services',
    value: 'services',
    key: 'services_count',
    Icon: LaptopMinimal,
  },
];

export const NetworkTreeSunburst = () => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const qfilterHost = useAppSelector(
    selectHostIDQFilter([], ['host_id.net_info.agg']),
  );
  const [inHomeNet] = useHomeNetParam();
  const [count, setCount] = useQueryState(
    'count',
    parseAsStringLiteral(options.map((o) => o.value)).withDefault('ips'),
  );

  const { data } = useGetNetworkTreeQuery({
    ...params,
    host_id_qfilter: [
      ...(qfilterHost ? [qfilterHost] : []),
      ...(inHomeNet !== 'all'
        ? [`host_id.in_home_net: ${esEscape(inHomeNet)}`]
        : []),
    ].join(' AND '),
  });
  const treeData = useMemo(() => {
    if (!data) return undefined;
    return computeTree(
      data,
      options.find((o) => o.value === count)?.key || 'ips_count',
    );
  }, [data, count]);
  const selectedNode = useAppSelector(selectNode);
  const handleNodeClick = useCallback(
    /* @ts-expect-error flemme */
    (_, node) =>
      node.data.name === 'root'
        ? NetworkTreeFilterService.clearFilter()
        : NetworkTreeFilterService.addFilter(
            node.children ? '*.' + node.data.path : node.data.path,
          ),
    [],
  );

  useEffect(() => {
    NetworkTreeFilterService.clearFilterNonAttackSurface();
  }, []);

  const currentNode = useMemo(() => {
    return findNodeByPath(treeData, selectedNode);
  }, [treeData, selectedNode]);

  if (!treeData || treeData?.children?.length === 0)
    return (
      <Empty className="min-h-96 border">
        <EmptyMedia variant="icon">
          <LaptopMinimal />
        </EmptyMedia>
        <EmptyHeader>No hosts found</EmptyHeader>
        <EmptyDescription>
          No data found for the current filters. You might be missing network
          definitions, or the selected filters are too restrictive.
        </EmptyDescription>
      </Empty>
    );

  const option = options.find((o) => o.value === count);

  return (
    <>
      <CommandFilterSingle
        title="Count"
        value={count}
        onChange={setCount}
        options={options}
      />
      {isGraphEmpty(treeData) && option ? (
        <Empty className="mt-4 min-h-96 border">
          <EmptyMedia variant="icon">
            <option.Icon />
          </EmptyMedia>
          <EmptyHeader>No {option.label} found</EmptyHeader>
          <EmptyDescription>Try another counting method</EmptyDescription>
        </Empty>
      ) : (
        <Grid className="grid-cols-[1fr_270px] gap-2">
          <SunburstGraph<TreeDataPayload>
            data={treeData}
            renderTooltip={renderTooltip}
            selectedNode={selectedNode}
            onNodeClick={handleNodeClick}
          />
          <Column className="w-full shrink-0 gap-4">
            {renderTooltip(currentNode)}
            {currentNode?.children && currentNode.children.length > 0 && (
              <Column>
                <h2 className="text-sm font-bold">Children</h2>
                <Column className="gap-2">
                  {currentNode?.children
                    ?.map((child) => ({
                      ...child,
                      aggregatedCounts: aggregateCountsForTooltip(child),
                    }))
                    .sort((a, b) => {
                      const key = options.find((o) => o.value === count)?.key;
                      return (
                        b.aggregatedCounts[
                          key as keyof typeof b.aggregatedCounts
                        ] -
                        a.aggregatedCounts[
                          key as keyof typeof a.aggregatedCounts
                        ]
                      );
                    })
                    .map((child) => {
                      return (
                        <Button
                          key={child.path}
                          variant="outline"
                          size="none"
                          className="group flex-col items-start justify-center gap-1 rounded-md p-2 pt-0.5"
                          onClick={() => handleNodeClick(null, { data: child })}
                        >
                          <p className="text-sm font-medium">{child.name}</p>
                          <Grid className="w-full grid-cols-3 gap-1">
                            <ChildBadge
                              count={child.aggregatedCounts.ips_count}
                              Icon={MapPin}
                            />
                            <ChildBadge
                              count={child.aggregatedCounts.roles_count}
                              Icon={Settings}
                            />
                            <ChildBadge
                              count={child.aggregatedCounts.hostnames_count}
                              Icon={LaptopMinimal}
                            />
                            <ChildBadge
                              count={child.aggregatedCounts.usernames_count}
                              Icon={User}
                            />
                            <ChildBadge
                              count={child.aggregatedCounts.services_count}
                              Icon={LaptopMinimal}
                            />
                          </Grid>
                        </Button>
                      );
                    })}
                </Column>
              </Column>
            )}
          </Column>
        </Grid>
      )}
    </>
  );
};

const ChildBadge = ({ count, Icon }: { count: number; Icon: LucideIcon }) => (
  <Badge
    variant="discreet"
    className="group-hover:bg-primary/5 dark:group-hover:bg-primary/25 justify-between gap-2 transition-all duration-100"
  >
    <Icon />
    {formatNumber(count)}
  </Badge>
);

const selectNode = createSelector([selectQueryFilters], (filters) => {
  const filter = filters.find(
    (f) => f.role === 'attack_surface' && f.is_suspended === false,
  );
  if (!filter) return 'root';
  if (
    filter.is_negated &&
    filter.value === '*' &&
    filter.is_wildcarded === true
  ) {
    return 'Undefined Network';
  }
  return filter.value.toString().replace('*.', '') || 'root';
});

export function findNodeByPath(
  root: TreeData | undefined,
  path?: string | null,
): TreeData | undefined {
  if (!root) return undefined;
  if (!path || path === 'root') return root;

  const pathParts = path.split('.').reverse();
  let current: TreeData = root;

  for (const part of pathParts) {
    const found: TreeData | undefined = current.children?.find(
      (child) => child.name === part,
    );
    if (!found) return undefined;
    current = found;
  }

  return current;
}

type Node = {
  key: string;
  ips_count: number;
  roles_count: number;
  hostnames_count: number;
  usernames_count: number;
  services_count: number;
};

function computeTree(data: Node[], count: string): TreeData {
  // Create a map to store nodes by their path
  const nodeMap = new Map<string, TreeData>();

  // Initialize root node
  const root: TreeData = {
    path: 'root',
    name: 'root',
    value: 0,
    ips_count: 0,
    roles_count: 0,
    hostnames_count: 0,
    usernames_count: 0,
    services_count: 0,
    children: [],
  };

  // Process each node in the data array
  data.forEach((node) => {
    const pathParts = node.key.split('.').reverse();
    let currentPath = '';

    // Build the tree structure level by level
    pathParts.forEach((part, index) => {
      const isLastPart = index === pathParts.length - 1;
      const parentPath = currentPath;
      currentPath = currentPath ? `${part}.${currentPath}` : part;

      // Get or create the current node
      let currentNode = nodeMap.get(currentPath);
      if (!currentNode) {
        currentNode = {
          path: currentPath,
          name: part,
          value: 0,
          ips_count: 0,
          roles_count: 0,
          hostnames_count: 0,
          usernames_count: 0,
          services_count: 0,
          children: [],
        };
        nodeMap.set(currentPath, currentNode);

        // Add to parent's children
        if (parentPath) {
          const parentNode = nodeMap.get(parentPath);
          if (parentNode && parentNode.children) {
            parentNode.children.push(currentNode);
          }
        } else {
          // This is a top-level node, add to root
          root.children!.push(currentNode);
        }
      }

      // If this is the leaf node (last part), add the actual data
      if (isLastPart && currentNode) {
        currentNode.value = node[count as keyof Node] as number;
        currentNode.ips_count = node.ips_count;
        currentNode.roles_count = node.roles_count;
        currentNode.hostnames_count = node.hostnames_count;
        currentNode.usernames_count = node.usernames_count;
        currentNode.services_count = node.services_count;
      }
    });
  });

  return root;
}

const renderTooltip = (treeNode: TreeData | undefined) => {
  if (!treeNode) return null;

  const aggregatedCounts = aggregateCountsForTooltip(treeNode);

  return (
    <div className="space-y-2">
      <div
        className="truncate font-semibold"
        title={treeNode.path}
      >
        {treeNode.path}
      </div>
      <div className="space-y-1 text-sm">
        <RowTemplate
          Icon={MapPin}
          label="IPs"
          value={aggregatedCounts.value}
        />
        <RowTemplate
          Icon={Settings}
          label="Roles"
          value={aggregatedCounts.roles_count}
        />
        <RowTemplate
          Icon={LaptopMinimal}
          label="Hostnames"
          value={aggregatedCounts.hostnames_count}
        />
        <RowTemplate
          Icon={User}
          label="Usernames"
          value={aggregatedCounts.usernames_count}
        />
        <RowTemplate
          Icon={LaptopMinimal}
          label="Services"
          value={aggregatedCounts.services_count}
        />
      </div>
    </div>
  );
};

const RowTemplate = ({
  Icon,
  label,
  value,
}: {
  Icon: LucideIcon;
  label: string;
  value?: number;
}) => (
  <Row className="items-center justify-between gap-4">
    <Row className="items-center gap-1">
      <Icon />
      {label}
    </Row>
    <Badge variant="secondary">{formatNumber(value || 0)}</Badge>
  </Row>
);

function aggregateCountsForTooltip(node: TreeData): {
  value: number;
  ips_count: number;
  roles_count: number;
  hostnames_count: number;
  usernames_count: number;
  services_count: number;
} {
  const aggregated = {
    value: node.value || 0,
    ips_count: node.ips_count || 0,
    roles_count: node.roles_count || 0,
    hostnames_count: node.hostnames_count || 0,
    usernames_count: node.usernames_count || 0,
    services_count: node.services_count || 0,
  };

  if (node.children && node.children.length > 0) {
    node.children.forEach((child) => {
      const childAggregated = aggregateCountsForTooltip(child);
      aggregated.value += childAggregated.value;
      aggregated.ips_count += childAggregated.ips_count;
      aggregated.roles_count += childAggregated.roles_count;
      aggregated.hostnames_count += childAggregated.hostnames_count;
      aggregated.usernames_count += childAggregated.usernames_count;
      aggregated.services_count += childAggregated.services_count;
    });
  }

  return aggregated;
}

function isGraphEmpty(treeData: TreeData): boolean {
  // Recursively sum all value properties in the tree
  const totalValue = sumAllValues(treeData);
  return totalValue === 0;
}

function sumAllValues(node: TreeData): number {
  // Start with the current node's value
  let sum = node.value || 0;

  // Add values from all children recursively
  if (node.children && node.children.length > 0) {
    node.children.forEach((child) => {
      sum += sumAllValues(child);
    });
  }

  return sum;
}
