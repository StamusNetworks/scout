import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_enterprise/policy-violations/violations',
)({
  component: Outlet,
});
