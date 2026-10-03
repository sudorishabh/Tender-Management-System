import React from "react";
import Link from "next/link";

interface SidebarRowProps {
  href: string;
  title: string;
  meta: string;
  /** Short status at the end of the meta line, such as a countdown */
  children?: React.ReactNode;
}

/**
 * List row sized for the narrow home sidebar: the title gets the full width
 * and two lines, with the details underneath instead of beside it.
 */
const SidebarRow = ({ href, title, meta, children }: SidebarRowProps) => (
  <li>
    <Link
      href={href}
      className='block px-5 py-3 transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none'>
      <p className='line-clamp-2 text-sm font-medium text-slate-900'>{title}</p>
      <div className='mt-1 flex items-center justify-between gap-3'>
        <p className='min-w-0 truncate text-xs text-slate-500'>{meta}</p>
        {children}
      </div>
    </Link>
  </li>
);

export default SidebarRow;
