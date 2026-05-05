import { v4 as uuidv4 } from 'uuid';

import { esEscape } from '@/common/lib/strings';

import { buildAlertTagsQfilter } from '../builders/build-alert-tags-qfilter';
import { buildNoveltyQfilter } from '../builders/build-novelty-qfilter';
import {
  FilterCategory,
  HOST_ID_KEY_PREFIX,
} from '../definitions/query-filter.config';
import { getFilterDef } from '../definitions/query-filter.definitions';
import { AlertTagFlags } from '../model/filter-flags';
import {
  QueryFilterDefinition,
  QueryFilterState,
  QueryFilterType,
  QueryMatching,
} from '../model/query-filter';

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
    alertTags?: AlertTagFlags | null,
    novelty?: boolean,
  ) {
    const eventFilters = queryFilters?.filter(
      (f) =>
        getFilterDef(f.key)?.category === FilterCategory.EVENT ||
        (getFilterDef(f.key) === undefined &&
          !f.key.startsWith(HOST_ID_KEY_PREFIX)),
    );
    const qfilter = filtersToStringArray(eventFilters, definitions, suffix);

    const alertTagsClause = buildAlertTagsQfilter(alertTags);
    if (alertTagsClause) qfilter.push(alertTagsClause);

    const noveltyClause = buildNoveltyQfilter(novelty);
    if (noveltyClause) qfilter.push(noveltyClause);

    return qfilter.length ? qfilter.join(' AND ') : undefined;
  }

  function toHostIdQFString(queryFilters?: Omit<QueryFilterState, 'id'>[]) {
    if (!queryFilters) return undefined;
    const hostIdFilters = queryFilters?.filter(
      (f) => !f.isSuspended && f.key.startsWith(HOST_ID_KEY_PREFIX),
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
      isNegated?: boolean;
      isSuspended?: boolean;
      isWildcarded?: boolean;
    },
  ): QueryFilterState {
    return {
      id: uuidv4(),
      key,
      value,
      role: options?.role,
      isSuspended: options?.isSuspended ?? false,
      isNegated: options?.isNegated ?? false,
      isWildcarded: alwaysWildcarded.has(key) || !!options?.isWildcarded,
    };
  }
  return {
    toQFString,
    toHostIdQFString,
    createFilter,
  };
}

const getStringifierFn = (definition: CombinedDef, isWildcarded: boolean) => {
  const matchType = isWildcarded
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
    const stringifierFn = getStringifierFn(filterDef, filterState.isWildcarded);
    const escapedValue = getEscapedValue(filterDef, filterState.value);
    qfilter.push(
      stringifierFn({
        key: filterState.key,
        value: escapedValue,
        keyword: suffix,
        negated: filterState.isNegated,
        wildcarded: filterState.isWildcarded,
      }),
    );
  });

  return qfilter;
};
