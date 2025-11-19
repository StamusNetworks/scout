import * as RadixHide from '@radix-ui/react-visually-hidden';

export const VisuallyHidden = ({ children }: { children: React.ReactNode }) => (
  <RadixHide.Root>{children}</RadixHide.Root>
);
