import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_enterprise/threats/compromises')({
  component: Outlet,
});
