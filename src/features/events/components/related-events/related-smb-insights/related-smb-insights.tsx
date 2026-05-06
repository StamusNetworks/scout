import { JsonView } from '@/features/app-shell';
import { SmbInsightsEvent } from '@/features/events/model/event-types/smb-insights.schema';

export const RelatedSmbInsightsTab = ({
  data,
}: {
  data?: SmbInsightsEvent[];
}) => <JsonView data={data || {}} />;
