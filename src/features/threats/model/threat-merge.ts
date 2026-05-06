import type { Threat, ThreatKind } from './threat';

export type ThreatCollection = {
  ids: number[];
  entities: Record<number, Threat>;
};

export const mergeThreatCollections = (
  primary: ThreatCollection | undefined,
  secondary: ThreatCollection | undefined,
): ThreatCollection => ({
  ids: [...(primary?.ids ?? []), ...(secondary?.ids ?? [])],
  entities: { ...primary?.entities, ...secondary?.entities },
});

export const filterThreatsByKind = (
  collection: ThreatCollection,
  kind: ThreatKind,
): Threat[] =>
  Object.values(collection.entities).filter(
    (t): t is Threat => t !== undefined && t.kind === kind,
  );
