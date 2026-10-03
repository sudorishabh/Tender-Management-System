import React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { surfaceStyle } from "@/app/styles";

interface Props {
  title: string;
  icon: LucideIcon;
  /** Shown on the right of the section header */
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

const ProfileSection = ({
  title,
  icon: Icon,
  action,
  className,
  children,
}: Props) => (
  <section className={cn(surfaceStyle, "overflow-hidden", className)}>
    <header className='flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5'>
      <h2 className='flex items-center gap-2 text-sm font-semibold text-slate-900'>
        <Icon
          aria-hidden
          className='size-4 text-primary'
        />
        {title}
      </h2>
      {action}
    </header>
    <div className='px-5 py-4'>{children}</div>
  </section>
);

export default ProfileSection;
