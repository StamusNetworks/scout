import { RowSelectionState } from '@tanstack/react-table';
import { Group, Info, Plus, Trash, X } from 'lucide-react';
import { parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';
import { keys, values } from 'ramda';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
  Page,
  PageActions,
  PageContainer,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from '@/common/design-system/atoms/page';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/common/design-system/atoms/ui/alert';
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
import { useFeatureFlags } from '@/common/lib/use-feature-flags';
import { useGetFilterSetsQuery } from '@/features/hunt/filtering/query-filters/api/query-filter.api';
import { openSaveFilterSetModal } from '@/features/hunt/filtering/query-filters/components/save-filterset/save-filterset.slice';
import { filterSetPageConfig } from '@/features/hunt/filtering/query-filters/constants/query-filtersets';
import {
  getFiltersFromFilterSet,
  QueryFilterSet,
} from '@/features/hunt/filtering/query-filters/model/query-filterset.schema';
import {
  addQueryFilterSets,
  QueryFiltersKey,
} from '@/features/hunt/filtering/query-filters/store/query-filters-sets.slice';
import { loadFilterSet } from '@/features/hunt/filtering/query-filters/use-cases/load-filter-set';
import { disableHelp, useHelpState } from '@/features/ui/help/help.slice';
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

export const FilterSetsPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [search, setSearch] = useQueryState(
    'search',
    parseAsString.withDefault(''),
  );
  const [page, setPage] = useQueryState(
    'page',
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

  const { showFilterSetsBackNavTip } = useHelpState();

  const { enterprise } = useFeatureFlags();
  const columns = getColumns(enterprise);

  const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});

  const selectedIds = keys(selectedRows);
  const selectedFilterSets = filteredData.results.filter((set) =>
    selectedIds.includes(set.id?.toString()),
  );

  return (
    <Page>
      <PageContainer>
        {showFilterSetsBackNavTip && (
          <Alert className="mb-4">
            <Info />
            <AlertTitle>Pro tip</AlertTitle>
            <AlertDescription>
              After loading a Filter Set, use your browser&apos;s back button to
              come back to the Filter Sets page with preserved filters to cycle
              through the list effortlessly.
            </AlertDescription>
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute top-2 right-2 size-7 pl-0!"
              onClick={() => dispatch(disableHelp('showFilterSetsBackNavTip'))}
            >
              <X />
            </Button>
          </Alert>
        )}
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Filter Sets</PageTitle>
            <PageDescription>
              Filter Sets help streamline your investigations by providing
              curated collections of filters, making it easier to rapidly
              trigger hunts or explore specific areas of your network.
              Effortlessly discover, manage, and create filter sets tailored to
              your investigation needs.
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <Button onClick={() => dispatch(openSaveFilterSetModal())}>
              <Group />
              Create Filter Set
            </Button>
          </PageActions>
        </PageHeader>
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
      </PageContainer>
    </Page>
  );
};

const getColumns = (enterprise: boolean): CustomColumnDef<QueryFilterSet>[] => [
  {
    id: 'name',
    header: 'Name',
    cell: ({ row }) => <div>{row.original.name}</div>,
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
        <Button
          onClick={(e) => {
            e.stopPropagation();
            console.log('delete');
          }}
          variant="outline"
          size="icon-sm"
        >
          <Trash />
        </Button>
      ),
  },
];

const handleLoadFilterSet = (
  filterSet: QueryFilterSet,
  navigate: ReturnType<typeof useNavigate>,
) => {
  loadFilterSet(filterSet);
  const filters = getFiltersFromFilterSet(filterSet);
  const suffix =
    filterSet.page === 'HOSTS_LIST' &&
    filters?.some((filter) => !filter.id.startsWith('host_id.'))
      ? ''
      : '?with_alerts=false';
  navigate(filterSetPageConfig[filterSet.page].route + suffix);
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
      <DropdownMenuTrigger>
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
