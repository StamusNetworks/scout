import { Link } from '@tanstack/react-router';
import { cva } from 'class-variance-authority';
import { Search } from 'lucide-react';
import { parseAsBoolean, useQueryState } from 'nuqs';
import { useMemo, useState } from 'react';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Badge } from '@/common/design-system/atoms/ui/badge';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from '@/common/design-system/atoms/ui/empty';
import { Separator } from '@/common/design-system/atoms/ui/separator';
import { DateTime } from '@/common/design-system/entities/date-time';
import { DataTable } from '@/common/design-system/molecules/data-table';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DataTableRowExpander } from '@/common/design-system/molecules/data-table/data-table.row-expander';
import { DataTableToolbar } from '@/common/design-system/molecules/data-table/data-table.toolbar';
import { CommandFilterMultiple } from '@/common/design-system/molecules/data-table/filters/command-filter-multiple';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { SwitchFilter } from '@/common/design-system/molecules/data-table/filters/switch-filter';
import { TextFilter } from '@/common/design-system/molecules/data-table/filters/text-filter';
import { ValueListCard } from '@/common/design-system/molecules/value-list-card';
import { Paginated } from '@/common/fetching/fetching.types';
import { esEscape } from '@/common/lib/strings';
import { useSetDates } from '@/features/dates';
import {
  type SerializedFilterFlags,
  toFilterFlags,
} from '@/features/filtering/filters/query-filters/filter-flags.model';
import { QueryFilterState } from '@/features/filtering/filters/query-filters/query-filter.model';
import { useClearFilters } from '@/features/filtering/filters/query-filters/use-cases/clear-filters/clear-filters';
import { useCreateFilter } from '@/features/filtering/filters/query-filters/use-cases/create-filter/create-filter';
import { useReplaceFilters } from '@/features/filtering/filters/query-filters/use-cases/replace-filters/replace-filters';
import { getFilterLabel } from '@/features/filtering/filters/query-filters/utils/get-filter-label';
import { useTagFiltersRepository } from '@/features/filtering/filters/tag-filters/tag-filters.repository';
import { InvestigationParams } from '@/features/investigation/components/investigation-details/investigation-params';
import { InvestigationResults } from '@/features/investigation/components/investigation-details/investigation-results';
import { InvestigationStage } from '@/features/investigation/components/investigation-details/investigation-stage';
import { inventoryHistoryOptions } from '@/features/investigation/components/ongoing-investigation/ongoing-investigation.save';
import { InvestigationState } from '@/features/investigation/investigation.slice';
import { InvestigationHistory } from '@/features/investigation/investigations-history.slice';
import { useAppSelector } from '@/store/store';

function useShowOnlyKept() {
  return useQueryState('only_kept', parseAsBoolean.withDefault(true));
}

export const InvestigationHistoryList = () => {
  const investigationsHistory = useAppSelector(
    (state) => state.investigation.history.investigations,
  );
  const data = useMemo(
    () => ({
      results: investigationsHistory,
      count: investigationsHistory.length,
    }),
    [investigationsHistory],
  );

  if (!data.results || data.results.length === 0)
    return (
      <Empty className="border">
        <EmptyMedia variant="icon">
          <Search />
        </EmptyMedia>
        <EmptyHeader>Empty investigations history</EmptyHeader>
        <EmptyDescription>
          Create your first investigation by going to the Explorer and clicking
          on a card options.
        </EmptyDescription>
        <EmptyContent>
          <Link to="/explorer">
            <Button variant="default">Create your first investigation</Button>
          </Link>
        </EmptyContent>
      </Empty>
    );
  return <InvestigationHistoryTable data={data} />;
};

const investigationHistoryColumns: CustomColumnDef<InvestigationHistory>[] = [
  {
    id: 'expand',
    header: '',
    cell: ({ row }) => <DataTableRowExpander row={row} />,
  },
  {
    id: 'start_date',
    accessorKey: 'start_date',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Start date"
      />
    ),
    cell: ({ row }) => (
      <DateTime date={row.original.initialParams.start_date!} />
    ),
  },
  {
    id: 'end_date',
    accessorKey: 'end_date',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="End date"
      />
    ),
    cell: ({ row }) => <DateTime date={row.original.initialParams.end_date!} />,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Name"
      />
    ),
    cell: ({ row }) => row.original.name,
  },
  {
    id: 'tags',
    accessorKey: 'tags',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Tags"
      />
    ),
    cell: ({ row }) => (
      <Row className="flex-wrap gap-1">
        {row.original.tags?.map((tag) => (
          <Badge
            key={tag}
            className={investigationHistoryTags({ variant: 'red' })}
          >
            {tag}
          </Badge>
        ))}
      </Row>
    ),
  },
  {
    id: 'results',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Results"
      />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        {row.original.results?.map((result) => (
          <div
            key={result.key}
            className="flex gap-1"
          >
            <p className="text-xs">{getFilterLabel(result.key)} </p>
            <p className="text-xs">({result.values.length})</p>
          </div>
        ))}
      </div>
    ),
  },
];

const InvestigationHistoryTable = ({
  data,
}: {
  data: Paginated<InvestigationHistory>;
}) => {
  const [showOnlyKept, setShowOnlyKept] = useShowOnlyKept();
  const [searchInput, setSearchInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  return (
    <DataTable
      data={data}
      columns={investigationHistoryColumns}
      ExpandedRow={({ row }) => (
        <InvestigationHistoryItem investigation={row.original} />
      )}
      toolBar={
        <DataTableToolbar>
          <TextFilter
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search name..."
          />
          <CommandFilterMultiple
            title="Tags"
            value={tags}
            onChange={setTags}
            options={inventoryHistoryOptions}
          />
          <SwitchFilter
            value={showOnlyKept}
            setValue={setShowOnlyKept}
            title="Show only kept values"
          />
        </DataTableToolbar>
      }
    />
  );
};

const InvestigationHistoryItem = ({
  investigation,
}: {
  investigation: InvestigationHistory;
}) => {
  const setDates = useSetDates();
  const [showOnlyKept] = useShowOnlyKept();
  const clearFilters = useClearFilters();
  const createFilter = useCreateFilter();
  const replaceFilters = useReplaceFilters();
  const tagFiltersRepo = useTagFiltersRepository();

  const handleLoadAsFilters = ({
    start_date,
    end_date,
    tags,
    qfilter,
    stages,
  }: {
    start_date: number;
    end_date: number;
    tags?: SerializedFilterFlags;
    qfilter: QueryFilterState[];
    stages: InvestigationState['stages'];
  }) => {
    clearFilters();
    setDates({
      type: 'range',
      start_date,
      end_date,
    });
    if (tags) {
      const flags = toFilterFlags(tags);
      tagFiltersRepo.setEventTypes(flags.eventTypes);
      tagFiltersRepo.setAlertTags(flags.alertTags);
      tagFiltersRepo.setNovelty(flags.novelty);
    }
    replaceFilters(qfilter);
    stages.forEach((stage) => {
      createFilter({
        key: 'es_filter',
        value: stage.values
          .filter((v) => v.result === 'kept')
          .map((v) => `${stage.key}:"${esEscape(v.value)}"`)
          .join(' OR '),
      });
    });
  };
  return (
    <div className="p-3">
      <Row className="justify-between gap-8">
        <InvestigationParams
          startDate={investigation.initialParams.start_date!}
          endDate={investigation.initialParams.end_date!}
          tags={investigation.initialParams.tags ?? undefined}
          qfilter={investigation.initialParams.qfilter!}
          comment={investigation.comment}
        />
        <Row>
          <Button
            variant="outline"
            onClick={() =>
              handleLoadAsFilters({
                start_date: investigation.initialParams.start_date!,
                end_date: investigation.initialParams.end_date!,
                tags: investigation.initialParams.tags,
                qfilter: investigation.initialParams.qfilter!,
                stages: investigation.stages,
              })
            }
          >
            Load as filters
          </Button>
        </Row>
      </Row>
      <Separator className="my-4" />
      <Column className="gap-2">
        {investigation.stages.map((stage, index) => (
          <InvestigationStage
            key={index}
            stage={stage}
            index={index}
            showOnlyKept={showOnlyKept}
          />
        ))}
        <InvestigationResults
          resultsCount={investigation.results?.length || 0}
          slot={investigation.results?.map((ioc) => (
            <ValueListCard
              key={ioc.key}
              title={getFilterLabel(ioc.key)}
              es_key={ioc.key}
              data={ioc.values}
              maxItems={5}
            />
          ))}
        />
      </Column>
    </div>
  );
};

const investigationHistoryTags = cva('shadow-none', {
  variants: {
    variant: {
      default: '',
      green: '',
      blue: '',
      purple: '',
      red: 'bg-red-100 text-red-900',
      sky: '',
      yellow: '',
      orange: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
