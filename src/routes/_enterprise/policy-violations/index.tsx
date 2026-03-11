import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_enterprise/policy-violations/')({
  beforeLoad: () => {
    throw redirect({ to: '/policy-violations/violations' });
  },
});
