import { Column } from '@/common/design-system/atoms/layout/column';
import { Event } from '@/features/events/common/events.model';

import { DetectionAttributes } from './attributes';
import Flow from './flow';
import protoColumns, { ProtoColumn } from './flow.columns';

export type ProtoKey = keyof typeof protoColumns;

export const ProtoFlow = ({
  events,
  methodType,
  columns,
}: {
  events: Event[];
  methodType?: string;
  columns?: ProtoColumn[];
}) => {
  const appProtos = [
    ...new Set(events.map((e) => e.app_proto || 'default')),
  ].toSorted() as ProtoKey[];

  return (
    <>
      {appProtos.map((appProto) => {
        const eventsForProto =
          appProto === 'default'
            ? events.filter((e) => !e.app_proto)
            : events.filter((e) => e.app_proto === appProto);
        const defaultColumns =
          methodType === 'code'
            ? protoColumns.code
            : (protoColumns[appProto] ?? protoColumns.default);
        return (
          <Column key={appProto}>
            <DetectionAttributes
              eventsForProto={eventsForProto}
              appProto={appProto}
            />
            <Flow
              key={appProto}
              events={eventsForProto}
              columns={columns ?? defaultColumns}
            />
          </Column>
        );
      })}
    </>
  );
};
