import { keys } from 'ramda';

import { FilterCategory } from '../../constants/query-filter.config';
import { getFilterDef } from '../../constants/query-filter.definition';
import { QueryFilterState } from '../../query-filter.model';

type SignatureFilters = {
  content?: string;
  not_in_content?: string;
  msg?: string;
  not_in_msg?: string;
  hits_min?: number;
  hits_max?: number;
};

export const buildSignatureFilters = (
  filters: QueryFilterState[],
): SignatureFilters | undefined => {
  const signatureFilters = filters
    .filter((f) => !f.is_suspended)
    .filter((f) => getFilterDef(f.key)?.category === FilterCategory.SIGNATURE);

  const appendCommaSeparated = (existing: string | undefined, value: string) =>
    existing ? `${existing},${value}` : value;

  const signatureParams = signatureFilters.reduce((acc, curr) => {
    switch (curr.key) {
      case 'content':
        if (curr.is_negated) {
          acc.not_in_content = appendCommaSeparated(
            acc.not_in_content,
            curr.value as string,
          );
        } else {
          acc.content = appendCommaSeparated(acc.content, curr.value as string);
        }
        break;
      case 'msg':
        if (curr.is_negated) {
          acc.not_in_msg = appendCommaSeparated(
            acc.not_in_msg,
            curr.value as string,
          );
        } else {
          acc.msg = appendCommaSeparated(acc.msg, curr.value as string);
        }
        break;
      case 'hits_min':
        acc.hits_min = curr.value as number;
        break;
      case 'hits_max':
        acc.hits_max = curr.value as number;
        break;
      default:
        break;
    }
    return acc;
  }, {} as SignatureFilters);

  return keys(signatureParams).length > 0 ? signatureParams : undefined;
};
