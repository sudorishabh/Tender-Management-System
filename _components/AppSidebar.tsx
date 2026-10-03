"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScrollArea } from "@/_components/ui/scroll-area";
import {
  Sidebar,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarContent,
  useSidebar,
} from "@/_components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/_components/ui/avatar";
import { Separator } from "@/_components/ui/separator";
import { LogOut, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import useLogout from "@/hooks/useLogout";
import type { UiRole } from "@/lib/auth/types";
import {
  dashboardNav,
  findActiveNavItem,
  type DashboardNavItem,
} from "@/lib/dashboard-nav";

export type DashboardRole = UiRole;

interface RoleSidebarProps {
  role: DashboardRole;
}

// Avatar/header config per role
const roleHeaderConfig: Record<
  DashboardRole,
  { image?: string; fallback: string; nameLine1: string; nameLine2: string }
> = {
  admin: {
    image: "https://github.com/shadcn.png",
    fallback: "TERI",
    nameLine1: "TERI",
    nameLine2: "Administrator",
  },
  vendor: {
    image: "/avatar.png",
    fallback: "VS",
    nameLine1: "Vendor Portal",
    nameLine2: "Manage your tenders",
  },
  super: {
    image: "https://github.com/shadcn.png",
    fallback: "RN",
    nameLine1: "Super Admin",
    nameLine2: "Dashboard",
  },
};

export const RoleSidebar = ({ role }: RoleSidebarProps) => {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { logout, isLoggingOut } = useLogout();

  const navGroups = dashboardNav[role];
  const activeHref = findActiveNavItem(role, pathname)?.href;

  // Render helper for a single link item
  const renderLink = (item: DashboardNavItem) => {
    const isActive = item.href === activeHref;
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          asChild
          isActive={isActive}
          tooltip={item.title}
          className={`w-full pl-5 my-0.5 py-[1rem] rounded-sm ${
            isActive
              ? " text-primary font-medium hover:"
              : "hover:bg-gray-100 text-gray-600"
          }`}>
          <Link
            href={item.href}
            className='w-full flex'>
            <item.icon
              className={cn(isActive ? "text-primary" : "text-gray-700")}
            />
            <span
              className={cn(
                "text-[12.5px]",
                isActive ? "text-primary" : "text-gray-700",
              )}>
              {item.title}
            </span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  // Safely access roleHeaderConfig with a fallback for invalid roles
  const headerConfig = roleHeaderConfig[role as DashboardRole] || {
    fallback: "U",
    nameLine1: "User",
    nameLine2: "Dashboard",
  };
  const { fallback, nameLine1, nameLine2 } = headerConfig;

  return (
    <Sidebar
      collapsible='icon'
      className='pt-2 h-screen border-r  border-gray-200 bg-white shadow-sm'>
      <SidebarContent>
        <SidebarGroup className='h-[calc(100vh-0.5rem)] p-0'>
          <SidebarGroupLabel className='flex flex-col h-auto px-2 mt-2'>
            <div className='flex items-center gap-2.5 justify-center'>
              <Avatar
                className={`border-2 border-primary/20 mb-1 shadow-sm transition-all ${
                  state === "collapsed" ? "size-8" : "size-10"
                }`}>
                {/* <AvatarImage
                  src={image}
                  alt={nameLine1}
                /> */}
                <AvatarFallback
                  className={`bg-primary/10 text-gray-500 font-medium ${
                    state === "collapsed" ? "text-xs" : "text-base"
                  }`}>
                  {fallback}
                </AvatarFallback>
              </Avatar>
              {state === "expanded" && (
                <span className='flex flex-col items-start gap-0'>
                  <p className='font-semibold text-sm text-gray-500'>
                    {nameLine1}
                  </p>
                  <p className='text-xs text-gray-500'>{nameLine2}</p>
                </span>
              )}
            </div>
          </SidebarGroupLabel>

          <SidebarGroupContent
            className={`${state === "collapsed" ? "mt-10" : "mt-5"}`}>
            <ScrollArea
              className={`h-[calc(100vh-10rem)] ${
                state !== "collapsed" ? "pr-3 ml-3" : "pr-0 ml-0"
              }`}>
              <SidebarMenu>
                {navGroups.map((group, idx) => (
                  <div
                    key={group.label ?? idx}
                    className='w-full'>
                    {group.items.map(renderLink)}
                    {idx < navGroups.length - 1 && (
                      <Separator className='my-3' />
                    )}
                  </div>
                ))}

                <Separator className='my-2' />
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip='Logout'
                    className='w-full pl-6 text-red-500 hover:bg-red-50'
                    disabled={isLoggingOut}
                    onClick={logout}>
                    <LogOut />
                    {isLoggingOut ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      "Logout"
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
