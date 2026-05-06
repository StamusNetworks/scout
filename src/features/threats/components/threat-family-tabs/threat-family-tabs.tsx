import { useLocation } from '@tanstack/react-router';

import {
  Tabs,
  TabsBadge,
  TabsList,
} from '@/common/design-system/atoms/ui/border-tabs';
import { TabsTriggerLink } from '@/common/design-system/atoms/ui/pill-tabs';

import { ThreatFamily } from '../../model/threat-family';

interface ThreatFamilyTabsProps {
  family: ThreatFamily;
  entitiesCount: number;
  entitiesLoading: boolean;
  detectionMethodsCount: number;
  detectionMethodsLoading: boolean;
  eventsCount: number;
  eventsLoading: boolean;
}

/**
 * Tab navigation for the threat family detail page. Routes to the four
 * sub-routes (entities/detection-methods/events/threats) keyed off the
 * family's kind.
 */
export const ThreatFamilyTabs = ({
  family,
  entitiesCount,
  entitiesLoading,
  detectionMethodsCount,
  detectionMethodsLoading,
  eventsCount,
  eventsLoading,
}: ThreatFamilyTabsProps) => {
  const { pathname } = useLocation();
  const base = family.kind === 'compromise' ? '/threats' : '/policy-violations';
  const familyBase = `${base}/coverage/family/${family.id}`;

  return (
    <Tabs
      value={pathname}
      className="mt-4"
    >
      <TabsList>
        <TabsTriggerLink value={familyBase}>
          Entities
          <TabsBadge
            count={entitiesCount}
            isLoading={entitiesLoading}
          />
        </TabsTriggerLink>
        <TabsTriggerLink value={`${familyBase}/detection-methods`}>
          Detection Methods
          <TabsBadge
            count={detectionMethodsCount}
            isLoading={detectionMethodsLoading}
          />
        </TabsTriggerLink>
        <TabsTriggerLink value={`${familyBase}/events`}>
          Events
          <TabsBadge
            count={eventsCount}
            isLoading={eventsLoading}
          />
        </TabsTriggerLink>
        <TabsTriggerLink value={`${familyBase}/threats`}>
          {family.kind === 'compromise' ? 'Threats' : 'Policy Violations'}
        </TabsTriggerLink>
      </TabsList>
    </Tabs>
  );
};
