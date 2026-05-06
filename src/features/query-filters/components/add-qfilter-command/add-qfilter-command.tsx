import { Command as CommandPrimitive } from 'cmdk';
import { Asterisk } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  CommandDialog,
  CommandList,
} from '@/common/design-system/atoms/ui/command';
import { cn } from '@/common/lib/utils';
import { selectIsModalOpen, setOpenModal } from '@/features/app-shell/state/ui-state.slice';
import { useAppDispatch, useAppSelector } from '@/store/store';

import { getFilterDef } from '../../definitions/query-filter.definitions';
import { selectFilterCommand } from '../../state/add-qfilter-command.selectors';
import {
  resetCommand,
  resetStep,
  setSearch,
  setStep,
} from '../../state/add-qfilter-command.slice';
import { FilterInput } from '../../utils/filter-mapper';
import { FilterOptions } from './filter-options';
import { OperatorOptions } from './operator-options';
import { ValuesOptions } from './values-options';

const handleItemsFiltering = (value: string, search: string) => {
  const terms = search.split(' ');
  if (
    terms.every(
      (term) =>
        value.toLowerCase().includes(term.toLowerCase()) ||
        term
          .split('.')
          .every((t) => value.toLowerCase().includes(t.toLowerCase())),
    )
  )
    return 1;
  if (
    terms.some(
      (term) =>
        value.toLowerCase().includes(term.toLowerCase()) ||
        term
          .split('.')
          .some((t) => value.toLowerCase().includes(t.toLowerCase())),
    )
  )
    return 0;
  return -1;
};

export const AddQfilterCommand = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectIsModalOpen('addFilterCommand'));
  const { step, filter, search, negated, wildcarded } =
    useAppSelector(selectFilterCommand);

  const filterDefinition = getFilterDef(filter || '');

  useEffect(() => {
    if (!open) dispatch(resetCommand());
  }, [open, dispatch]);

  useEffect(() => {
    const input = inputRef?.current;
    const handleResetStep = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' && inputRef?.current?.value === '') {
        dispatch(resetStep());
      }
    };
    input?.addEventListener('keydown', handleResetStep);
    return () => {
      input?.removeEventListener('keydown', handleResetStep);
    };
  });

  useEffect(() => {
    const input = inputRef?.current;
    const handleWildcardRestriction = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        return false;
      }
    };
    if (wildcarded && step === 2)
      input?.addEventListener('keydown', handleWildcardRestriction);
    return () => {
      input?.removeEventListener('keydown', handleWildcardRestriction);
    };
  }, [wildcarded, step]);

  return (
    <CommandDialog
      label="Add filter"
      open={open}
      onOpenChange={() => dispatch(setOpenModal('addFilterCommand'))}
      filter={handleItemsFiltering}
    >
      <Row className="shadow-border items-center justify-between gap-3 px-3 shadow-[0_0_0_1px]">
        <Row className="grow items-center gap-1">
          {step > 0 && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => dispatch(setStep(0))}
            >
              {filterDefinition?.label || filter}
            </Button>
          )}
          {step > 1 && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => dispatch(setStep(1))}
            >
              {negated === true ? 'NOT' : 'IS'}
              {wildcarded === true && <Asterisk />}
            </Button>
          )}
          <CommandPrimitive.Input
            className={cn(
              'placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50 [button+*]:ml-1',
            )}
            value={search}
            onValueChange={(value) => dispatch(setSearch(value))}
            ref={inputRef}
            placeholder="Type in to search"
          />
        </Row>
      </Row>
      <CommandList className="max-h-[450px]">
        {step === 0 && <FilterOptions />}
        {step === 1 && <OperatorOptions />}
        {step === 2 && <ValuesOptions />}
      </CommandList>
    </CommandDialog>
  );
};

export const handleSubmit = (
  createFilter: (input: FilterInput) => void,
  closeModal: () => void,
  key: string,
  value: string | number,
  negated: boolean,
  wildcarded: boolean,
) => {
  createFilter({
    key: key!,
    value: value,
    options: { isNegated: negated, isWildcarded: wildcarded },
  });
  closeModal();
};
