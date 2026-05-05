/**
 * Back-compat shim. The canonical location is `model/kill-chain.ts`.
 *
 * This module is preserved while consumers migrate. New code should
 * import from the threats public barrel (`@/features/threats`).
 */

import { z } from 'zod';

import {
  KILL_CHAIN_PHASES,
  KILL_CHAIN_PHASES_KEYS,
  KILL_CHAIN_PHASES_KEYS_WITHOUT_POLICIES,
  KillChainPhase,
  killChainOptions as canonicalKillChainOptions,
  killChainWithoutPoliciesOptions as canonicalKillChainWithoutPoliciesOptions,
} from '../../model/kill-chain';

export type { KillChainPhase } from '../../model/kill-chain';

/** @deprecated Use KILL_CHAIN_PHASES from the threats barrel. */
export const killChainsConfig = Object.fromEntries(
  Object.entries(KILL_CHAIN_PHASES).map(([key, cfg]) => [
    key,
    { ...cfg, kc_step: cfg.step, shorthand: cfg.shorthand },
  ]),
) as Record<
  KillChainPhase,
  {
    name: string;
    shorthand?: string;
    kc_step: number;
    step: number;
    description: string;
  }
>;

export const killChainSchema = z.enum(
  KILL_CHAIN_PHASES_KEYS as [KillChainPhase],
);

/** @deprecated Use KillChainPhaseConfig from the threats barrel. */
export type KillChain = {
  name: string;
  kc_step: number;
  description: string;
};

export const KillChainKeys = KILL_CHAIN_PHASES_KEYS;
export const KillChainKeysWithoutPolicies =
  KILL_CHAIN_PHASES_KEYS_WITHOUT_POLICIES;

export const KillChainMap = {
  '-1': 'pre_condition',
  '0': 'reconnaissance',
  '1': 'weaponization',
  '2': 'delivery',
  '3': 'exploitation',
  '4': 'installation',
  '5': 'command_and_control',
  '6': 'actions_on_objectives',
} satisfies Record<number, KillChainPhase>;

export const killChainOptions = canonicalKillChainOptions;
export const killChainWithoutPoliciesOptions =
  canonicalKillChainWithoutPoliciesOptions;
