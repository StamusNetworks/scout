import { Group, Info, Trash, X } from 'lucide-react';
import { parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';
import { keys, values } from 'ramda';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { store } from '@/app/App';
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
import { DataTable } from '@/common/design-system/molecules/data-table';
import { DataTableToolbar } from '@/common/design-system/molecules/data-table/data-table.toolbar';
import { CommandFilterSingle } from '@/common/design-system/molecules/data-table/filters/command-filter-single';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { TextFilter } from '@/common/design-system/molecules/data-table/filters/text-filter';
import { capitalizeFirst } from '@/common/lib/strings';
import { useFeatureFlags } from '@/common/lib/use-feature-flags';
import { useGetFilterSetsQuery } from '@/features/hunt/filtering/query-filters/api/query-filter.api';
import { openSaveFilterSetModal } from '@/features/hunt/filtering/query-filters/components/save-filterset/save-filterset.slice';
import { filterSetPageConfig } from '@/features/hunt/filtering/query-filters/constants/query-filtersets';
import { QueryFilterSet } from '@/features/hunt/filtering/query-filters/model/query-filterset.schema';
import {
  addQueryFilter,
  clearQueryFilters,
  updateTagFilters,
} from '@/features/hunt/filtering/query-filters/store/query-filters.slice';
import { disableHelp, useHelpState } from '@/features/ui/help/help.slice';
import { useAppDispatch } from '@/store/store';

const typeMap = {
  global: 'global',
  private: 'private',
  static: 'stamus',
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
            </DataTableToolbar>
          }
        />
      </PageContainer>
    </Page>
  );
};

const getColumns = (enterprise: boolean): CustomColumnDef<QueryFilterSet>[] => [
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
    id: 'name',
    header: 'Name',
    cell: ({ row }) => <div>{row.original.name}</div>,
  },
  ...(enterprise
    ? ([
        {
          id: 'type',
          header: 'Type',
          accessorFn: (row) =>
            row.share ? capitalizeFirst(typeMap[row.share]) : null,
        },
      ] as CustomColumnDef<QueryFilterSet>[])
    : []),
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
  store.dispatch(clearQueryFilters());
  const globalFilter = filterSet.content.find((f) => f.id === 'alert.tag');
  if (globalFilter && typeof globalFilter.value !== 'string') {
    store.dispatch(
      updateTagFilters({
        stamus: globalFilter.value.stamus,
        alert: globalFilter.value.alerts,
        discovery: globalFilter.value.sightings,
        informational: globalFilter.value.informational,
        relevant: globalFilter.value.relevant,
        untagged: globalFilter.value.untagged,
      }),
    );
  }
  filterSet.content
    .filter((f) => f.id !== 'alert.tag')
    .forEach((filter) => {
      store.dispatch(
        addQueryFilter({
          key: filter.id,
          value: filter.value as string,
          options: {
            is_wildcarded:
              filter.id === 'es_filter'
                ? false
                : 'fullString' in filter && !filter.fullString,
            is_negated: 'negated' in filter && filter.negated,
          },
        }),
      );
    });
  navigate(filterSetPageConfig[filterSet.page].route);
  toast.success('Filterset applied');
};
