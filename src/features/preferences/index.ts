// model / domain types (slice-defined)
export type {
  ColorBlindness,
  EventDetailDefaultTab,
  ExportAction,
  TimeDisplay,
} from './state/preferences.slice';

// hooks (cross-feature read surface)
export { useAutoOpenSidebarOnNavigation } from './hooks/use-auto-open-sidebar-on-navigation';
export { useColorBlindness } from './hooks/use-color-blindness';
export { useDefaultEventDetailTab } from './hooks/use-default-event-detail-tab';

// components (route-consumed)
export { ColorBlindnessSelector } from './components/color-blindness/color-blindness';
export { DataDisplay } from './components/data-display/data-display';
export { DateTimeSelector } from './components/date-time-format/date-time-format';
export { DefaultEventTab } from './components/default-event-tab/default-event-tab';
export { ExportFormatSelector } from './components/export-format-selector/export-format-selector';
export { SidebarConfig } from './components/sidebar-config/sidebar-config';
