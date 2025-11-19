import {
  ArrowDownUp,
  Binary,
  LaptopMinimal,
  LayoutDashboard,
  LucideIcon,
  PencilRuler,
} from 'lucide-react';

import { routes } from '@/pages/routes.config';

export const filterSetPageConfig: Record<
  string,
  { label: string; icon: LucideIcon; route: string }
> = {
  DASHBOARDS: {
    label: 'Explorer',
    icon: LayoutDashboard,
    route: routes.explorer,
  },
  HOSTS_LIST: {
    label: 'Hosts',
    icon: LaptopMinimal,
    route: routes.hosts,
  },
  ALERTS_LIST: {
    label: 'Events',
    icon: Binary,
    route: routes.events,
  },
  RULES_LIST: {
    label: 'Detection methods',
    icon: PencilRuler,
    route: routes.detection_methods,
  },
  SESSION_EVENTS: {
    label: 'Session Events',
    icon: ArrowDownUp,
    route: routes.session_events,
  },
};
