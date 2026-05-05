import { MqttEvent } from '@/features/events/model/app-proto/mqtt.schema';

import { RelatedTable } from '../related-table';
import { relatedFlowColumns } from './related-mqtt.columns';

export const RelatedMqttTab = ({ data }: { data?: MqttEvent[] }) => (
  <RelatedTable<MqttEvent>
    columns={relatedFlowColumns}
    data={data || []}
  />
);
