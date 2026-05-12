import { useEffect } from 'react';

import { Spin } from '@/common/design-system/atoms/ui/spin';
import { useAutoReload } from '@/features/app-shell';
import { redirectToLogin, useSessionActivity } from '@/features/auth';
import { useRefreshDates } from '@/features/dates';
import { useESMapping } from '@/features/query-filters/hooks/use-es-mapping';
import { useGlobalSettings, useSystemSettings } from '@/features/settings';
import { useFetchTenantsList } from '@/features/tenancy';
import { setOnUnauthenticated } from '@/store/api';

import { Error502, useDisplayError502 } from './502';

// Wire the RTK Query base-query 401/403 handler before any request fires.
// Done at module scope so the registration runs at app boot, not after first render.
setOnUnauthenticated(() => redirectToLogin({ variant: 'login' }));

export const SystemSettings = ({ children }: { children: React.ReactNode }) => {
  const { isLoading: systemSettingsLoading } = useSystemSettings({
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });
  return systemSettingsLoading ? <Spin /> : children;
};

export const AppLoader = ({ children }: { children: React.ReactNode }) => {
  const refreshDates = useRefreshDates();
  useSessionActivity();
  const { isLoading: globalSettingsLoading } = useGlobalSettings({
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });
  const { isLoading: tenantsListLoading } = useFetchTenantsList({
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });
  const { isLoading: systemSettingsLoading, error } = useSystemSettings({
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });
  useESMapping();
  useAutoReload();

  useEffect(() => {
    if ((error as { status: number })?.status === 403) {
      redirectToLogin({ variant: 'login' });
    }
  }, [error]);

  useEffect(() => {
    refreshDates();
  }, [refreshDates]);

  const displayError502 = useDisplayError502();

  if (displayError502) {
    return <Error502 />;
  }

  return globalSettingsLoading ||
    tenantsListLoading ||
    systemSettingsLoading ||
    error ? (
    <div className="flex h-screen w-screen items-center justify-center">
      <Spin />
    </div>
  ) : (
    children
  );
};
