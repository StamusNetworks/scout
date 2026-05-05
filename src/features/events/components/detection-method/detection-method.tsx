import { PencilRuler } from 'lucide-react';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from '@/common/design-system/atoms/ui/empty';
import { Skeleton } from '@/common/design-system/atoms/ui/skeleton';
import { useGetRuleBySidQuery } from '@/features/detection-methods/api/rules.api';
import { RuleExpandedRowTemplate } from '@/features/detection-methods/components/rules-table/rules-table.expanded-row';

export const DetectionMethodTab = ({ sid }: { sid: number }) => {
  const { data, isLoading } = useGetRuleBySidQuery({ sid });

  if (isLoading)
    return (
      <Column className="gap-2">
        <Row className="justify-end">
          <Skeleton className="h-12 w-48" />
        </Row>
        <Grid className="grid-cols-3 gap-2">
          <Skeleton className="h-60 w-full" />
          <Skeleton className="h-60 w-full" />
          <Skeleton className="h-60 w-full" />
        </Grid>
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-80 w-full" />
        <Grid className="grid-cols-4 gap-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </Grid>
        <Grid className="grid-cols-12 gap-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </Grid>
        <Skeleton className="h-9 w-64" />
        <Grid className="grid-cols-6 gap-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </Grid>
      </Column>
    );

  if (!data)
    return (
      <Empty>
        <EmptyMedia variant="icon">
          <PencilRuler />
        </EmptyMedia>
        <EmptyContent>
          <EmptyHeader>Detection method not found</EmptyHeader>
          <EmptyDescription>
            The detection method for this event was not found. The source /
            ruleset might be missing
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    );

  return <RuleExpandedRowTemplate rule={data} />;
};
