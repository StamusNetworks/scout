import { createFileRoute } from '@tanstack/react-router';

import {
  PURPOSE_SLUG_MAP,
  PurposeSlug,
  PurposeTabContent,
  useNetworkHuntingTrailContext,
} from '@/features/hunting-trail';

export const Route = createFileRoute('/_enterprise/hunting-trail/$purpose')({
  component: PurposePage,
});

function PurposePage() {
  const { purpose } = Route.useParams();
  const { groups, queryMetadata } = useNetworkHuntingTrailContext();

  const slug = purpose as PurposeSlug;
  const purposeGroup = PURPOSE_SLUG_MAP[slug];

  if (!purposeGroup) {
    return (
      <div className="text-muted-foreground p-4 text-sm">Unknown category.</div>
    );
  }

  return (
    <PurposeTabContent
      group={groups[slug]}
      queryMetadata={queryMetadata}
    />
  );
}
