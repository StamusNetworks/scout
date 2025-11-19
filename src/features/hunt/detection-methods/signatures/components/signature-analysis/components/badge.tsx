import { cva, VariantProps } from 'class-variance-authority';

import { cn } from '@/common/lib/utils';

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
}

const badgeVariants = cva(
  'text-[0.7rem] w-fit rounded-full px-1.5 leading-none h-4 font-medium flex items-center',
  {
    variants: {
      variant: {
        secondary: 'bg-secondary text-secondary-foreground',
        default: 'bg-indigo-200 text-indigo-950',
        important: 'bg-purple-200 text-purple-950',
        transform: 'bg-yellow-200 text-yellow-950',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export const Badge = ({ children, className, variant }: BadgeProps) => (
  <span className={cn(badgeVariants({ variant }), className)}>{children}</span>
);
