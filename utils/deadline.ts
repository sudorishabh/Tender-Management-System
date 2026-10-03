/** Urgency tone for the deadline pill. Tighter window = louder colour. */
export const getDeadlineTone = (days: number) => {
  if (days <= 2) return "bg-red-50 text-red-700 border-red-200";
  if (days <= 7) return "bg-amber-50 text-amber-800 border-amber-200";
  return "bg-neutral-50 text-neutral-600 border-neutral-300";
};

export const getDeadlineLabel = (days: number) => {
  if (days === 0) return "Closes today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
};
