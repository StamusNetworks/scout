import { ReactNode } from 'react';

import { EventFileInfo } from '@/features/hunt/events/model/event-types/fileinfo.schema';
import { FlowEvents } from '@/features/hunt/events/model/flowEvent.schema';

export interface TabConfig {
  id: string;
  label: ReactNode;
  content: ReactNode;
}

export interface EventDetailData {
  flowEvents: FlowEvents | undefined;
  flowEventsLoading: boolean;
  files: Array<EventFileInfo & { host: string }>;
}

export interface TabComponentType<P = object> {
  (props: P): null;
  tabConfig: (
    props: P,
    data: EventDetailData,
  ) => TabConfig | TabConfig[] | null;
}
