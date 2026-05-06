import type { Threat } from './threat';

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
