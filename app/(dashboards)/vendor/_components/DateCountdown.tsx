import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDaysUntil } from "@/utils/dateUtils";

// Dates this close are highlighted so they stand out in the list
const URGENT_WITHIN_DAYS = 2;

const describeDays = (days: number) => {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
};

const toneStyles = {
  light: { normal: "text-slate-500", urgent: "text-amber-700" },
  // For navy surfaces such as the sign-in panel
  dark: { normal: "text-navy-foreground", urgent: "text-amber-300" },
};

const DateCountdown = ({
  date,
  tone = "light",
}: {
  date: Date | string | null;
  tone?: keyof typeof toneStyles;
}) => {
  const days = getDaysUntil(date);
  if (days === null || days < 0) return null;

  const isUrgent = days <= URGENT_WITHIN_DAYS;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap text-xs",
        isUrgent
          ? cn("font-medium", toneStyles[tone].urgent)
          : toneStyles[tone].normal,
      )}>
      {isUrgent && (
        <Clock
          aria-hidden
          className='size-3.5'
        />
      )}
      {describeDays(days)}
    </span>
  );
};

export default DateCountdown;
