import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_enterprise/threats/compromises/')({
  beforeLoad: () => {
    throw redirect({ to: '/threats/compromises/incidents' });
  },
});
