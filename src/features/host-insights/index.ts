// ── api ───────────────────────────────────────────────────────────────
export {
  useGetHostsQuery,
  useGetHostsWithAlertsQuery,
  useGetHostWithAlertsQuery,
  useFetchHostsCountsQuery,
  useGetNetworkTreeQuery,
} from './api/hosts.api';

// ── model ─────────────────────────────────────────────────────────────
export type { Host } from './model/host';
export { HostRoles, getHostRole } from './model/host';
export type { Role } from './model/role';
export { ROLES, rolesSchema } from './model/role';

// ── hooks ─────────────────────────────────────────────────────────────
export { useGetHostInsights } from './hooks/use-get-host-insights';
export { useWithAlertsParam } from './hooks/use-with-alerts-param';

// ── components ────────────────────────────────────────────────────────
export {
  Hostname,
  HostnameTemplate,
} from './components/host-attributes/hostname';
export { Network, NetworkTemplate } from './components/host-attributes/network';
export {
  Roles,
  RolesTemplate,
  RoleBadge,
} from './components/host-attributes/roles';
export {
  Username,
  UsernameTemplate,
} from './components/host-attributes/username';
export { HostSummary, HostStats } from './components/host-summary';
export { InternalExternal } from './components/internal-external';
export { HostInsightsBlocks } from './components/host-insights-blocks';
export { HostHeader } from './components/host-header/host-header';
export { HostDetailsShell } from './components/host-details-shell/host-details-shell';
export { HostInsightsView } from './components/host-insights-view/host-insights-view';
export { HostTimeline } from './components/host-timeline/host-timeline';
export { HostBeaconsTable } from './components/host-beacons-table/host-beacons-table';
export { HostFilesTable } from './components/host-files-table/host-files-table';
export { HostDetectionMethodsTable } from './components/host-detection-methods-table/host-detection-methods-table';
export { HostHuntingTrail } from './components/host-hunting-trail/host-hunting-trail';
export { HostIncidentsTable } from './components/host-incidents-table/host-incidents-table';
export { HostOutlierEvents } from './components/host-outlier-events/host-outlier-events';
export { HostSightingsTable } from './components/host-sightings-table/host-sightings-table';
export { HostsTable } from './components/hosts-table/hosts-table';
export { HostsInventoryTable } from './components/hosts-inventory-table/hosts-inventory-table';
export { NetworkTreeSunburst } from './components/network-tree-sunburst/network-tree-sunburst';
export { DiscoveredHosts } from './components/discovered-hosts/discovered-hosts';
export { HomeNetPicker } from './components/home-net-picker/home-net-picker';
