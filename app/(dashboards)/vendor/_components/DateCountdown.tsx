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

const DateCountdown = ({ date }: { date: Date | string | null }) => {
  const days = getDaysUntil(date);
  if (days === null || days < 0) return null;

  const isUrgent = days <= URGENT_WITHIN_DAYS;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap text-xs",
        isUrgent ? "font-medium text-amber-700" : "text-slate-500",
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
