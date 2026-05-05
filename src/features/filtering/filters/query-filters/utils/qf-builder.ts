import { v4 as uuidv4 } from 'uuid';

import { esEscape } from '@/common/lib/strings';

import { FilterCategory } from '../constants/query-filter.config';
import { getFilterDef } from '../constants/query-filter.definition';
import { AlertTagFlags } from '../filter-flags.model';
import {
  QueryFilterDefinition,
  QueryFilterState,
  QueryFilterType,
  QueryMatching,
} from '../query-filter.model';

type CombinedDef =
  | QueryFilterDefinition
  | { type: QueryFilterType }
  | ({ type: QueryFilterType } & QueryFilterDefinition);

export function QFBuilder(
  definitions: Record<string, CombinedDef> = {},
  suffix: string = 'raw',
) {
  function toQFString(
    queryFilters?: Omit<QueryFilterState, 'id'>[],
    tagsFilters?: AlertTagFlags | null,
    novelty?: boolean,
  ) {
    const eventFilters = queryFilters?.filter(
      (f) =>
        getFilterDef(f.key)?.category === FilterCategory.EVENT ||
        (getFilterDef(f.key) === undefined && !f.key.startsWith('host_id.')),
    );
    const qfilter = filtersToStringArray(eventFilters, definitions, suffix);
    // Add Alert tags filters
    const tagsQfilter = getTagsFilters(tagsFilters);
    if (tagsQfilter) {
      qfilter.push(tagsQfilter);
    }
    // Add Novelty (outliers) filter
    if (novelty === true) {
      qfilter.push('stamus_novel:true');
    }
    // Join everything and return
    return qfilter.length ? qfilter.join(' AND ') : undefined;
  }

  function toHostIdQFString(queryFilters?: Omit<QueryFilterState, 'id'>[]) {
    if (!queryFilters) return undefined;
    const hostIdFilters = queryFilters?.filter(
      (f) => !f.is_suspended && f.key.startsWith('host_id.'),
    );
    return filtersToStringArray(hostIdFilters, definitions, suffix).join(
      ' AND ',
    );
  }

  const alwaysWildcarded = new Set(['content', 'msg']);

  function createFilter(
    key: string,
    value: string | number,
    options?: {
      role?: string;
      is_negated?: boolean;
      is_suspended?: boolean;
      is_wildcarded?: boolean;
    },
  ): QueryFilterState {
    return {
      id: uuidv4(),
      key,
      value,
      role: options?.role,
      is_suspended: options?.is_suspended ?? false,
      is_negated: options?.is_negated ?? false,
      is_wildcarded: alwaysWildcarded.has(key) || !!options?.is_wildcarded,
    };
  }
  return {
    toQFString,
    toHostIdQFString,
    createFilter,
  };
}

function getTagsFilters(tagsFilters?: AlertTagFlags | null) {
  const tagsQfilter = [];
  if (tagsFilters) {
    Object.entries(tagsFilters).forEach(([key, value]) => {
      if (key === 'untagged' && value === true) {
        tagsQfilter.push('(NOT alert.tag:*)');
      }
      if (key === 'informational' && value === true) {
        tagsQfilter.push('alert.tag:"informational"');
      }
      if (key === 'relevant' && value === true) {
        tagsQfilter.push('alert.tag:"relevant"');
      }
    });
    if (
      tagsFilters.untagged === false &&
      tagsFilters.informational === false &&
      tagsFilters.relevant === false
    ) {
      tagsQfilter.push('alert.tag:"none"');
    }
  }
  return tagsQfilter.length !== 0 ? `(${tagsQfilter.join(' OR ')})` : '';
}

const getStringifierFn = (definition: CombinedDef, is_wildcarded: boolean) => {
  const matchType = is_wildcarded
    ? 'word'
    : QueryFilterType[definition.type!]?.match[0] || 'exact';

  const stringifierFn =
    'toQFString' in definition && definition?.toQFString
      ? definition.toQFString
      : QueryMatching[matchType].toQFString;

  return stringifierFn;
};

const getEscapedValue = (
  definition: CombinedDef,
  value: string | number | undefined,
) => {
  const escapedValue =
    'toQFString' in definition && definition?.toQFString
      ? value || ''
      : esEscape(value?.toString() || '');
  return escapedValue;
};

const filtersToStringArray = (
  queryFilters: Omit<QueryFilterState, 'id'>[] | undefined,
  definitions: Record<string, CombinedDef>,
  suffix: string = 'raw',
) => {
  const qfilter: string[] = [];

  queryFilters?.forEach((filterState) => {
    const filterDef = definitions[filterState.key] ?? {};
    const stringifierFn = getStringifierFn(
      filterDef,
      filterState.is_wildcarded,
    );
    const escapedValue = getEscapedValue(filterDef, filterState.value);
    qfilter.push(
      stringifierFn({
        key: filterState.key,
        value: escapedValue,
        keyword: suffix,
        negated: filterState.is_negated,
        wildcarded: filterState.is_wildcarded,
      }),
    );
  });

  return qfilter;
};
