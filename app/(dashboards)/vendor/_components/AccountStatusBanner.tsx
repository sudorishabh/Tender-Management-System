import Link from "next/link";
import { Clock, ShieldX } from "lucide-react";
import { cn } from "@/lib/utils";

type BlockedStatus = "pending" | "rejected";

interface Props {
  status: BlockedStatus | "approved";
  rejectionReason: string | null;
  /** Hide the link when the banner is already on the profile page */
  showProfileLink?: boolean;
}

// Only approved vendors can submit bids, so the other states explain why
const variants = {
  pending: {
    icon: Clock,
    title: "Your account is awaiting approval",
    description:
      "You can browse tenders now. Bids can be submitted once an administrator approves your registration.",
    className: "border-amber-200 bg-amber-50",
    iconClassName: "text-amber-600",
  },
  rejected: {
    icon: ShieldX,
    title: "Your registration was not approved",
    description:
      "Bids can't be submitted from this account. Review your profile details or contact the tender team.",
    className: "border-red-200 bg-red-50",
    iconClassName: "text-red-600",
  },
} satisfies Record<BlockedStatus, object>;

const AccountStatusBanner = ({
  status,
  rejectionReason,
  showProfileLink = true,
}: Props) => {
  if (status === "approved") return null;

  const { icon: Icon, title, description, className, iconClassName } =
    variants[status];

  return (
    <div
      role='status'
      className={cn("flex items-start gap-3 rounded-xl border p-4", className)}>
      <Icon
        aria-hidden
        className={cn("mt-0.5 size-5 shrink-0", iconClassName)}
      />
      <div className='min-w-0 flex-1 text-sm'>
        <p className='font-semibold text-slate-900'>{title}</p>
        <p className='mt-0.5 text-slate-600'>{description}</p>
        {status === "rejected" && rejectionReason && (
          <p className='mt-2 text-slate-700'>
            <span className='font-medium'>Reason:</span> {rejectionReason}
          </p>
        )}
      </div>
      {showProfileLink && (
        <Link
          href='/vendor/profile'
          className='shrink-0 text-xs font-medium text-primary hover:underline'>
          Review profile
        </Link>
      )}
    </div>
  );
};

export default AccountStatusBanner;
