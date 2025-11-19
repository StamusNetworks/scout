import { LoaderCircle, LucideProps } from 'lucide-react';

import { cn } from '@/common/lib/utils';

export const Spin = (props: LucideProps) => {
  return (
    <LoaderCircle
      data-testid="spin"
      className={cn('animate-spin', props.className)}
      {...props}
    />
  );
};
