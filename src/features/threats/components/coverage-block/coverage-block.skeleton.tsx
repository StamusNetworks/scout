import {
  Card,
  CardContent,
  CardHeader,
} from '@/common/design-system/atoms/ui/card';
import { Skeleton } from '@/common/design-system/atoms/ui/skeleton';

export const CoverageBlockSkeleton = () => {
  return (
    <Card>
      <CardHeader className="p-4">
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2 p-4 pt-0">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-48" />
      </CardContent>
    </Card>
  );
};
