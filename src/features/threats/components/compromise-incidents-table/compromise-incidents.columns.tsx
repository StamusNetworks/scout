import { threatStatusColumnDefs } from '@/features/threats/common/molecules/threat-status-columns';

export const compromiseIncidentsColumns = [
  { ...threatStatusColumnDefs.first_seen, enableSorting: true },
  threatStatusColumnDefs.entity,
  threatStatusColumnDefs.role,
  threatStatusColumnDefs.threat,
  { ...threatStatusColumnDefs.kill_chain, visible: true },
  threatStatusColumnDefs.network_info,
  { ...threatStatusColumnDefs.last_seen, enableSorting: true },
];
