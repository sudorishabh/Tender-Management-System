"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { House, LogOut, Loader2 } from "lucide-react";
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
  SidebarSeparator,
  useSidebar,
} from "@/_components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/_components/ui/avatar";
import { cn } from "@/lib/utils";
import useLogout from "@/hooks/useLogout";
import {
  getRoleDashboard,
  mapUiRoleToDb,
  type UiRole,
} from "@/lib/auth/types";
import {
  dashboardNav,
  dashboardRoleLabels,
  findActiveNavItem,
  type DashboardNavItem,
} from "@/lib/dashboard-nav";

export type DashboardRole = UiRole;

interface RoleSidebarProps {
  role: DashboardRole;
}

const isTeriBrand = process.env.NEXT_PUBLIC_APP_NAME === "TERI";

// Leaves the dashboard for the public site, so it is never the active item
const homePageLink: DashboardNavItem = {
  title: "Home page",
  href: "/",
  icon: House,
};

// "Rishabh Negi" -> "RN", "jane.doe@teri.res.in" -> "JD"
const getInitials = (value: string) =>
  value
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

const NavLink = ({
  item,
  isActive,
}: {
  item: DashboardNavItem;
  isActive: boolean;
}) => (
  <SidebarMenuItem>
    <SidebarMenuButton
      asChild
      isActive={isActive}
      tooltip={item.title}
      className='relative h-9 text-[13px] text-sidebar-foreground'>
      <Link
        href={item.href}
        aria-current={isActive ? "page" : undefined}>
        {isActive && (
          <span
            aria-hidden
            className='absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-sidebar-accent'
          />
        )}
        <item.icon className={cn(isActive && "text-sidebar-accent")} />
        <span>{item.title}</span>
      </Link>
    </SidebarMenuButton>
  </SidebarMenuItem>
);

export const RoleSidebar = ({ role }: RoleSidebarProps) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { state, isMobile } = useSidebar();
  const { logout, isLoggingOut } = useLogout();

  // The mobile sheet always shows labels, whatever the desktop state is
  const isCollapsed = state === "collapsed" && !isMobile;
  const navGroups = dashboardNav[role];
  const activeHref = findActiveNavItem(role, pathname)?.href;

  const userName = session?.user?.name;
  const userEmail = session?.user?.email;
  const displayName = userName || userEmail || "User";

  return (
    <Sidebar
      collapsible='icon'
      className='border-sidebar-border'>
      <SidebarHeader className='py-4'>
        <Link
          href={getRoleDashboard(mapUiRoleToDb(role))}
          aria-label={`TERI Tenders, ${dashboardRoleLabels[role]}`}
          className='flex items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring'>
          <span className='flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white shadow-sm'>
            {isTeriBrand ? (
              <Image
                src='/TERI_LOGO.png'
                alt=''
                width={28}
                height={28}
                className='size-7 object-contain'
              />
            ) : (
              <span className='text-xs font-bold text-primary'>T</span>
            )}
          </span>
          {!isCollapsed && (
            <span className='flex min-w-0 flex-col leading-tight'>
              <span className='truncate text-sm font-semibold text-white'>
                TERI Tenders
              </span>
              <span className='truncate text-xs text-sidebar-foreground/70'>
                {dashboardRoleLabels[role]}
              </span>
            </span>
          )}
        </Link>
        <SidebarMenu>
          <NavLink
            item={homePageLink}
            isActive={false}
          />
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className='py-2'>
        {navGroups.map((group, idx) => (
          <SidebarGroup
            key={group.label ?? idx}
            className='py-1'>
            {group.label && (
              <SidebarGroupLabel className='text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/60'>
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    isActive={item.href === activeHref}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className='gap-1 py-3'>
        <div className='flex items-center gap-3'>
          <Avatar className='size-8 shrink-0'>
            <AvatarFallback className='bg-sidebar-primary text-xs font-semibold text-white'>
              {getInitials(displayName) || "U"}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className='min-w-0 leading-tight'>
              <p className='truncate text-sm font-medium text-white'>
                {displayName}
              </p>
              {userName && userEmail && (
                <p className='truncate text-xs text-sidebar-foreground/70'>
                  {userEmail}
                </p>
              )}
            </div>
          )}
        </div>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip='Log out'
              disabled={isLoggingOut}
              onClick={logout}
              className='h-9 text-[13px] text-sidebar-foreground hover:bg-red-500/15 hover:text-red-200'>
              {isLoggingOut ? <Loader2 className='animate-spin' /> : <LogOut />}
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
