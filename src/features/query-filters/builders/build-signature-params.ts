import { keys } from 'ramda';

import { FilterCategory } from '../definitions/query-filter.config';
import { getFilterDef } from '../definitions/query-filter.definitions';
import { QueryFilterState } from '../model/query-filter';

export type SignatureParams = {
  content?: string;
  not_in_content?: string;
  msg?: string;
  not_in_msg?: string;
  hits_min?: number;
  hits_max?: number;
};

/**
 * Reduces signature-category filters into the wire param object the
 * detection-methods endpoints expect (`content`, `msg`, `hits_min`,
 * `hits_max`, with `not_in_*` variants for negated content/msg).
 * Returns `undefined` when no signature filters are active.
 */
export const buildSignatureParams = (
  filters: QueryFilterState[],
): SignatureParams | undefined => {
  const signatureFilters = filters
    .filter((f) => !f.isSuspended)
    .filter((f) => getFilterDef(f.key)?.category === FilterCategory.SIGNATURE);

  const appendCommaSeparated = (existing: string | undefined, value: string) =>
    existing ? `${existing},${value}` : value;

  const signatureParams = signatureFilters.reduce((acc, curr) => {
    switch (curr.key) {
      case 'content':
        if (curr.isNegated) {
          acc.not_in_content = appendCommaSeparated(
            acc.not_in_content,
            curr.value as string,
          );
        } else {
          acc.content = appendCommaSeparated(acc.content, curr.value as string);
        }
        break;
      case 'msg':
        if (curr.isNegated) {
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
  }, {} as SignatureParams);

  return keys(signatureParams).length > 0 ? signatureParams : undefined;
};
