import { cn } from "@/lib/utils";

interface Props {
  percent: number;
  /** id of the element that names the meter */
  labelledBy: string;
  className?: string;
}

const CompletenessMeter = ({ percent, labelledBy, className }: Props) => (
  <div
    role='progressbar'
    aria-labelledby={labelledBy}
    aria-valuenow={percent}
    aria-valuemin={0}
    aria-valuemax={100}
    className={cn("h-1.5 overflow-hidden rounded-full bg-slate-100", className)}>
    <div
      className='h-full rounded-full bg-primary transition-[width]'
      style={{ width: `${percent}%` }}
    />
  </div>
);

export default CompletenessMeter;
