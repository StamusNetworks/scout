import { useMemo } from 'react';

import { esEscape } from '@/common/lib/strings';
import { selectInvestigationFilter } from '@/features/investigation/investigation.slice';
import { useAppSelector } from '@/store/store';

import { useQFBuilder } from '../../hooks/use-qf-builder';
import { QueryFilterState } from '../../query-filter.model';
import { useQueryFiltersRepository } from '../../query-filters.repository';
import { selectQueryFilters } from '../../query-filters.selectors';

export function buildHostIdQFilter(
  queryFilters: ReturnType<typeof selectQueryFilters>,
  es_keyword?: string,
) {
  const qfilterHost: string[] = [];
  let fSuffix = '.raw';

  if (es_keyword) {
    fSuffix = `.${es_keyword}`;
  }

  const filters = queryFilters.filter((f) => f.is_suspended !== true);
  filters.forEach((filter) => {
    let fPrefix = '';

    if (filter.is_negated) {
      fPrefix = 'NOT ';
    }

    if (filter.key.substring(0, 8) === 'host_id.') {
      const hostFilterName = filter.key;

      if (filter.key === 'host_id.ip') {
        qfilterHost.push(`${fPrefix}ip:"${esEscape(String(filter.value))}"`);
      } else if (filter.key.indexOf('host_id.roles.name') > -1) {
        if (filter.value === 'unclassified') {
          qfilterHost.push(`NOT host_id.roles.name: *`);
        } else {
          qfilterHost.push(
            `${fPrefix}host_id.roles.name.raw:"${esEscape(String(filter.value))}"`,
          );
        }
      } else if (hostFilterName.substr(hostFilterName.length - 4) === '.min') {
        const filterName = hostFilterName.substr(0, hostFilterName.length - 4);
        if (typeof filter.value !== 'string' && filter.value > 0) {
          // Remove the filter in case value === 0, since in this case ES will only if the field is present
          qfilterHost.push(`${fPrefix}${filterName}:>=${filter.value}`);
        } else if (filter.is_negated) {
          // Make a query that returns nothing if the filter is negated
          qfilterHost.push(`${filterName}:<-1`);
        }
      } else if (hostFilterName.substr(hostFilterName.length - 4) === '.max') {
        const filterName = hostFilterName.substr(0, hostFilterName.length - 4);
        if (filter.value === 0) {
          // Field is not present when count is 0
          qfilterHost.push(
            `${filter.is_negated ? '' : 'NOT '} _exists_:${filterName}`,
          );
        } else {
          qfilterHost.push(
            `(${fPrefix}(${filterName}:<=${filter.value} OR (NOT _exists_:${filterName})))`,
          );
        }
      } else if (filter.key === 'host_id.in_home_net') {
        const value = esEscape(filter.value.toString());
        qfilterHost.push(`${fPrefix}${hostFilterName}:${value}`);
      } else if (typeof filter.value === 'string' && !filter.is_wildcarded) {
        const value = esEscape(filter.value);
        qfilterHost.push(`${fPrefix}${hostFilterName}${fSuffix}:"${value}"`);
      } else {
        const value = esEscape(filter.value.toString());
        qfilterHost.push(`${fPrefix}${hostFilterName}:${value}`);
      }
    }
  });

  return qfilterHost.length ? qfilterHost.join(' AND ') : undefined;
}

export function useBuildHostIdQfilter(
  extra?: QueryFilterState[],
  blacklist?: string[],
): string | undefined {
  const repo = useQueryFiltersRepository();
  const qfBuilder = useQFBuilder();
  const investigation = useAppSelector(selectInvestigationFilter);

  return useMemo(() => {
    const queryFilters = repo.getAll();
    const filters = [...queryFilters, ...(extra || [])];
    if (investigation?.current.key && investigation?.current.value) {
      filters.push(
        qfBuilder.createFilter(
          investigation.current.key,
          investigation.current.value,
        ),
      );
    }
    const filtered = blacklist
      ? filters.filter((f) => !blacklist.includes(f.key))
      : filters;
    return qfBuilder.toHostIdQFString(filtered);
  }, [repo, qfBuilder, investigation, extra, blacklist]);
}
