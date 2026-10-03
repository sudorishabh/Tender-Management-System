import React from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface PanelProps {
  title: string;
  icon: LucideIcon;
  viewAllHref: string;
  emptyMessage: string;
  isEmpty: boolean;
  children: React.ReactNode;
}

export const RecentActivityPanel = ({
  title,
  icon: Icon,
  viewAllHref,
  emptyMessage,
  isEmpty,
  children,
}: PanelProps) => (
  <section className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
    <header className='flex items-center justify-between border-b border-slate-100 px-5 py-3.5'>
      <h2 className='flex items-center gap-2 text-sm font-semibold text-slate-900'>
        <Icon
          aria-hidden
          className='size-4 text-primary'
        />
        {title}
      </h2>
      <Link
        href={viewAllHref}
        className='text-xs font-medium text-primary hover:underline'>
        View all
      </Link>
    </header>
    {isEmpty ? (
      <p className='px-5 py-10 text-center text-sm text-slate-500'>
        {emptyMessage}
      </p>
    ) : (
      <ul className='divide-y divide-slate-100'>{children}</ul>
    )}
  </section>
);

interface RowProps {
  href: string;
  title: string;
  meta: string;
  /** Right-aligned content such as status badges */
  children?: React.ReactNode;
}

export const RecentActivityRow = ({ href, title, meta, children }: RowProps) => (
  <li>
    <Link
      href={href}
      className='flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none'>
      <div className='min-w-0'>
        <p className='truncate text-sm font-medium text-slate-900'>{title}</p>
        <p className='truncate text-xs text-slate-500'>{meta}</p>
      </div>
      <div className='flex shrink-0 items-center gap-3'>{children}</div>
    </Link>
  </li>
);
