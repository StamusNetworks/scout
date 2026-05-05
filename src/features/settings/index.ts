/**
 * Public API for the settings bounded context. Owns the appliance's
 * server-side configuration: system settings, global settings, branding
 * (Scirius context), probes, sources, and the derived "enterprise"
 * license flag.
 *
 * Tenant-list and ES-mapping endpoints, formerly co-located here, now
 * live in the `tenancy` and `filtering` contexts respectively.
 */

export type { SystemSettings, License } from './model/system-settings';
export type { GlobalSettings } from './model/global-settings';
export type { SciriusContext } from './model/scirius-context';
export type { Probe } from './model/probe';
export type { Source } from './model/source';

export { useSystemSettings } from './hooks/use-system-settings';
export { useGlobalSettings } from './hooks/use-global-settings';
export { useSciriusContext } from './hooks/use-scirius-context';
export { useProbes } from './hooks/use-probes';
export { useSources } from './hooks/use-sources';
export { useIsEnterprise } from './hooks/use-is-enterprise';
