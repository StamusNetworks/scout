import {
  ArrowDownUp,
  Binary,
  LaptopMinimal,
  LayoutDashboard,
  LucideIcon,
  PencilRuler,
} from 'lucide-react';

export const filterSetPageConfig: Record<
  string,
  { label: string; icon: LucideIcon; route: string }
> = {
  DASHBOARDS: {
    label: 'Explorer',
    icon: LayoutDashboard,
    route: '/explorer',
  },
  HOSTS_LIST: {
    label: 'Hosts',
    icon: LaptopMinimal,
    route: '/hosts',
  },
  ALERTS_LIST: {
    label: 'Events',
    icon: Binary,
    route: '/detection-events',
  },
  RULES_LIST: {
    label: 'Detection methods',
    icon: PencilRuler,
    route: '/detection-methods',
  },
  SESSION_EVENTS: {
    label: 'Network Events',
    icon: ArrowDownUp,
    route: '/network-events',
  },
};
