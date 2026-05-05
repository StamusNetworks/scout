import React, { isValidElement, ReactNode } from 'react';

import {
  Tabs as BorderTabs,
  TabsContent as BorderTabsContent,
  TabsList as BorderTabsList,
  TabsTrigger as BorderTabsTrigger,
} from '@/common/design-system/atoms/ui/borderTabs';
import {
  Tabs as PillTabs,
  TabsContent as PillTabsContent,
  TabsList as PillTabsList,
  TabsTrigger as PillTabsTrigger,
} from '@/common/design-system/atoms/ui/pillTabs';
import { Event } from '@/features/events/model/event';

import { useEventDetailData } from '../../hooks/use-event-detail-data';
import {
  EventDetailData,
  TabComponentType,
  TabConfig,
} from './event-detail-tabs.types';

interface EventDetailTabsProps {
  event: Event;
  variant?: 'border' | 'pill';
  defaultTab?: string;
  className?: string;
  children: ReactNode;
}

const tabVariants = {
  border: {
    Tabs: BorderTabs,
    TabsList: BorderTabsList,
    TabsTrigger: BorderTabsTrigger,
    TabsContent: BorderTabsContent,
  },
  pill: {
    Tabs: PillTabs,
    TabsList: PillTabsList,
    TabsTrigger: PillTabsTrigger,
    TabsContent: PillTabsContent,
  },
};

function collectTabs(children: ReactNode, data: EventDetailData): TabConfig[] {
  const tabs: TabConfig[] = [];

  React.Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;

    const type = child.type as TabComponentType;
    if (typeof type === 'function' && 'tabConfig' in type) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const config = type.tabConfig(child.props as any, data);
      if (config) {
        if (Array.isArray(config)) {
          tabs.push(...config);
        } else {
          tabs.push(config);
        }
      }
    }
  });

  return tabs;
}

export const EventDetailTabs = ({
  event,
  variant = 'border',
  defaultTab = 'synthetic_view',
  className,
  children,
}: EventDetailTabsProps) => {
  const data = useEventDetailData(event);
  const tabs = collectTabs(children, data);
  const { Tabs, TabsList, TabsTrigger, TabsContent } = tabVariants[variant];

  return (
    <Tabs
      defaultValue={defaultTab}
      className={className}
    >
      <TabsList
        className={variant === 'border' ? 'flex-wrap gap-y-1' : undefined}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent
          key={tab.id}
          value={tab.id}
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};
