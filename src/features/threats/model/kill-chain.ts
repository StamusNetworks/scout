/**
 * The Kill Chain domain model. Phase keys are the industry-standard
 * Lockheed Martin Cyber Kill Chain steps (snake_case is preserved as
 * canonical taxonomy, not a wire-shape leak).
 */

import { z } from 'zod';

export type KillChainPhase =
  | 'reconnaissance'
  | 'weaponization'
  | 'delivery'
  | 'exploitation'
  | 'installation'
  | 'command_and_control'
  | 'actions_on_objectives'
  | 'pre_condition';

export type KillChainPhaseConfig = {
  name: string;
  shorthand?: string;
  step: number;
  description: string;
};

export const KILL_CHAIN_PHASES: Record<KillChainPhase, KillChainPhaseConfig> = {
  reconnaissance: {
    name: 'Reconnaissance',
    step: 1,
    description:
      "Reconnaissance is the initial phase of an investigation, where the investigator gathers information about the target. This phase is typically focused on gathering intelligence about the target's infrastructure, network, and systems.",
  },
  weaponization: {
    name: 'Weaponization',
    step: 2,
    description:
      "Weaponization is the process of developing and implementing a weapon or tool to carry out an attack. This phase involves identifying the target's vulnerabilities and developing a suitable weapon to exploit them.",
  },
  delivery: {
    name: 'Delivery',
    step: 3,
    description:
      "Delivery is the phase where the attacker delivers the weapon or tool to the target. This phase involves coordinating with the target's defenses and ensuring that the weapon is delivered in a way that minimizes detection.",
  },
  exploitation: {
    name: 'Exploitation',
    step: 4,
    description:
      'Exploitation is the phase where the attacker takes advantage of the vulnerabilities identified during the weaponization phase to carry out the attack. This phase involves executing the weapon or tool on the target and achieving the desired outcome.',
  },
  installation: {
    name: 'Installation',
    step: 5,
    description:
      "Installation is the phase where the attacker installs the weapon or tool on the target's system. This phase involves identifying the target's vulnerabilities and developing a suitable weapon to exploit them.",
  },
  command_and_control: {
    name: 'Command and Control',
    shorthand: 'Cmd and Ctrl',
    step: 6,
    description:
      "Command and Control is the phase where the attacker establishes a connection with the target's command and control infrastructure. This phase involves identifying the target's vulnerabilities and developing a suitable weapon to exploit them.",
  },
  actions_on_objectives: {
    name: 'Actions on Objectives',
    shorthand: 'Actions on Obj.',
    step: 7,
    description:
      'Actions on Objectives is the phase where the attacker takes advantage of the vulnerabilities identified during the weaponization phase to carry out the attack. This phase involves executing the weapon or tool on the target and achieving the desired outcome.',
  },
  pre_condition: {
    name: 'Policy Violation',
    step: -1,
    description:
      "Policy Violation is the phase where the attacker establishes a connection with the target's command and control infrastructure. This phase involves identifying the target's vulnerabilities and developing a suitable weapon to exploit them.",
  },
};

export const KILL_CHAIN_PHASES_KEYS = Object.keys(
  KILL_CHAIN_PHASES,
) as KillChainPhase[];

export const killChainPhaseSchema = z.enum(
  KILL_CHAIN_PHASES_KEYS as [KillChainPhase, ...KillChainPhase[]],
);

export const KILL_CHAIN_PHASES_KEYS_WITHOUT_POLICIES =
  KILL_CHAIN_PHASES_KEYS.slice(0, -1);

/**
 * Mapping from numeric kill-chain step to phase key. Some endpoints
 * return numeric steps (older shape) — `phaseFromStep` resolves them.
 */
export const STEP_TO_PHASE: Record<number, KillChainPhase> = {
  '-1': 'pre_condition',
  '0': 'reconnaissance',
  '1': 'weaponization',
  '2': 'delivery',
  '3': 'exploitation',
  '4': 'installation',
  '5': 'command_and_control',
  '6': 'actions_on_objectives',
};

export const phaseFromStep = (step: number): KillChainPhase | undefined =>
  STEP_TO_PHASE[step];

export const killChainOptions = KILL_CHAIN_PHASES_KEYS.map((key) => ({
  label: KILL_CHAIN_PHASES[key].name,
  value: key,
}));

export const killChainWithoutPoliciesOptions = killChainOptions.filter(
  ({ value }) => value !== 'pre_condition',
);

/** Counts of impacted assets indexed by kill chain phase. */
export type KillChainCountersData = Partial<Record<KillChainPhase, number>>;
