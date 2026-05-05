import { type AlertTagFlags } from '../model/filter-flags';

/**
 * Translates the active alert-tag flags into a single qfilter clause:
 *   `(alert.tag:"informational" OR alert.tag:"relevant" OR (NOT alert.tag:*))`
 *
 * When all three flags are off, returns `(alert.tag:"none")` — the
 * "match nothing" sentinel that excludes any tagged event. When the
 * input is null/undefined, returns `undefined`.
 */
export const buildAlertTagsQfilter = (
  flags?: AlertTagFlags | null,
): string | undefined => {
  if (!flags) return undefined;

  const clauses: string[] = [];
  if (flags.untagged) clauses.push('(NOT alert.tag:*)');
  if (flags.informational) clauses.push('alert.tag:"informational"');
  if (flags.relevant) clauses.push('alert.tag:"relevant"');

  if (!flags.untagged && !flags.informational && !flags.relevant) {
    clauses.push('alert.tag:"none"');
  }

  return clauses.length > 0 ? `(${clauses.join(' OR ')})` : undefined;
};
