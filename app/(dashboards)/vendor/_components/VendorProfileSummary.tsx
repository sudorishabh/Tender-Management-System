import React from "react";
import Link from "next/link";
import {
  Building2,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { surfaceStyle } from "@/app/styles";
import StatusBadge from "@/components/Shared/StatusBadge";

interface VendorProfile {
  user: {
    email: string | null;
    vendor_status: string;
    vendor_contact: string | null;
  };
  business: {
    biz_trade_name: string | null;
    biz_legal_name: string | null;
  } | null;
}

interface Props {
  profile?: VendorProfile;
}

const ProfileField = ({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) => (
  <div className='flex items-start gap-3'>
    <Icon
      aria-hidden
      className='mt-0.5 size-4 shrink-0 text-slate-400'
    />
    <div className='min-w-0'>
      <dt className='text-xs text-slate-500'>{label}</dt>
      <dd className='mt-0.5 truncate text-sm font-medium text-slate-900'>
        {children}
      </dd>
    </div>
  </div>
);

const VendorProfileSummary = ({ profile }: Props) => (
  <section className={cn(surfaceStyle, "overflow-hidden")}>
    <header className='flex items-center justify-between border-b border-slate-100 px-5 py-3.5'>
      <h2 className='flex items-center gap-2 text-sm font-semibold text-slate-900'>
        <UserRound
          aria-hidden
          className='size-4 text-primary'
        />
        Your profile
      </h2>
      <Link
        href='/vendor/profile'
        className='text-xs font-medium text-primary hover:underline'>
        Edit profile
      </Link>
    </header>
    {profile ? (
      <dl className='space-y-4 px-5 py-4'>
        <ProfileField
          label='Organisation'
          icon={Building2}>
          {profile.business?.biz_trade_name ||
            profile.business?.biz_legal_name ||
            "Not added"}
        </ProfileField>
        <ProfileField
          label='Account status'
          icon={ShieldCheck}>
          <StatusBadge status={profile.user.vendor_status} />
        </ProfileField>
        <ProfileField
          label='Email'
          icon={Mail}>
          <span title={profile.user.email ?? undefined}>
            {profile.user.email || "Not added"}
          </span>
        </ProfileField>
        <ProfileField
          label='Phone'
          icon={Phone}>
          {profile.user.vendor_contact || "Not added"}
        </ProfileField>
      </dl>
    ) : (
      <p className='px-5 py-10 text-center text-sm text-slate-500'>
        Profile information not available.
      </p>
    )}
  </section>
);

export default VendorProfileSummary;
