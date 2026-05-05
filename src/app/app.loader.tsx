import { useEffect } from 'react';

import { Spin } from '@/common/design-system/atoms/ui/spin';
import { getConfig } from '@/config';
import { useSessionActivity } from '@/features/auth';
import { refreshRange } from '@/features/filtering/dates/dates.store';
import { useESMapping } from '@/features/filtering/es-mapping/use-es-mapping';
import { useGlobalSettings, useSystemSettings } from '@/features/settings';
import { useFetchTenantsList } from '@/features/tenancy';
import { useAutoReload } from '@/features/ui/use-auto-reload';
import { useAppDispatch } from '@/store/store';

import { Error502, useDisplayError502 } from './502';

export const SystemSettings = ({ children }: { children: React.ReactNode }) => {
  const { isLoading: systemSettingsLoading } = useSystemSettings({
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });
  return systemSettingsLoading ? <Spin /> : children;
};

export const AppLoader = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
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
    if (
      (error as { status: number })?.status === 403 &&
      import.meta.env.VITE_APP_MODE !== 'development'
    ) {
      window.location.href =
        getConfig()?.apiUrl + '/accounts/login' + import.meta.env.BASE_URL;
    }
  }, [error]);

  useEffect(() => {
    dispatch(refreshRange());
  }, [dispatch]);

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
