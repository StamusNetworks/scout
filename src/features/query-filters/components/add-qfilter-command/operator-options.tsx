import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/common/design-system/atoms/ui/command';
import { useAppDispatch, useAppSelector } from '@/store/store';

import {
  isNegatable,
  isWildcardable,
} from '../../definitions/query-filter.definitions';
import { useQueryFilterDefinition } from '../../hooks/use-filters-definitions';
import { selectFilterCommandFilter } from '../../state/add-qfilter-command.selectors';
import {
  setNegated,
  setWildcarded,
} from '../../state/add-qfilter-command.slice';

export const OperatorOptions = () => {
  const dispatch = useAppDispatch();
  const filter = useAppSelector(selectFilterCommandFilter);
  const definition = useQueryFilterDefinition(filter!);
  const wildcardable = isWildcardable(definition!.type!);

  const handleSelect = ({
    negated,
    wildcarded,
  }: {
    negated: boolean;
    wildcarded: boolean;
  }) => {
    dispatch(setNegated(negated));
    dispatch(setWildcarded(wildcarded));
  };
  return (
    <>
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandGroup heading="Operator">
        <CommandItem
          value="is"
          onSelect={() => handleSelect({ negated: false, wildcarded: false })}
        >
          is
        </CommandItem>
        <CommandItem
          value="is not"
          onSelect={() => handleSelect({ negated: true, wildcarded: false })}
          disabled={!isNegatable(filter!)}
        >
          is not
        </CommandItem>
        <CommandItem
          value="is wildcard"
          onSelect={() => handleSelect({ negated: false, wildcarded: true })}
          disabled={!wildcardable}
        >
          is (wildcard)
        </CommandItem>
        <CommandItem
          value="is not wildcard"
          onSelect={() => handleSelect({ negated: true, wildcarded: true })}
          disabled={!isNegatable(filter!) || !wildcardable}
        >
          is not (wildcard)
        </CommandItem>
      </CommandGroup>
    </>
  );
};
