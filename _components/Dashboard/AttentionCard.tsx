import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";

interface Props {
  count: number;
  /** Text after the count, already pluralised, e.g. "tenders ready for bid review" */
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
}

const AttentionCard = ({ count, title, description, icon: Icon, href }: Props) => (
  <Link
    href={href}
    className='group flex items-center gap-4 rounded-xl border border-amber-200 bg-white p-4 shadow-sm transition hover:border-amber-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50'>
    <span className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600'>
      <Icon
        aria-hidden
        className='size-5'
      />
    </span>
    <div className='min-w-0 flex-1'>
      <p className='text-sm text-slate-900'>
        <span className='font-semibold'>{count}</span> {title}
      </p>
      <p className='truncate text-xs text-slate-500'>{description}</p>
    </div>
    <ChevronRight
      aria-hidden
      className='size-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5'
    />
  </Link>
);

export default AttentionCard;
