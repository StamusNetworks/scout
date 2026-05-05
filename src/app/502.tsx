import { useEffect } from 'react';

import Icon from '@/assets/stamus_s.png';
import { Column } from '@/common/design-system/atoms/layout/column';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/common/design-system/atoms/ui/card';
import { useSystemSettings } from '@/features/settings';

export const useDisplayError502 = () => {
  const { error, refetch } = useSystemSettings({
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (!error) return;
    if ((error as { originalStatus: number })?.originalStatus === 502) {
      const timeout = setTimeout(refetch, 5000);
      return () => clearTimeout(timeout);
    }
  }, [error, refetch]);

  return (error as { originalStatus: number })?.originalStatus === 502;
};

export const Error502 = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Column className="items-center gap-4">
        <img
          src={Icon}
          alt="Stamus"
          className="h-24 w-24"
        />
        <Card>
          <CardHeader>
            <CardTitle className="p-6 pb-0 text-4xl font-bold">
              502 - Bad Gateway
            </CardTitle>
          </CardHeader>
          <CardContent className="p-12 pt-0 text-xl">
            <p className="mb-4">
              It seems the Stamus Central Server has some issues...
            </p>
            <p>Page will try to reload in a few seconds</p>
          </CardContent>
        </Card>
      </Column>
    </div>
  );
};
