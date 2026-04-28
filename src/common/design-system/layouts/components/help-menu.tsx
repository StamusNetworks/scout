import { format } from 'date-fns';
import { BookMarked, BookOpenText, Info, InfoIcon } from 'lucide-react';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/common/design-system/atoms/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/common/design-system/atoms/ui/dropdown-menu';
import { useFeatureFlags } from '@/common/lib/use-feature-flags';
import { getConfig } from '@/config';
import {
  useGetSciriusContextQuery,
  useGetSourcesQuery,
} from '@/features/user/settings/settings.api';

export const HelpMenu = () => {
  const { product, version } = useGetSciriusContextQuery(undefined, {
    selectFromResult: (result) => ({
      ...result,
      product: result.data?.product_long_name,
      version: result.data?.version
        ? /\d+\.\d+\.\d+/.exec(result.data?.version)
        : undefined,
    }),
  });
  const { source } = useGetSourcesQuery(
    { datatype: 'threat' },
    {
      selectFromResult: (result) => ({
        ...result,
        source: result.data?.results.find(
          (result) => result.datatype === 'threat',
        ),
      }),
    },
  );
  const { enterprise } = useFeatureFlags();
  return (
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            data-testid="help-menu-dropdown-trigger"
          >
            <Info />
            Help
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {!enterprise && (
            <DropdownMenuItem asChild>
              <a
                href="https://docs.clearndr.io"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <BookMarked className="mr-2" />
                Clear NDR® Documentation
              </a>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <a
              href="https://docs.stamus-networks.com/42.0.0/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <BookMarked className="mr-2" />
              Documentation
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center"
            onClick={() => {
              window.open(
                getConfig()?.apiUrl +
                  '/static/doc/stamus-security-platform/security-posture.html',
                '_blank',
              );
            }}
          >
            <BookOpenText className="mr-2" />
            User manual
          </DropdownMenuItem>
          <DialogTrigger asChild>
            <DropdownMenuItem>
              <InfoIcon className="mr-2" />
              System information
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent>
        <DialogTitle>Clear NDR®</DialogTitle>
        <DialogDescription>
          Information about your Clear NDR® installation.
        </DialogDescription>
        <Column>
          <ul className="list-inside list-disc text-sm">
            <li>
              <span className="font-bold">{product}:</span> v{version}
            </li>
            <li>
              <span className="font-bold">Stamus Threat Intelligence:</span> v
              {source?.version}{' '}
              {source?.updated_date &&
                `(updated at ${format(new Date(source.updated_date), 'yyyy-MM-dd')})`}
            </li>
          </ul>
          <p className="mt-4 text-sm">Copyright 2014-2025, Stamus Networks</p>
        </Column>
      </DialogContent>
    </Dialog>
  );
};
