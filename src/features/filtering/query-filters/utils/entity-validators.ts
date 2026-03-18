import { isIP } from '@/common/lib/ips';
import { isEmail } from '@/common/lib/strings';

import { FilterType } from '../constants/query-filter.config';
import type { FilterType as FilterTypeType } from '../model/query-filter';

// Validators for entity types that need runtime resolution.
// Types NOT in this map always pass (backward compatible).
const entityValidators: Partial<Record<string, (value: string) => boolean>> = {
  [FilterType.IP]: (v) => isIP(v),
  [FilterType.EMAIL]: (v) => isEmail(v),
  [FilterType.DOMAIN]: (v) => !isIP(v) && !isEmail(v),
  [FilterType.USERNAME]: (v) => !isIP(v) && !isEmail(v),
};

/**
 * Given a filter definition's entity and a runtime value,
 * returns the validated entity type(s) to use for deeplink matching.
 *
 * - Single entity: returned as-is (no runtime validation)
 * - Array entity: filtered to only include types whose validator passes
 *   (types without a validator always pass)
 */
export function resolveEntityTypes(
  entity:
    | FilterTypeType[keyof FilterTypeType]
    | FilterTypeType[keyof FilterTypeType][]
    | undefined,
  value: string | number,
):
  | FilterTypeType[keyof FilterTypeType]
  | FilterTypeType[keyof FilterTypeType][]
  | undefined {
  if (entity === undefined) return undefined;
  if (!Array.isArray(entity)) return entity;

  const str = String(value);
  return entity.filter((type) => {
    const validator = entityValidators[type];
    return validator ? validator(str) : true;
  });
}
