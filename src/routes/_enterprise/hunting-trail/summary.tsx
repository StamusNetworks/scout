import { createFileRoute } from '@tanstack/react-router';

import {
  SummaryMatrix,
  useNetworkHuntingTrailContext,
} from '@/features/hunting-trail';

export const Route = createFileRoute('/_enterprise/hunting-trail/summary')({
  component: SummaryPage,
});

function SummaryPage() {
  const { groups } = useNetworkHuntingTrailContext();
  return <SummaryMatrix groups={groups} />;
}
