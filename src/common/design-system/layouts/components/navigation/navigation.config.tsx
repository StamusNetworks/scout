import { GearIcon } from '@radix-ui/react-icons';
import {
  Activity,
  ArrowDownUp,
  Binary,
  Biohazard,
  Group,
  History,
  LaptopMinimal,
  LayoutDashboard,
  Link,
  Network,
  PencilRuler,
  Radar,
  Scale,
  Search,
  SquareKanban,
  WandSparkles,
  // Telescope,
} from 'lucide-react';

import { getConfig } from '@/config';

import { type Submenu } from './navigation';

export const defaultMenu = (routes: Record<string, string>): Submenu[] => [
  {
    label: 'Security Posture',
    children: [
      {
        key: 'operational-center',
        type: 'link',
        url: routes.operational_center,
        title: 'Operational Center',
        icon: <Activity />,
        enterprise: true,
      },
      {
        key: 'threats',
        type: 'link',
        url: routes.threats,
        title: 'Threats',
        icon: <Biohazard />,
        enterprise: true,
      },
      {
        key: 'policy-violations',
        type: 'link',
        url: routes.policy_violations,
        title: 'Policy Violations',
        icon: <Scale />,
        enterprise: true,
      },
      {
        key: 'attack-surface',
        type: 'link',
        url: routes.attack_surface,
        title: 'Attack Surface',
        icon: <Network />,
        enterprise: true,
        beta: true,
      },
      {
        key: 'analytics',
        type: 'link',
        url: routes.analytics,
        title: 'Analytics',
        icon: <Radar />,
        enterprise: true,
      },
      // {
      //   key: 'explore',
      //   type: 'link',
      //   url: routes.explore,
      //   title: 'Explore',
      //   icon: <Telescope />,
      //   enterprise: true,
      // },
    ],
  },
  {
    label: 'Hunting & Investigation',
    children: [
      {
        key: 'explorer',
        type: 'link',
        url: routes.explorer,
        title: 'Explorer',
        icon: <LayoutDashboard />,
      },
      {
        key: 'events',
        type: 'link',
        url: routes.events,
        title: 'Detection Events',
        icon: <Binary />,
      },
      {
        key: 'session-events',
        type: 'link',
        url: routes.session_events,
        title: 'Session Events',
        icon: <ArrowDownUp />,
      },
      {
        key: 'hosts',
        type: 'link',
        url: routes.hosts,
        title: 'Hosts',
        icon: <LaptopMinimal />,
      },
      {
        key: 'detection_methods',
        type: 'link',
        url: routes.detection_methods,
        title: 'Detection Methods',
        icon: <PencilRuler />,
      },
      {
        key: 'investigations',
        type: 'link',
        url: routes.investigations,
        title: 'Investigations',
        icon: <Search />,
        beta: true,
      },
      {
        key: 'filter-sets',
        type: 'link',
        url: routes.filter_sets,
        title: 'Filter Sets',
        icon: <Group />,
      },
    ],
  },
  {
    label: 'Settings',
    children: [
      {
        key: 'deeplinks',
        type: 'link',
        url: routes.deeplinks,
        title: 'Deeplinks',
        icon: <Link />,
      },
      {
        key: 'user-preferences',
        type: 'link',
        url: routes.user_settings,
        title: 'Preferences',
        icon: <GearIcon />,
        beta: true,
      },
    ],
  },
  {
    label: 'Administration',
    children: [
      {
        key: 'filters-actions',
        type: 'link',
        url: routes.filters_actions,
        title: 'Filter Actions',
        icon: <WandSparkles />,
      },
      {
        key: 'operations-history',
        type: 'link',
        url: routes.operations_history,
        title: 'Operations History',
        icon: <History />,
      },
      {
        key: 'management',
        type: 'link',
        url: getConfig()?.apiUrl + '/appliances/',
        title: 'Management',
        icon: <SquareKanban />,
      },
    ],
  },
];
