import { ActiveThreatAssets } from './active-threat';
import { ThreatFamily } from './threat-family';

export type ActiveThreatFamily = ThreatFamily & {
  maxSeverity: number;
  malwareCount: number;
  assets: ActiveThreatAssets;
};
