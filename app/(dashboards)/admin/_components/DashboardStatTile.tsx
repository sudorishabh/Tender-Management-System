import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { surfaceStyle } from "@/app/styles";

interface Props {
  label: string;
  value: number;
  icon: LucideIcon;
  href: string;
  /** Short breakdown under the value, e.g. "4 accepting bids · 2 drafts" */
  detail?: string;
}

const numberFormat = new Intl.NumberFormat("en-IN");

const DashboardStatTile = ({ label, value, icon: Icon, href, detail }: Props) => (
  <Link
    href={href}
    className={cn(
      surfaceStyle,
      "p-5 transition hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
    )}>
    <div className='flex items-center justify-between gap-3'>
      <p className='text-sm font-medium text-slate-500'>{label}</p>
      <span className='flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary'>
        <Icon
          aria-hidden
          className='size-[18px]'
        />
      </span>
    </div>
    <p className='mt-3 text-3xl font-semibold tracking-tight text-slate-900'>
      {numberFormat.format(value)}
    </p>
    {detail && <p className='mt-1 text-xs text-slate-500'>{detail}</p>}
  </Link>
);

export default DashboardStatTile;
