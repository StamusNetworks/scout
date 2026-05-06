import { esEscape } from '@/common/lib/strings';

import {
  FilterCategory,
  HOST_ID_KEY_PREFIX,
} from '../definitions/query-filter.config';
import { getFilterDef } from '../definitions/query-filter.definitions';
import { type AlertTagFlags } from '../model/filter-flags';
import { type QueryFilterState } from '../model/query-filter';
import { type QFBuilder } from './qf-builder';

export type InvestigationFilter = {
  current: { key: string | undefined; value: string | undefined };
  stages: { key: string; values: string[] }[];
};

export type BuildEventsQfilterArgs = {
  queryFilters: QueryFilterState[];
  alertTags: AlertTagFlags | undefined;
  novelty: boolean;
  investigation: InvestigationFilter | undefined;
  filterExtension: QueryFilterState[] | string;
  qfBuilder: ReturnType<typeof QFBuilder>;
};

const isEventFilter = (f: QueryFilterState) => {
  const def = getFilterDef(f.key);
  return def
    ? def.category === FilterCategory.EVENT
    : !f.key.startsWith(HOST_ID_KEY_PREFIX);
};

const buildInvestigationExtension = (
  investigation: InvestigationFilter | undefined,
  qfBuilder: ReturnType<typeof QFBuilder>,
): QueryFilterState[] => {
  if (!investigation) return [];
  const out: QueryFilterState[] = [];
  if (investigation.current.key && investigation.current.value) {
    out.push(
      qfBuilder.createFilter(
        investigation.current.key,
        investigation.current.value,
      ),
    );
  }
  investigation.stages.forEach((stage) => {
    out.push(
      qfBuilder.createFilter(
        'es_filter',
        stage.values.map((v) => `${stage.key}:"${esEscape(v)}"`).join(' OR '),
      ),
    );
  });
  return out;
};

export const buildEventsQfilter = ({
  queryFilters,
  alertTags,
  novelty,
  investigation,
  filterExtension,
  qfBuilder,
}: BuildEventsQfilterArgs): string | undefined => {
  const activeEventFilters = queryFilters
    .filter(isEventFilter)
    .filter((f) => !f.isSuspended);

  if (typeof filterExtension === 'string') {
    const filterString = qfBuilder.toQFString(
      activeEventFilters,
      alertTags,
      novelty,
    );
    return `${filterString ? filterString + ' AND ' : ''} ${filterExtension}`;
  }

  const investigationExt = buildInvestigationExtension(
    investigation,
    qfBuilder,
  );

  return qfBuilder.toQFString(
    [
      ...activeEventFilters,
      ...[...investigationExt, ...filterExtension].filter(isEventFilter),
    ],
    alertTags,
    novelty,
  );
};
