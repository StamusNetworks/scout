import { cva } from 'class-variance-authority';
import {
  CirclePause,
  CirclePlay,
  DeleteIcon,
  EditIcon,
  LucideProps,
  ReplaceIcon,
} from 'lucide-react';
import { isNil, toPairs } from 'ramda';
import { useState } from 'react';

import { Row } from '@/common/design-system/atoms/layout/row';
import { Badge } from '@/common/design-system/atoms/ui/badge';
import { Card } from '@/common/design-system/atoms/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/common/design-system/atoms/ui/dropdown-menu';
import { Label } from '@/common/design-system/atoms/ui/label';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/common/design-system/atoms/ui/radio-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/common/design-system/atoms/ui/tooltip';
import { compressIPv6, isIPv6 } from '@/common/lib/ips';
import { capitalizeAll } from '@/common/lib/strings';
import { cn } from '@/common/lib/utils';

import { EditFilterModal } from '../../components/edit-qfilter-modal/edit-filter.modal';
import { FilterIcons } from '../../components/query-filters.icons';
import { FilterCategory } from '../../definitions/query-filter.config';
import { useDeleteFilter } from '../../hooks/use-delete-filter';
import {
  useQueryFilterDefinition,
  useQueryFiltersDefinitions,
} from '../../hooks/use-filters-definitions';
import { useSuspendFilter } from '../../hooks/use-suspend-filter';
import { useUpdateFilter } from '../../hooks/use-update-filter';
import { QueryFilterState, shouldShowWildcard } from '../../model/query-filter';

type SideBarQueryFilterProps = {
  filter: QueryFilterState;
  variant?: 'default' | 'suspended';
  className?: string;
};

export const sidebarFilterVariants = cva(
  'px-1.5 py-0.5 border gap-0 rounded cursor-pointer border-border',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground border-primary [&_label]:text-primary-foreground/60 [&_svg]:text-primary-foreground',
        suspended:
          'bg-muted text-muted-foreground border-muted-foreground/30 opacity-70 shadow-none',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export const SidebarQueryFilter = ({
  filter,
  variant,
  className,
}: SideBarQueryFilterProps) => {
  const deleteFilter = useDeleteFilter();
  const { toggle: toggleSuspend } = useSuspendFilter();
  const updateFilter = useUpdateFilter();

  const filterDefinition = useQueryFilterDefinition(filter.key);
  const filterGroup = useGetConvertibleFiltersDefinitions(filter.key);

  const displayValue = filterDefinition?.toDisplayValue
    ? (filterDefinition.toDisplayValue as (value: string | number) => string)(
        filter.value,
      ) || filter.value.toString()
    : isIPv6(filter.value?.toString())
      ? compressIPv6(filter.value?.toString())
      : filter.value;

  const [isEditing, setIsEditing] = useState(false);

  const actions = [
    {
      key: 'suspend-filter',
      visible: true,
      Component: (
        <FilterAction
          key="suspend-filter"
          filterId={filter.key}
          Icon={filter.is_suspended ? CirclePlay : CirclePause}
          action={() => {
            toggleSuspend(filter.id);
          }}
          tooltip={`${filter.is_suspended ? 'Activate' : 'Suspend'} filter`}
        />
      ),
    },
    {
      key: 'edit-filter',
      visible: true,
      Component: (
        <FilterAction
          key="edit-filter"
          filterId={filter.key}
          Icon={EditIcon}
          action={() => setIsEditing(true)}
          tooltip="Edit filter"
        />
      ),
    },
    {
      key: 'convert',
      visible: filterGroup?.length > 1,
      Component: (
        <DropdownMenu key="convert">
          <DropdownMenuTrigger className="p-1 opacity-50 hover:opacity-90">
            <ReplaceIcon size={12} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="p-2">
            <RadioGroup
              defaultValue={filter.key}
              onValueChange={(value) => updateFilter({ ...filter, key: value })}
              className="space-y-1"
            >
              {filterGroup.map((f) => {
                const FIcon =
                  'category' in f
                    ? FilterIcons[f.category as FilterCategory]
                    : null;
                return (
                  <Row
                    className="items-center gap-1"
                    key={f.key}
                  >
                    <RadioGroupItem
                      value={f.key}
                      id={f.key}
                      checked={filter.key === f.key}
                      disabled={filter.key === f.key}
                      className="scale-75 cursor-pointer"
                    />
                    <Label
                      htmlFor={f.key}
                      className="flex grow cursor-pointer justify-between gap-3 text-xs"
                    >
                      {'label' in f
                        ? f.label
                        : capitalizeAll(f.key.replaceAll('.', ' '))}
                      {FIcon && (
                        <FIcon className="text-muted-foreground size-4" />
                      )}
                    </Label>
                  </Row>
                );
              })}
            </RadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
    {
      key: 'delete-filter',
      visible: true,
      Component: (
        <FilterAction
          key="delete-filter"
          filterId={filter.key}
          Icon={DeleteIcon}
          action={() => {
            deleteFilter(filter.id);
          }}
          tooltip="Delete filter"
        />
      ),
    },
  ];

  const Icon = FilterIcons[filterDefinition?.category as FilterCategory];

  return (
    <Card
      className={cn(sidebarFilterVariants({ variant, className }))}
      data-testid="sidebar-query-filter"
    >
      <Row className="items-center justify-between">
        <Row className="items-center gap-2">
          <Row className="items-center gap-1">
            {Icon && <Icon className="size-3" />}
            <label className="text-xs font-medium">
              {filterDefinition?.label ??
                capitalizeAll(
                  filter.key.replaceAll('.', ' ').replaceAll('_', ' '),
                )}
            </label>
            {shouldShowWildcard(filterDefinition?.type ?? '') &&
              filter.is_wildcarded && (
                <TooltipProvider key="negated">
                  <Tooltip>
                    <TooltipTrigger className="flex items-center">
                      <Badge
                        variant="default"
                        className="border-border h-4 rounded-full border px-1 py-0 text-[0.5rem] leading-none"
                      >
                        ✱
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>Filter is wilcarded</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
          </Row>
        </Row>
        <Row className="items-center gap-0">
          {actions
            .filter((action) => action.visible && action.Component)
            .map((action) => action.Component)}
        </Row>
      </Row>
      <Row className="items-center gap-1">
        {filter.is_negated && (
          <TooltipProvider key="negated">
            <Tooltip>
              <TooltipTrigger className="flex items-center">
                <Badge
                  variant="default"
                  className="border-border h-4 rounded-full border px-1 py-0 text-[0.65rem] leading-none"
                >
                  NOT
                </Badge>
              </TooltipTrigger>
              <TooltipContent>Filter is negated</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <p className="-mt-1 line-clamp-3 overflow-hidden text-sm text-inherit">
          {displayValue}
        </p>
      </Row>
      <EditFilterModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        filter={filter}
      />
    </Card>
  );
};

type FilterActionProps = {
  filterId: string;
  Icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
  >;
  action: () => void;
  tooltip: string;
};

const FilterAction = ({
  filterId,
  Icon,
  action,
  tooltip,
}: FilterActionProps) => {
  return (
    <TooltipProvider key={filterId}>
      <Tooltip>
        <TooltipTrigger
          className="p-1 opacity-60 hover:opacity-100"
          onClick={action}
        >
          <Icon className="size-3.5!" />
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const useGetConvertibleFiltersDefinitions = (id: string) => {
  const filterDefs = useQueryFiltersDefinitions();
  const filterDefinition = filterDefs[id];

  if (isNil(filterDefinition)) return [];

  const convertibleFilters =
    'convertible' in filterDefinition ? filterDefinition.convertible || [] : [];
  const sameTypeFilters =
    'entity' in filterDefinition && filterDefinition.entity
      ? toPairs(filterDefs)
          .filter(([key, value]) => {
            if (convertibleFilters.includes(key)) return false;
            return (
              'entity' in value && value.entity === filterDefinition.entity
            );
          })
          .map(([key]) => key)
      : [];

  return convertibleFilters
    .concat(sameTypeFilters)
    .map((key) => Object.assign({ key }, filterDefs[key]));
};
