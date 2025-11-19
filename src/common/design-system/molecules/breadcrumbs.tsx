import { PropsWithChildren, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useResolvedPath } from 'react-router-dom';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '../atoms/ui/breadcrumb';

export const BreadcrumbsOutlet = () => (
  <Breadcrumb aria-label="breadcrumb">
    <BreadcrumbList
      id="default-breadcrumb"
      className="flex"
    />
  </Breadcrumb>
);

interface BreadcrumbProps extends PropsWithChildren {
  breadcrumbOutletId?: string;
  link?: string;
}

export const OutletBreadcrumb = ({
  breadcrumbOutletId = 'default-breadcrumb',
  link,
  children,
}: BreadcrumbProps) => {
  const match = useResolvedPath('');
  const breadcrumbOutlet = useMemo(
    () => document.getElementById(breadcrumbOutletId) as HTMLOListElement,
    [breadcrumbOutletId],
  );

  if (!breadcrumbOutlet) {
    return null;
  }

  return createPortal(
    <>
      <BreadcrumbItem className="nth-last-2:text-foreground">
        <BreadcrumbLink
          href={link || match.pathname}
          className="text-sm text-inherit"
        >
          {children}
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator className="last-of-type:hidden" />
    </>,
    breadcrumbOutlet,
  );
};
