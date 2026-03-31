import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_enterprise/hunting-trail/')({
  beforeLoad: () => {
    throw redirect({
      to: '/hunting-trail/$purpose',
      params: { purpose: 'lateral-movement' },
    });
  },
});
