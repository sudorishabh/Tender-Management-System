"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/_components/ui/sidebar";
import { Separator } from "@/_components/ui/separator";
import {
  getRoleDashboard,
  mapUiRoleToDb,
  type UiRole,
} from "@/lib/auth/types";
import { dashboardRoleLabels, findActiveNavItem } from "@/lib/dashboard-nav";
import NotificationBell from "./NotificationBell";

interface Props {
  role: UiRole;
}

const DashboardTopbar = ({ role }: Props) => {
  const pathname = usePathname();
  const section = findActiveNavItem(role, pathname);

  return (
    <header className='sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur'>
      <SidebarTrigger className='mt-0 size-8 text-slate-500 hover:bg-slate-100 hover:text-slate-900' />
      <Separator
        orientation='vertical'
        className='h-5 bg-slate-200'
      />
      <nav aria-label='Breadcrumb'>
        <ol className='flex items-center gap-1.5 text-sm'>
          <li>
            <Link
              href={getRoleDashboard(mapUiRoleToDb(role))}
              className='text-slate-500 transition-colors hover:text-slate-900'>
              {dashboardRoleLabels[role]}
            </Link>
          </li>
          {section && (
            <>
              <li
                aria-hidden
                className='text-slate-300'>
                /
              </li>
              <li
                aria-current='page'
                className='font-medium text-slate-900'>
                {section.title}
              </li>
            </>
          )}
        </ol>
      </nav>
      <div className='ml-auto flex items-center'>
        <NotificationBell />
      </div>
    </header>
  );
};

export default DashboardTopbar;
