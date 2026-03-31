import { createFileRoute } from '@tanstack/react-router';

import { PurposeTabContent } from '@/features/hunting-trail/entities/purpose-tab-content';
import {
  PURPOSE_SLUG_MAP,
  PurposeSlug,
} from '@/features/hunting-trail/hunting-trail.model';
import { useNetworkHuntingTrailContext } from '@/features/hunting-trail/network-hunting-trail-context';

export const Route = createFileRoute('/_enterprise/hunting-trail/$purpose')({
  component: PurposePage,
});

function PurposePage() {
  const { purpose } = Route.useParams();
  const { groups } = useNetworkHuntingTrailContext();

  const slug = purpose as PurposeSlug;
  const purposeGroup = PURPOSE_SLUG_MAP[slug];

  if (!purposeGroup) {
    return (
      <div className="text-muted-foreground p-4 text-sm">Unknown category.</div>
    );
  }

  return <PurposeTabContent group={groups[slug]} />;
}
