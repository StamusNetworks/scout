import { toPairs, values } from 'ramda';
import { useMemo } from 'react';

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
  const { negated, search } = useAppSelector(selectFilterCommand);

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

  return (
    <>
      <CommandEmpty>No filters found.</CommandEmpty>
      {search.length > 0 && (
        <CommandGroup heading="Frequently used filters">
          {PreferredOptions.map((o) => (
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
        </CommandGroup>
      )}
      {values(FilterCategory).map((category) => (
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
  'src_ip',
  'flow.src_ip',
  'dest_ip',
  'flow.dest_ip',
  'port',
  'src_port',
  'dest_port',
];
export const PreferredOptions = preferredKeys.map((k) => ({
  label: QueryFiltersRecord[k].label,
  value: k,
}));
