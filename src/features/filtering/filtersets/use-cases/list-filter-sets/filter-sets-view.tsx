import { useNavigate } from '@tanstack/react-router';
import { RowSelectionState } from '@tanstack/react-table';
import { Check, Plus, Trash } from 'lucide-react';
import { parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';
import { keys, values } from 'ramda';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/common/design-system/atoms/ui/dropdown-menu';
import { DataTable } from '@/common/design-system/molecules/data-table';
import { DataTableToolbar } from '@/common/design-system/molecules/data-table/data-table.toolbar';
import { CommandFilterSingle } from '@/common/design-system/molecules/data-table/filters/command-filter-single';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { TextFilter } from '@/common/design-system/molecules/data-table/filters/text-filter';
import { usePaginationUrlState } from '@/common/design-system/molecules/data-table/hooks/use-pagination';
import { DeleteModal } from '@/common/design-system/molecules/delete-modal';
import { useFeatureFlags } from '@/common/lib/use-feature-flags';
import { cn } from '@/common/lib/utils';
import {
  getFiltersFromFilterSet,
  QueryFilterSet,
} from '@/features/filtering/filtersets/filterset.model';
import {
  useDeleteFilterSetMutation,
  useGetFilterSetsQuery,
} from '@/features/filtering/filtersets/filtersets.api';
import { filterSetPageConfig } from '@/features/filtering/filtersets/filtersets.constants';
import {
  addQueryFilterSets,
  QueryFiltersKey,
  useIsLoadedFilterSet,
} from '@/features/filtering/filtersets/filtersets.store';
import { loadFilterSet } from '@/features/filtering/filtersets/use-cases/load-filter-set/load-filter-set';
import { useAppDispatch } from '@/store/store';

const typeMap = {
  global: 'global',
  private: 'private',
  static: 'stamus',
} as const;
const labelMap = {
  global: 'Shared',
  private: 'Personal',
  static: 'Built-in',
} as const;
const reverseTypeMap = Object.fromEntries(
  Object.entries(typeMap).map(([key, value]) => [value, key]),
);
const pageReverseMap = Object.fromEntries(
  Object.entries(filterSetPageConfig).map(([key, value]) => [value.label, key]),
);

export const FilterSetsView = () => {
  const navigate = useNavigate();
  const [pagination, setPagination] = usePaginationUrlState();
  const [search, setSearch] = useQueryState(
    'search',
    parseAsString.withDefault(''),
  );
  const [page, setPage] = useQueryState(
    'target',
    parseAsStringLiteral(values(filterSetPageConfig).map((v) => v.label)),
  );
  const [type, setType] = useQueryState(
    'type',
    parseAsStringLiteral(['global', 'private', 'stamus']),
  );
  const { data, isLoading } = useGetFilterSetsQuery(undefined);

  const filteredData = useMemo(() => {
    const filteredData =
      data
        ?.filter(
          (filterSet) =>
            filterSet.name?.toLowerCase().includes(search?.toLowerCase()) ||
            filterSet.description
              ?.toLowerCase()
              .includes(search?.toLowerCase()),
        )
        .filter((filterSet) =>
          type ? filterSet.share === reverseTypeMap[type] : true,
        )
        .filter((filterSet) =>
          page ? filterSet.page === pageReverseMap[page] : true,
        ) || [];

    return {
      results: filteredData,
      count: filteredData.length,
    };
  }, [data, search, type, page]);

  const { enterprise } = useFeatureFlags();
  const columns = getColumns(enterprise);

  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});

  const selectedIds = keys(selectedRows);
  const selectedFilterSets = filteredData.results.filter((set) =>
    selectedIds.includes(set.id?.toString()),
  );

  return (
    <DataTable
      data={filteredData}
      isLoading={isLoading}
      serverSide={false}
      columns={columns}
      defaultPageSize={20}
      onRowClick={(row) => handleLoadFilterSet(row.original, navigate)}
      rowClickCursor="pointer"
      getRowId={(row) => row.id?.toString()}
      rowSelection={selectedRows}
      onRowSelectionChange={setSelectedRows}
      pagination={pagination}
      onPaginationChange={setPagination}
      toolBar={
        <DataTableToolbar>
          <TextFilter
            value={search}
            onChange={setSearch}
            placeholder="Search Filter Sets..."
          />
          <CommandFilterSingle
            title="Page"
            value={page}
            onChange={setPage}
            options={keys(filterSetPageConfig).map((key) => ({
              label: filterSetPageConfig[key].label,
              value: filterSetPageConfig[key].label,
            }))}
            canSearch={false}
          />
          <CommandFilterSingle
            title="Type"
            value={type}
            onChange={setType as (value: string | null) => void}
            options={[
              {
                label: 'Personal',
                value: 'private',
              },
              {
                label: 'Shared',
                value: 'global',
              },
              {
                label: 'Built-in',
                value: 'stamus',
              },
            ]}
            canSearch={false}
          />
          {values(selectedRows).length > 0 && (
            <AddToDropdown
              filterSets={selectedFilterSets}
              onSuccess={() => setSelectedRows({})}
            />
          )}
        </DataTableToolbar>
      }
    />
  );
};

const getColumns = (enterprise: boolean): CustomColumnDef<QueryFilterSet>[] => [
  {
    id: 'name',
    header: 'Name',
    cell: ({ row }) => <Name filterSet={row.original} />,
  },
  ...(enterprise
    ? ([
        {
          id: 'type',
          header: 'Type',
          accessorFn: (row) => (row.share ? labelMap[row.share] : null),
        },
      ] as CustomColumnDef<QueryFilterSet>[])
    : []),
  {
    id: 'page',
    header: 'Page',
    cell: ({ row }) => {
      const Icon = filterSetPageConfig[row.original.page].icon;
      return (
        <div className="flex items-center gap-2 text-nowrap">
          <Icon />
          <div>{filterSetPageConfig[row.original.page].label}</div>
        </div>
      );
    },
  },
  {
    id: 'description',
    header: 'Description',
    cell: ({ row }) => <div>{row.original.description}</div>,
  },
  {
    id: 'delete',
    header: '',
    cell: ({ row }) =>
      row.original.id < 1 ? null : (
        <DeleteFilterSetCell filterSet={row.original} />
      ),
  },
];

const handleLoadFilterSet = (
  filterSet: QueryFilterSet,
  navigate: ReturnType<typeof useNavigate>,
) => {
  loadFilterSet(filterSet);
  const filters = getFiltersFromFilterSet(filterSet);
  const route = filterSetPageConfig[filterSet.page].route;
  const needsAlertFilter =
    filterSet.page === 'HOSTS_LIST' &&
    !filters?.some((filter) => !filter.id.startsWith('host_id.'));
  if (needsAlertFilter && route === '/hosts') {
    navigate({ to: '/hosts' as string, search: { with_alerts: false } });
  } else {
    navigate({ to: route as string });
  }
};

const AddToDropdown = ({
  filterSets,
  onSuccess,
}: {
  filterSets: QueryFilterSet[];
  onSuccess: () => void;
}) => {
  const dispatch = useAppDispatch();
  const handleAddTo = (key: QueryFiltersKey) => {
    dispatch(addQueryFilterSets({ key, sets: filterSets }));
    toast.success('Filter set added to favorites');
    onSuccess();
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
        >
          <Plus /> Add to...
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleAddTo('favorites')}>
          Favorites
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAddTo('pinned')}>
          Pinned
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const Name = ({ filterSet }: { filterSet: QueryFilterSet }) => {
  const isSelected = useIsLoadedFilterSet(filterSet.id);
  return (
    <Row className={cn('items-center gap-1', isSelected && 'font-bold')}>
      {isSelected && <Check className="shrink-0" />}
      {filterSet.name}{' '}
    </Row>
  );
};

const DeleteFilterSetCell = ({ filterSet }: { filterSet: QueryFilterSet }) => {
  const [deleteFilterSet] = useDeleteFilterSetMutation();
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DeleteModal
        title={`Delete "${filterSet.name}"`}
        description="Deleting a filter set is permanent and cannot be undone."
        handleDelete={() =>
          deleteFilterSet(filterSet.id)
            .unwrap()
            .then(() => undefined)
        }
        handleSuccess={() => toast.success('Filter set deleted successfully')}
        trigger={
          <Button
            variant="outline"
            size="icon-sm"
            data-testid="delete-filter-set-trigger"
          >
            <Trash />
          </Button>
        }
      />
    </div>
  );
};
