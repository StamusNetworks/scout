import { JsonView } from '@/common/design-system/atoms/json-view';
import { SmbInsightsEvent } from '@/features/events/common/model/event-types/smb_insights.schema';

export const RelatedSmbInsightsTab = ({
  data,
}: {
  data?: SmbInsightsEvent[];
}) => <JsonView data={data || {}} />;
