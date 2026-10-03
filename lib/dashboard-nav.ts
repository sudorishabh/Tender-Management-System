import {
  ArrowDownUp,
  BadgePlus,
  Blocks,
  CircleCheckBig,
  ClipboardList,
  LayoutDashboard,
  Save,
  Share2,
  ShoppingBag,
  UserCircle,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { UiRole } from "@/lib/auth/types";

export interface DashboardNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface DashboardNavGroup {
  label?: string;
  items: DashboardNavItem[];
}

export const dashboardRoleLabels: Record<UiRole, string> = {
  admin: "Admin Console",
  vendor: "Vendor Portal",
  super: "Super Admin",
};

/**
 * Sidebar navigation per dashboard role. Shared by the sidebar and the
 * dashboard top bar so both agree on the current section.
 */
export const dashboardNav: Record<UiRole, DashboardNavGroup[]> = {
  admin: [
    {
      items: [
        { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { title: "Create Tender", href: "/admin/create", icon: BadgePlus },
        { title: "Live Tenders & Bids", href: "/admin/live", icon: Blocks },
        { title: "Approved Bids", href: "/admin/approved", icon: CircleCheckBig },
        { title: "Saved & Reviewed Tenders", href: "/admin/saved", icon: Save },
        { title: "Manage Vendors", href: "/admin/vendors", icon: Users },
        { title: "All Bids", href: "/admin/bids", icon: ArrowDownUp },
      ],
    },
  ],
  vendor: [
    {
      items: [{ title: "Dashboard", href: "/vendor", icon: LayoutDashboard }],
    },
    {
      items: [
        {
          title: "Purchased Tenders",
          href: "/vendor/purchased",
          icon: ShoppingBag,
        },
      ],
    },
    {
      items: [{ title: "Profile", href: "/vendor/profile", icon: UserCircle }],
    },
  ],
  super: [
    {
      items: [
        { title: "Invite Admin", href: "/super/invite", icon: Share2 },
        { title: "Manage Admins", href: "/super/admins", icon: Users },
        { title: "Review Tender", href: "/super/tenders", icon: ClipboardList },
      ],
    },
  ],
};

const matchesPath = (href: string, pathname: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

/**
 * Returns the nav item for the current page. The most specific (longest)
 * matching href wins, so "/admin/live/12" resolves to "/admin/live" rather
 * than the "/admin" dashboard root.
 */
export const findActiveNavItem = (
  role: UiRole,
  pathname: string,
): DashboardNavItem | undefined =>
  dashboardNav[role]
    .flatMap((group) => group.items)
    .filter((item) => matchesPath(item.href, pathname))
    .sort((a, b) => b.href.length - a.href.length)[0];
