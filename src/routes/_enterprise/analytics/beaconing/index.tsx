import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_enterprise/analytics/beaconing/')({
  beforeLoad: () => {
    throw redirect({ to: '/analytics/beaconing/ips' });
  },
});
