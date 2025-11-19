import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { values } from 'ramda';

import { DataTableToolbar } from '@/common/design-system/molecules/data-table/data-table.toolbar.tsx';
import { DataTable } from '@/common/design-system/molecules/data-table/data-table.tsx';
import { CommandFilterSingle } from '@/common/design-system/molecules/data-table/filters/command-filter-single.tsx';
import { usePaginationUrlState } from '@/common/design-system/molecules/data-table/hooks/use-pagination.ts';
import { FilterType } from '@/features/hunt/filtering/query-filters/constants/query-filter.config.ts';

import { useGetDeeplinksQuery } from '../../api/deeplinks.api.ts';
import { columns } from './deeplinks-table.columns.tsx';

const booleanAsString = ['true', 'false'] as const;

export const DeeplinksTable = () => {
  const [pagination, setPagination] = usePaginationUrlState();
  const [entity, setEntity] = useQueryState(
    'entity',
    parseAsStringLiteral(values(FilterType)),
  );
  const [userDefined, setUserDefined] = useQueryState(
    'user_defined',
    parseAsStringLiteral(booleanAsString),
  );
  const [enabled, setEnabled] = useQueryState(
    'enabled',
    parseAsStringLiteral(booleanAsString),
  );

  const { data, isLoading } = useGetDeeplinksQuery({
    ...pagination,
    entities__name: entity || undefined,
    user_defined: userDefined || undefined,
    enabled: enabled || undefined,
  });
  return (
    <DataTable
      data={data}
      isLoading={isLoading}
      columns={columns}
      pagination={pagination}
      onPaginationChange={setPagination}
      toolBar={
        <DataTableToolbar>
          <CommandFilterSingle
            title="Filter type"
            value={entity}
            onChange={(value) => setEntity(value as typeof entity)}
            options={values(FilterType).map((value) => ({
              label: value,
              value: value,
            }))}
          />
          <CommandFilterSingle
            title="Author"
            value={userDefined}
            onChange={(value) => setUserDefined(value as typeof userDefined)}
            options={[
              {
                label: 'Stamus',
                value: 'false',
              },
              {
                label: 'User',
                value: 'true',
              },
            ]}
            canSearch={false}
          />
          <CommandFilterSingle
            title="Enabled"
            value={enabled}
            onChange={(value) => setEnabled(value as typeof enabled)}
            options={[
              {
                label: 'Enabled',
                value: 'true',
              },
              {
                label: 'Disabled',
                value: 'false',
              },
            ]}
            canSearch={false}
          />
        </DataTableToolbar>
      }
    />
  );
};
