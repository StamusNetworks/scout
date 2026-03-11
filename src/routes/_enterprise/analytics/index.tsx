import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_enterprise/analytics/')({
  beforeLoad: () => {
    throw redirect({ to: '/analytics/beaconing/ips' });
  },
});
