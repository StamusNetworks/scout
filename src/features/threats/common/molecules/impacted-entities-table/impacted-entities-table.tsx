import { Link, useNavigate } from '@tanstack/react-router';
import { Biohazard, Scale } from 'lucide-react';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { useMemo } from 'react';

import { Button } from '@/common/design-system/atoms/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from '@/common/design-system/atoms/ui/empty';
import { DataTable } from '@/common/design-system/molecules/data-table';
import { DataTableToolbar } from '@/common/design-system/molecules/data-table/data-table.toolbar';
import { CommandFilterSingle } from '@/common/design-system/molecules/data-table/filters/command-filter-single';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { TextFilter } from '@/common/design-system/molecules/data-table/filters/text-filter';
import { useServerTableState } from '@/common/design-system/molecules/data-table/hooks/use-server-table-state.ts';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';

import { useGetImpactedEntitiesQuery } from '../../entities.api';
import { Entity } from '../../entity';
import { ExpandedRow } from './impacted-asstets-table.expanded-row';
import {
  exportThreatsColumns,
  getColumns,
} from './impacted-entities-table.columns';

export const ImpactedEntitiesTable = ({
  threatId,
  familyId,
  customColumns,
  familyClass,
}: {
  threatId?: number;
  familyId?: number;
  familyClass?: 'doc' | 'dopv';
  customColumns?: CustomColumnDef<Entity>[];
}) => {
  const navigate = useNavigate();
  const params = useGlobalQueryParams(['dates', 'tenant']);
  // QUERY FILTERS
  const [search, setSearch] = useQueryState('value', { defaultValue: '' });
  const [killchain, setKillchain] = useQueryState('killchain');
  const [status, setStatus] = useQueryState(
    'status',
    parseAsStringLiteral(['new', 'fixed', '']).withDefault(''),
  );
  const { queryParams, pagination, setPagination, sorting, setSorting } =
    useServerTableState({
      ...params,
      threat_id: threatId,
      family_id: familyId,
      family_class: familyClass,
      search,
      kill_chain: killchain,
      status,
    });
  // QUERY
  const { data, isFetching } = useGetImpactedEntitiesQuery(queryParams);

  const columns = useMemo(
    () => getColumns({ threatId, familyClass, setKillchain }),
    [threatId, familyClass, setKillchain],
  );

  const toolBar = (
    <DataTableToolbar>
      <TextFilter
        value={search}
        onChange={setSearch}
        placeholder="Search for entity..."
      />
      {familyClass === 'doc' && (
        <CommandFilterSingle
          title="Kill Chain"
          value={killchain}
          onChange={setKillchain}
          options={[
            {
              label: 'Reconnaissance',
              value: 'reconnaissance',
            },
            {
              label: 'Weaponization',
              value: 'weaponization',
            },
            {
              label: 'Delivery',
              value: 'delivery',
            },
            {
              label: 'Exploitation',
              value: 'exploitation',
            },
            {
              label: 'Installation',
              value: 'installation',
            },
            {
              label: 'Command and Control',
              value: 'command_and_control',
            },
            {
              label: 'Actions on Objectives',
              value: 'actions_on_objectives',
            },
          ]}
          canSearch={false}
        />
      )}
      <CommandFilterSingle
        title="Status"
        value={status}
        onChange={(value) => setStatus(value as typeof status)}
        options={[
          {
            label: 'All',
            value: '',
          },
          {
            label: 'New',
            value: 'new',
          },
          {
            label: 'Fixed',
            value: 'fixed',
          },
        ]}
      />
    </DataTableToolbar>
  );
  return (
    <DataTable
      data={data}
      isLoading={isFetching}
      columns={customColumns || columns}
      exportColumns={exportThreatsColumns({ threatId, familyClass })}
      toolBar={toolBar}
      ExpandedRow={ExpandedRow(familyClass || 'doc')}
      onRowClick={(row) =>
        navigate({
          to: `/hosts/${row.original.value}/incidents`,
        })
      }
      pagination={pagination}
      onPaginationChange={setPagination}
      sorting={sorting}
      onSortingChange={setSorting}
      getRowId={(row) => row.pk?.toString()}
      Empty={
        <Empty>
          <EmptyMedia variant="icon">
            {familyClass === 'doc' ? <Biohazard /> : <Scale />}
          </EmptyMedia>
          <EmptyContent>
            <EmptyHeader>No impacted entities found</EmptyHeader>
            <EmptyDescription>
              No impacted entities found for the current filters. Tweak your
              filters or start hunting!
            </EmptyDescription>
            <Button asChild>
              <Link to="/explorer">Go hunting</Link>
            </Button>
          </EmptyContent>
        </Empty>
      }
    />
  );
};
