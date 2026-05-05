/**
 * Returns the qfilter clause that scopes events to outliers (novelty).
 * `undefined` when novelty is off.
 */
export const buildNoveltyQfilter = (novelty?: boolean): string | undefined =>
  novelty === true ? 'stamus_novel:true' : undefined;
