import { Row } from '@tanstack/react-table';
import { format } from 'date-fns';

import { Grid } from '@/common/design-system/atoms/layout/grid';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/border-tabs';
import { TableCard } from '@/common/design-system/molecules/table-card';
import { useGetRuleSetsQuery } from '@/features/rules';

import { useGetFilterActionStatsQuery } from '../../api/filter-actions.api';
import { FilterAction } from '../../model/filter-action';
import { FilterActionParameters } from './filter-actions-parameters';
import { getRowFilters } from './filter-actions-table.columns';

export const ExpandedFilterActionRow = ({
  row,
}: {
  row: Row<FilterAction>;
}) => {
  const { data: rulesetsList } = useGetRuleSetsQuery();
  const { data, isLoading } = useGetFilterActionStatsQuery({
    id: row.original.id,
  });

  return (
    <Tabs
      className="p-1"
      defaultValue="filter_action_overview"
    >
      <TabsList className="grid w-full grid-cols-8">
        <TabsTrigger value="filter_action_overview">Filter Action</TabsTrigger>
        <TabsTrigger value="filter_action_statistics">Statistics</TabsTrigger>
      </TabsList>
      <TabsContent value="filter_action_overview">
        <Grid className="grid-cols-4 gap-2">
          <TableCard
            title="Filters"
            dropdown={false}
          >
            {getRowFilters(row.original, row.original.filterDefs.length)}
          </TableCard>
          <TableCard
            title="Parameters"
            dropdown={false}
          >
            <FilterActionParameters filterAction={row.original} />
          </TableCard>
          <TableCard
            title="Rulesets"
            dropdown={false}
          >
            {row.original.rulesets.map((itemRulesetId) => (
              <div key={itemRulesetId}>
                {rulesetsList?.find((o) => o.id === itemRulesetId)?.name}
              </div>
            ))}
          </TableCard>
          <TableCard
            title="Comment details"
            dropdown={false}
          >
            <div>
              <b>username: </b>
              {row.original.username}
            </div>
            <div>
              <b>creation date: </b>
              {format(new Date(row.original.createdAt), 'yyyy-MM-dd HH:mm')}
            </div>
            <div>
              <b>comment: </b>
              {row.original.comment}
            </div>
          </TableCard>
        </Grid>
      </TabsContent>
      <TabsContent value="filter_action_statistics">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <Grid className="grid-cols-4 gap-2">
            {data?.map((item) => (
              <TableCard
                key={item.key}
                title={item.key}
                dropdown={false}
              >
                <div>
                  <b>Drop:</b> {item.drop}
                </div>
                <div>
                  <b>Seen:</b> {item.seen}
                </div>
              </TableCard>
            ))}
          </Grid>
        )}
      </TabsContent>
    </Tabs>
  );
};
