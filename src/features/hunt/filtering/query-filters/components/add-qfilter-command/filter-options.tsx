import { toPairs } from 'ramda';
import { useMemo } from 'react';
import { useLocation } from '@tanstack/react-router';

import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/common/design-system/atoms/ui/command';
import { capitalizeAll } from '@/common/lib/strings';
import { useAppDispatch, useAppSelector } from '@/store/store';

import { FilterCategory } from '../../constants/query-filter.config';
import {
  isNegatable,
  QueryFiltersRecord,
} from '../../constants/query-filter.definition';
import { useQueryFiltersDefinitions } from '../../hooks/use-filters-definitions';
import { selectFilterCommand } from './add-qfilter-command.selectors';
import { setFilter } from './add-qfilter-command.slice';

export const FilterOptions = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { negated } = useAppSelector(selectFilterCommand);

  const filters = useQueryFiltersDefinitions();
  const definitions = useMemo(() => {
    if (!filters) return [];
    return toPairs(filters)
      .filter(([key]) => (negated ? isNegatable(key) : true))
      .map(([key, f]) => ({
        label:
          ('label' in f && f.label) || capitalizeAll(key.split('.').join(' ')),
        value: key,
        category:
          ('category' in f && f.category) ||
          (key.startsWith('host_id')
            ? FilterCategory.HOST
            : FilterCategory.EVENT),
      }));
  }, [filters, negated]);

  const categories = useMemo(() => {
    if (
      location.pathname.includes('/attack-surface') ||
      location.pathname.includes('/hosts')
    ) {
      return [
        FilterCategory.HOST,
        FilterCategory.EVENT,
        FilterCategory.SIGNATURE,
        FilterCategory.HISTORY,
      ];
    }
    if (location.pathname.includes('/detection-methods')) {
      return [
        FilterCategory.SIGNATURE,
        FilterCategory.EVENT,
        FilterCategory.HOST,
        FilterCategory.HISTORY,
      ];
    }
    return [
      FilterCategory.EVENT,
      FilterCategory.HOST,
      FilterCategory.SIGNATURE,
      FilterCategory.HISTORY,
    ];
  }, [location.pathname]);

  return (
    <>
      <CommandEmpty>No filters found.</CommandEmpty>
      <CommandGroup heading="Frequently used filters">
        {PreferredOptions.filter((o) => o.value !== 'es_filter').map((o) => (
          <CommandItem
            key={o.value}
            value={`${o.value}-${o.label}`}
            onSelect={() => dispatch(setFilter(o.value))}
            className="justify-between"
          >
            <span>{o.label}</span>
            <span className="text-muted-foreground">{o.value}</span>
          </CommandItem>
        ))}
        <CommandItem
          key="es_filter"
          value="es_filter-ES Filter raw search query elastic"
          onSelect={() => dispatch(setFilter('es_filter'))}
          className="justify-between"
        >
          <span>ES Filter</span>
          <span className="text-muted-foreground">es_filter</span>
        </CommandItem>
      </CommandGroup>
      {categories.map((category) => (
        <CommandGroup
          key={category}
          heading={`${capitalizeAll(category)} filters`}
        >
          {definitions
            .filter(
              (f) =>
                f.category === category && !preferredKeys.includes(f.value),
            )
            .map((f) => (
              <CommandItem
                key={f.value}
                value={`${f.value}-${f.label}`}
                onSelect={() => dispatch(setFilter(f.value))}
                className="justify-between"
              >
                <span>{f.label}</span>
                <span className="text-muted-foreground">{f.value}</span>
              </CommandItem>
            ))}
        </CommandGroup>
      ))}
    </>
  );
};

const preferredKeys = [
  'ip',
  'flow.src_ip',
  'flow.dest_ip',
  'src_ip',
  'dest_ip',
  'port',
  'host_id.services.port',
  'flow.src_port',
  'flow.dest_port',
  'src_port',
  'dest_port',
  'es_filter',
];
export const PreferredOptions = preferredKeys.map((k) => ({
  label: QueryFiltersRecord[k].label,
  value: k,
}));
