import { JsonView } from '@/common/design-system/atoms/json-view';

import { SmbInsightsEvent } from '../../../model/event-types/smb_insights.schema';

export const RelatedSmbInsightsTab = ({
  data,
}: {
  data?: SmbInsightsEvent[];
}) => <JsonView data={data || {}} />;
