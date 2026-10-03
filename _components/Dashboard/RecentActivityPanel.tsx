import React from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { surfaceStyle } from "@/app/styles";

interface PanelProps {
  title: string;
  icon: LucideIcon;
  /** Omit when there is no full list to link to */
  viewAllHref?: string;
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
  <section className={cn(surfaceStyle, "overflow-hidden")}>
    <header className='flex items-center justify-between border-b border-slate-100 px-5 py-3.5'>
      <h2 className='flex items-center gap-2 text-sm font-semibold text-slate-900'>
        <Icon
          aria-hidden
          className='size-4 text-primary'
        />
        {title}
      </h2>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className='text-xs font-medium text-primary hover:underline'>
          View all
        </Link>
      )}
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
  /** Optional extra line under the meta, e.g. a rejection reason */
  note?: string;
  /** Right-aligned content such as status badges */
  children?: React.ReactNode;
}

export const RecentActivityRow = ({
  href,
  title,
  meta,
  note,
  children,
}: RowProps) => (
  <li>
    <Link
      href={href}
      className='flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none'>
      <div className='min-w-0'>
        <p className='truncate text-sm font-medium text-slate-900'>{title}</p>
        <p className='truncate text-xs text-slate-500'>{meta}</p>
        {note && (
          <p className='mt-1 line-clamp-2 text-xs text-slate-600'>{note}</p>
        )}
      </div>
      <div className='flex shrink-0 items-center gap-3'>{children}</div>
    </Link>
  </li>
);
