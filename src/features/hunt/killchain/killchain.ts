import { keys, toPairs } from 'ramda';
import { z } from 'zod';

export const killChainsConfig = {
  reconnaissance: {
    name: 'Reconnaissance',
    shorthand: undefined,
    kc_step: 1,
    description:
      "Reconnaissance is the initial phase of an investigation, where the investigator gathers information about the target. This phase is typically focused on gathering intelligence about the target's infrastructure, network, and systems.",
  },
  weaponization: {
    name: 'Weaponization',
    shorthand: undefined,
    kc_step: 2,
    description:
      "Weaponization is the process of developing and implementing a weapon or tool to carry out an attack. This phase involves identifying the target's vulnerabilities and developing a suitable weapon to exploit them.",
  },
  delivery: {
    name: 'Delivery',
    shorthand: undefined,
    kc_step: 3,
    description:
      "Delivery is the phase where the attacker delivers the weapon or tool to the target. This phase involves coordinating with the target's defenses and ensuring that the weapon is delivered in a way that minimizes detection.",
  },
  exploitation: {
    name: 'Exploitation',
    shorthand: undefined,
    kc_step: 4,
    description:
      'Exploitation is the phase where the attacker takes advantage of the vulnerabilities identified during the weaponization phase to carry out the attack. This phase involves executing the weapon or tool on the target and achieving the desired outcome.',
  },
  installation: {
    name: 'Installation',
    shorthand: undefined,
    kc_step: 5,
    description:
      "Installation is the phase where the attacker installs the weapon or tool on the target's system. This phase involves identifying the target's vulnerabilities and developing a suitable weapon to exploit them.",
  },
  command_and_control: {
    name: 'Command and Control',
    shorthand: 'Cmd and Ctrl',
    kc_step: 6,
    description:
      "Command and Control is the phase where the attacker establishes a connection with the target's command and control infrastructure. This phase involves identifying the target's vulnerabilities and developing a suitable weapon to exploit them.",
  },
  actions_on_objectives: {
    name: 'Actions on Objectives',
    shorthand: 'Actions on Obj.',
    kc_step: 7,
    description:
      'Actions on Objectives is the phase where the attacker takes advantage of the vulnerabilities identified during the weaponization phase to carry out the attack. This phase involves executing the weapon or tool on the target and achieving the desired outcome.',
  },
  pre_condition: {
    name: 'Policy Violation',
    shorthand: undefined,
    kc_step: -1,
    description:
      "Policy Violation is the phase where the attacker establishes a connection with the target's command and control infrastructure. This phase involves identifying the target's vulnerabilities and developing a suitable weapon to exploit them.",
  },
} as const;

export const killChainSchema = z.enum(
  keys(killChainsConfig) as [keyof typeof killChainsConfig],
);

export type KillChain = {
  name: string;
  kc_step: number;
  description: string;
};

export type KillChainPhase = keyof typeof killChainsConfig;

export const KillChainKeys = Object.keys(killChainsConfig) as KillChainPhase[];
export const KillChainKeysWithoutPolicies = KillChainKeys.slice(0, -1);

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

export const killChainOptions = toPairs(killChainsConfig).map(
  ([key, value]) => ({
    label: value.name,
    value: key,
  }),
);

export const killChainWithoutPoliciesOptions = toPairs(killChainsConfig)
  .filter(([key]) => key !== 'pre_condition')
  .map(([key, value]) => ({
    label: value.name,
    value: key,
  }));
