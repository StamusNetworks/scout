import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { selectIsEnterprise } from '@/features/user/settings/settings.slice';

export const Route = createFileRoute('/_enterprise')({
  beforeLoad: ({ context }) => {
    const state = context.store.getState();
    const enterprise = selectIsEnterprise(state);
    if (!enterprise) {
      throw redirect({ to: '/explorer' });
    }
  },
  component: () => <Outlet />,
});
