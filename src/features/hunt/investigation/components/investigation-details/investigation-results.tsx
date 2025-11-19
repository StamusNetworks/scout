import { Search } from 'lucide-react';

import { Grid } from '@/common/design-system/atoms/layout/grid';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from '@/common/design-system/atoms/ui/empty';
import { Label } from '@/common/design-system/atoms/ui/label';

interface InvestigationResultsProps {
  resultsCount: number;
  slot: React.ReactNode;
}
export const InvestigationResults = ({
  resultsCount,
  slot,
}: InvestigationResultsProps) => (
  <>
    <Label>Findings</Label>
    {resultsCount > 0 ? (
      <Grid className="grid-cols-4 gap-2">{slot}</Grid>
    ) : (
      <Empty>
        <EmptyMedia variant="icon">
          <Search />
        </EmptyMedia>
        <EmptyHeader>No findings</EmptyHeader>
        <EmptyDescription>
          No findings were found during this investigation.
        </EmptyDescription>
      </Empty>
    )}
  </>
);
