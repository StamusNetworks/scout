/**
 * Backward-compat shim. The canonical location is `api/threats.api.ts`.
 *
 * Cross-feature consumers should migrate to importing from the threats
 * barrel (`@/features/threats`) which exposes domain-shaped hooks. This
 * file remains until those consumers are migrated.
 */

export * from '../api/threats.api';
