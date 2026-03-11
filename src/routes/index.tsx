import { createFileRoute } from '@tanstack/react-router';

import { Slash } from '@/common/design-system/layouts/components/slash';

export const Route = createFileRoute('/')({
  component: Slash,
});
