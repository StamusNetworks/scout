import { GearIcon } from '@radix-ui/react-icons';
import {
  Activity,
  ArrowDownUp,
  BarChart3,
  Binary,
  Biohazard,
  ChefHat,
  Eye,
  Globe,
  Group,
  LaptopMinimal,
  LayoutDashboard,
  Link,
  Network,
  PencilRuler,
  Radar,
  Scale,
  ScanSearch,
  Search,
  SquareKanban,
  WandSparkles,
  Workflow,
  // Telescope,
} from 'lucide-react';

import { getConfig } from '@/config';
import { SystemSettings } from '@/features/user/settings/settings.model';

export type MenuItem = {
  key: string;
  type: 'link' | 'external';
  url: string;
  title: string;
  icon: React.ReactNode;
  beta?: boolean;
  enterprise?: boolean;
  children?: MenuItem[];
};

export type Submenu = {
  label: string;
  enterprise?: boolean;
  children: MenuItem[];
};

export const defaultMenu = (
  systemSettings: SystemSettings,
  enterprise: boolean,
): Submenu[] => [
  {
    label: 'Security Posture',
    enterprise: true,
    children: [
      {
        key: 'operational-center',
        type: 'link',
        url: '/operational-center',
        title: 'Operational Center',
        icon: <Activity />,
        enterprise: true,
      },
      {
        key: 'volumetry',
        type: 'link',
        url: '/volumetry',
        title: 'Volumetry',
        icon: <BarChart3 />,
        enterprise: true,
      },
      {
        key: 'threats',
        type: 'link',
        url: '/threats/compromises',
        title: 'Threats',
        icon: <Biohazard />,
        enterprise: true,
        children: [
          {
            key: 'threats-compromises',
            type: 'link',
            url: '/threats/compromises',
            title: 'Compromises',
            icon: <Biohazard />,
            enterprise: true,
          },
          {
            key: 'threats-timeline',
            type: 'link',
            url: '/threats/timeline',
            title: 'Timeline',
            icon: <Biohazard />,
            enterprise: true,
          },
          {
            key: 'threats-coverage',
            type: 'link',
            url: '/threats/coverage',
            title: 'Coverage',
            icon: <Biohazard />,
            enterprise: true,
          },
        ],
      },
      {
        key: 'policy-violations',
        type: 'link',
        url: '/policy-violations/violations',
        title: 'Compliance',
        icon: <Scale />,
        enterprise: true,
        children: [
          {
            key: 'pv-violations',
            type: 'link',
            url: '/policy-violations/violations',
            title: 'Policy Violations',
            icon: <Scale />,
            enterprise: true,
          },
          {
            key: 'pv-coverage',
            type: 'link',
            url: '/policy-violations/coverage',
            title: 'Coverage',
            icon: <Scale />,
            enterprise: true,
          },
        ],
      },
      {
        key: 'attack-surface',
        type: 'link',
        url: '/attack-surface',
        title: 'Attack Surface',
        icon: <Network />,
        enterprise: true,
        beta: true,
      },
      {
        key: 'analytics',
        type: 'link',
        url: '/analytics/beaconing',
        title: 'Analytics',
        icon: <Radar />,
        enterprise: true,
        children: [
          {
            key: 'analytics-beaconing',
            type: 'link',
            url: '/analytics/beaconing',
            title: 'Beaconing',
            icon: <Radar />,
            enterprise: true,
          },
          {
            key: 'analytics-sightings',
            type: 'link',
            url: '/analytics/sightings',
            title: 'Sightings',
            icon: <Radar />,
            enterprise: true,
          },
        ],
      },
      // {
      //   key: 'explore',
      //   type: 'link',
      //   url: '/explore',
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
        url: '/explorer',
        title: 'Explorer',
        icon: <LayoutDashboard />,
      },
      {
        key: 'events',
        type: 'link',
        url: '/detection-events',
        title: 'Detection Events',
        icon: <Binary />,
      },
      {
        key: 'events-flow',
        type: 'link',
        url: '/events-flow',
        title: 'Events Flow',
        icon: <Workflow />,
      },
      {
        key: 'session-events',
        type: 'link',
        url: '/session-events',
        title: 'Network Events',
        icon: <ArrowDownUp />,
      },
      {
        key: 'hosts',
        enterprise: true,
        type: 'link',
        url: '/hosts',
        title: 'Hosts',
        icon: <LaptopMinimal />,
      },
      {
        key: 'detection_methods',
        type: 'link',
        url: '/detection-methods',
        title: 'Detection Methods',
        icon: <PencilRuler />,
      },
      {
        key: 'investigations',
        type: 'link',
        url: '/investigations',
        title: 'Investigations',
        icon: <Search />,
        beta: true,
      },
      {
        key: 'filter-sets',
        type: 'link',
        url: '/filter-sets',
        title: 'Filter Sets',
        icon: <Group />,
      },
      {
        key: 'filters-actions',
        type: 'link',
        url: '/filters-actions',
        title: 'Filter Actions',
        icon: <WandSparkles />,
      },
    ],
  },
  {
    label: 'Settings',
    children: [
      {
        key: 'deeplinks',
        type: 'link',
        url: '/deeplinks',
        title: 'Deeplinks',
        icon: <Link />,
      },
      {
        key: 'user-preferences',
        type: 'link',
        url: '/user-settings',
        title: 'Preferences',
        icon: <GearIcon />,
        beta: true,
      },
    ],
  },
  {
    label: 'Apps',
    children: [
      {
        key: 'management',
        type: 'external',
        url: getConfig()?.apiUrl + (enterprise ? '/appliances/' : '/suricata/'),
        title: 'Management',
        icon: <SquareKanban />,
      },
      {
        key: 'kibana-opensearch',
        type: 'external',
        url: getConfig()?.apiUrl + systemSettings.kibana_url,
        title: systemSettings.use_opensearch ? 'OpenSearch' : 'Kibana',
        icon: <ScanSearch />,
      },
      {
        key: 'cyber-chef',
        type: 'external',
        url: getConfig()?.apiUrl + systemSettings.cyberchef_url,
        title: 'Cyber Chef',
        icon: <ChefHat />,
      },
      ...(enterprise
        ? []
        : ([
            {
              key: 'arkime',
              type: 'external',
              url: getConfig()?.apiUrl + systemSettings.arkime_url,
              title: 'Arkime',
              icon: <Globe />,
            },
            {
              key: 'evebox',
              type: 'external',
              url: getConfig()?.apiUrl + systemSettings.evebox_url,
              title: 'EveBox',
              icon: <Eye />,
            },
          ] as MenuItem[])),
    ],
  },
];
