import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, ChevronRight, User } from 'lucide-react';

import logo from '@/assets/stamus_s.png';
import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Badge, type BadgeProps } from '@/common/design-system/atoms/ui/badge';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/common/design-system/atoms/ui/collapsible';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/common/design-system/atoms/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/design-system/atoms/ui/select';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from '@/common/design-system/atoms/ui/sidebar';
import { useFeatureFlags } from '@/common/lib/use-feature-flags';
import { cn } from '@/common/lib/utils';
import { getConfig } from '@/config';
import { useCurrentUser } from '@/features/auth';
import { type Tenant, useSetTenant, useTenancy } from '@/features/tenancy';

import type { MenuItem, Submenu } from './navigation.config';

type AppSidebarProps = {
  menu: Submenu[];
};

export const AppSidebar = ({ menu }: AppSidebarProps) => {
  const { enterprise } = useFeatureFlags();
  const { pathname } = useLocation();

  const filteredMenu = menu
    .filter((group) => (enterprise ? true : !group.enterprise))
    .map((group) => ({
      ...group,
      children: group.children.filter((item) =>
        enterprise ? true : !item.enterprise,
      ),
    }));

  return (
    <Sidebar
      collapsible="icon"
      variant="inset"
    >
      <SidebarHeader>
        <SidebarHeaderContent />
      </SidebarHeader>
      <SidebarContent>
        {filteredMenu.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.children.map((item) =>
                  item.children && item.children.length > 0 ? (
                    <CollapsibleMenuItem
                      key={item.key}
                      item={item}
                      pathname={pathname}
                      enterprise={enterprise}
                    />
                  ) : (
                    <FlatMenuItem
                      key={item.key}
                      item={item}
                      pathname={pathname}
                    />
                  ),
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <LegacyUIButton />
        <SidebarUserFooter />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

const SidebarHeaderContent = () => {
  const setTenant = useSetTenant();
  const { multitenancy, tenant, tenantsList } = useTenancy();
  const { state } = useSidebar();

  return (
    <div className="flex flex-col gap-2">
      <Link to="/">
        <Row className="mb-2 items-center gap-1">
          <img
            src={logo}
            alt="logo"
            className="h-8 w-8 shrink-0"
          />
          {state === 'expanded' && (
            <>
              <span className="text-lg font-black">/</span>
              <span className="text-lg font-light tracking-wide">
                Clear NDR®
              </span>
            </>
          )}
        </Row>
      </Link>
      {multitenancy && state === 'expanded' && (
        <Select
          value={tenant?.toString()}
          onValueChange={(value: string) => setTenant(parseInt(value))}
        >
          <SelectTrigger className="bg-background h-8 w-full">
            <SelectValue placeholder="Select Tenant" />
          </SelectTrigger>
          <SelectContent onCloseAutoFocus={(e) => e.preventDefault()}>
            {tenantsList.map((t: Tenant) => (
              <SelectItem
                key={t.tenantId}
                value={t.tenantId.toString()}
              >
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

const CollapsibleMenuItem = ({
  item,
  pathname,
  enterprise,
}: {
  item: MenuItem;
  pathname: string;
  enterprise: boolean;
}) => {
  const isActive = pathname.startsWith(item.url);
  const filteredChildren = item.children!.filter((child) =>
    enterprise ? true : !child.enterprise,
  );

  return (
    <Collapsible
      defaultOpen={isActive}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title}>
            {item.icon}
            <span>{item.title}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {filteredChildren.map((child) => (
              <SidebarMenuSubItem key={child.key}>
                <SidebarMenuSubButton
                  asChild
                  isActive={pathname.startsWith(child.url)}
                >
                  <Link to={child.url}>
                    <span>{child.title}</span>
                    <ItemBadges
                      item={child}
                      enterprise={enterprise}
                    />
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

const FlatMenuItem = ({
  item,
  pathname,
}: {
  item: MenuItem;
  pathname: string;
}) => {
  const navigate = useNavigate();
  const { enterprise } = useFeatureFlags();
  const isActive = pathname.startsWith(item.url);

  const handleClick = () => {
    if (item.type === 'external') {
      window.open(item.url);
    } else {
      navigate({ to: item.url });
    }
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={item.title}
        isActive={isActive}
        onClick={handleClick}
      >
        {item.icon}
        <span>{item.title}</span>
        <ItemBadges
          item={item}
          enterprise={enterprise}
        />
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const ItemBadges = ({
  item,
  enterprise,
}: {
  item: MenuItem;
  enterprise: boolean;
}) => (
  <Row className="ml-auto gap-1">
    {item.beta && <Tag className="bg-beta text-beta-foreground">Beta</Tag>}
    {!enterprise && item.enterprise && (
      <Tag variant="secondary">Enterprise</Tag>
    )}
  </Row>
);

const Tag = ({ children, className, ...props }: BadgeProps) => (
  <Badge
    className={cn('px-1 py-0 shadow-none', className)}
    {...props}
  >
    {children}
  </Badge>
);

const LegacyUIButton = () => {
  const { state } = useSidebar();

  if (state === 'collapsed') return null;

  return (
    <Button
      variant="outline"
      size="sm"
      className="mx-2"
      onClick={() => (window.location.href = getConfig()?.apiUrl + '/stamus')}
    >
      <ArrowLeft className="size-4" />
      {state === 'expanded' && 'Back to legacy UI'}
    </Button>
  );
};

const SidebarUserFooter = () => {
  const { data } = useCurrentUser();
  const { state } = useSidebar();

  const content = (
    <Column>
      <p className="text-sm">{data?.username}</p>
      <Row className="-mt-1 items-center gap-2">
        <Button
          variant="link"
          className="h-3 p-0 text-xs"
          onClick={() => window.open(getConfig()?.apiUrl + '/accounts/edit/')}
        >
          Settings
        </Button>
        <p className="text-foreground/50">{' | '}</p>
        <Button
          variant="link"
          className="h-3 p-0 text-xs"
          onClick={() =>
            (window.location.href = getConfig()?.apiUrl + '/accounts/logout/')
          }
        >
          Log Out
        </Button>
      </Row>
    </Column>
  );

  if (state === 'collapsed') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <div className="border-primary/50 flex size-9 shrink-0 items-center justify-center rounded-md border">
            <User className="size-5" />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-fit px-2 py-1">{content}</PopoverContent>
      </Popover>
    );
  }

  return (
    <Row className="w-full items-center gap-3 px-2 pb-2">
      <div className="border-primary/50 flex size-9 shrink-0 items-center justify-center rounded-md border">
        <User className="size-5" />
      </div>
      {content}
    </Row>
  );
};
