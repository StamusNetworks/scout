import { cva, VariantProps } from 'class-variance-authority';

export const detailsVariants = cva('', {
  variants: {
    size: {
      small: 'text-xs [&>div]:font-normal [&>svg]:size-4',
    },
  },
});
export type DetailsVariants = VariantProps<typeof detailsVariants>;
