import { ThreatKind } from './threat';

export type ThreatFamily = {
  id: number;
  familyId: number;
  kind: ThreatKind;
  name: string;
  description: string;
  version: number;
  icon: string;
  /** Reference links as nested arrays (legacy shape). */
  links: string[][];
};
