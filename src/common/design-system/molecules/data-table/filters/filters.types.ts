import { ColumnDef } from '@tanstack/react-table';

import { FacetedFilterOption } from './command-filter-multiple';
import { PillFilterOption } from './pills-filter';

type TextFilter = {
  id: string;
  type: 'text';
  placeholder: string;
};

type CommandFilterMultiple = {
  type: 'command-multiple';
  id: string;
  title: string;
  options: FacetedFilterOption[];
};

type CommandFilterSingle = {
  type: 'command-single';
  id: string;
  title: string;
  options: FacetedFilterOption[];
};

type PillsFilter = {
  type: 'pills';
  id: string;
  options: PillFilterOption[];
  defaultValue: string;
};

type CheckboxFilter = {
  type: 'checkbox';
  id: string;
  title: string;
  enabledValue: string;
  disabledValue: string;
  defaultValue: string;
};

export type Filter =
  | TextFilter
  | CommandFilterMultiple
  | CommandFilterSingle
  | PillsFilter
  | CheckboxFilter;

export type CustomColumnDef<T> = ColumnDef<T> & {
  colKey?: string;
  filters?: Filter[];
  visible?: boolean;
};
