import { useLocation } from '@tanstack/react-router';

import { TabsBadge } from '@/common/design-system/atoms/ui/borderTabs';
import {
  Tabs,
  TabsList,
  TabsTriggerLink,
} from '@/common/design-system/atoms/ui/pillTabs';

import { Threat, ThreatKind } from '../../model/threat';

const URL_PREFIX_BY_KIND: Record<ThreatKind, string> = {
  compromise: '/threats',
  policyViolation: '/policy-violations',
};

const tabPath = (kind: ThreatKind, id: number, suffix = '') =>
  `${URL_PREFIX_BY_KIND[kind]}/coverage/threat/${id}${suffix}`;

type BadgeState = { count: number; isLoading: boolean };

type Props = {
  threat: Threat;
  entities: BadgeState;
  detectionMethods: BadgeState;
  events: BadgeState;
};

export const ThreatDetailTabs = ({
  threat,
  entities,
  detectionMethods,
  events,
}: Props) => {
  const { pathname } = useLocation();

  return (
    <Tabs
      value={pathname}
      className="mt-8"
    >
      <TabsList>
        <TabsTriggerLink value={tabPath(threat.kind, threat.id)}>
          Entities
          <TabsBadge
            count={entities.count}
            isLoading={entities.isLoading}
          />
        </TabsTriggerLink>
        <TabsTriggerLink
          value={tabPath(threat.kind, threat.id, '/detection-methods')}
        >
          Detection Methods
          <TabsBadge
            count={detectionMethods.count}
            isLoading={detectionMethods.isLoading}
          />
        </TabsTriggerLink>
        <TabsTriggerLink value={tabPath(threat.kind, threat.id, '/events')}>
          Events
          <TabsBadge
            count={events.count}
            isLoading={events.isLoading}
          />
        </TabsTriggerLink>
      </TabsList>
    </Tabs>
  );
};
