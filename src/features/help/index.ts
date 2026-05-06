// model / domain types (slice-defined)
export type { HelpState } from './state/help.slice';

// hooks (cross-feature read/write surface)
export { useHelpState } from './state/help.slice';
export { useDisableHelp } from './hooks/use-disable-help';
