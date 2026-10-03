import { cn } from "@/lib/utils";

type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

const toneStyles: Record<StatusTone, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
  danger: "bg-red-50 text-red-700 ring-red-600/20",
  info: "bg-sky-50 text-sky-700 ring-sky-600/20",
  neutral: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

// Tender, bid and vendor statuses share one colour language
const statusTones: Record<string, StatusTone> = {
  approved: "success",
  selected: "success",
  published: "success",
  live: "success",
  pending: "warning",
  review: "warning",
  under_review: "warning",
  ranked: "info",
  rescheduled: "info",
  rejected: "danger",
  draft: "neutral",
  closed: "neutral",
};

// "under_review" -> "Under review"
const formatStatus = (status: string) => {
  const text = status.replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
};

interface StatusBadgeProps {
  status: string;
  /** Overrides the text derived from `status` */
  label?: string;
  className?: string;
}

const StatusBadge = ({ status, label, className }: StatusBadgeProps) => {
  const tone = statusTones[status.toLowerCase()] ?? "neutral";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        toneStyles[tone],
        className,
      )}>
      <span
        aria-hidden
        className='size-1.5 rounded-full bg-current opacity-70'
      />
      {label ?? formatStatus(status)}
    </span>
  );
};

export default StatusBadge;
