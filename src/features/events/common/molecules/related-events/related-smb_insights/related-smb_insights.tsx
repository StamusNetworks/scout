import { JsonView } from '@/common/design-system/atoms/json-view';
import { SmbInsightsEvent } from '@/features/events/model/event-types/smb-insights.schema';

export const RelatedSmbInsightsTab = ({
  data,
}: {
  data?: SmbInsightsEvent[];
}) => <JsonView data={data || {}} />;
