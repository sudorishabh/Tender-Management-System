"use client";
import React from "react";
import {
  Building2,
  CalendarDays,
  ExternalLink,
  FileCheck2,
  FileText,
  FileX2,
  Hash,
  MapPin,
  Pencil,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { surfaceStyle } from "@/app/styles";
import { Button } from "@/_components/ui/button";
import StatusBadge from "@/_components/Shared/StatusBadge";
import PdfViewerModal from "@/_components/Shared/PdfViewerModal";
import { formatDisplayDate } from "@/utils/dateUtils";
import ProfileSection from "./ProfileSection";
import type { VendorProfileDetails } from "../../_components/profileCompleteness";

interface VendorProfileViewProps {
  data: VendorProfileDetails;
  onEdit: () => void;
}

type Business = VendorProfileDetails["business"];

const NotProvided = () => (
  <span className='font-normal text-slate-400'>Not provided</span>
);

const DetailItem = ({
  label,
  value,
  className,
  children,
}: {
  label: string;
  value?: string | number | null;
  className?: string;
  children?: React.ReactNode;
}) => {
  const hasValue = value !== null && value !== undefined && value !== "";

  return (
    <div className={cn("min-w-0", className)}>
      <dt className='text-xs text-slate-500'>{label}</dt>
      <dd className='mt-1 break-words text-sm font-medium text-slate-900'>
        {children ?? (hasValue ? value : <NotProvided />)}
      </dd>
    </div>
  );
};

const DetailList = ({ children }: { children: React.ReactNode }) => (
  <dl className='grid gap-x-6 gap-y-4 sm:grid-cols-2'>{children}</dl>
);

const MetaItem = ({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) => (
  <span className='inline-flex items-center gap-1.5'>
    <Icon
      aria-hidden
      className='size-3.5 text-slate-400'
    />
    {children}
  </span>
);

// "Asha Rao" -> "AR", falling back to the email's first letter
const getInitials = (name: string | null, email: string | null) => {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length > 0) {
    return words
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }
  return (email?.[0] ?? "V").toUpperCase();
};

// One address part per line: street, area, region, country
const getAddressLines = (business: Business) => {
  if (!business) return [];

  return [
    [business.biz_addr_line1, business.biz_addr_line2],
    [business.biz_locality, business.biz_city],
    [business.biz_state, business.biz_pin_code],
    [business.biz_country],
  ]
    .map((parts) => parts.filter(Boolean).join(", "))
    .filter(Boolean);
};

const WebsiteLink = ({ url }: { url: string }) => (
  <a
    href={url.startsWith("http") ? url : `https://${url}`}
    target='_blank'
    rel='noopener noreferrer'
    className='inline-flex items-center gap-1 text-primary hover:underline'>
    {url}
    <ExternalLink
      aria-hidden
      className='size-3'
    />
  </a>
);

const DocumentRow = ({
  label,
  docKey,
}: {
  label: string;
  docKey: string | null | undefined;
}) => (
  <li className='flex items-center justify-between gap-3 py-2.5'>
    <span className='flex min-w-0 items-center gap-2.5 text-sm text-slate-700'>
      {docKey ? (
        <FileCheck2
          aria-hidden
          className='size-4 shrink-0 text-emerald-600'
        />
      ) : (
        <FileX2
          aria-hidden
          className='size-4 shrink-0 text-slate-300'
        />
      )}
      <span className='truncate'>{label}</span>
    </span>
    {docKey ? (
      <PdfViewerModal
        isS3File={true}
        value={docKey}
        triggerButton={
          <Button
            variant='ghost'
            size='sm'
            className='h-7 shrink-0 px-2 text-xs text-primary hover:text-primary'>
            View
          </Button>
        }
      />
    ) : (
      <span className='shrink-0 text-xs text-slate-400'>Not uploaded</span>
    )}
  </li>
);

const VendorProfileView: React.FC<VendorProfileViewProps> = ({
  data,
  onEdit,
}) => {
  const { user, business } = data;
  const organisation = business?.biz_trade_name || business?.biz_legal_name;
  const addressLines = getAddressLines(business);

  const documents = [
    { label: "PAN card", docKey: user.vendor_pan_doc_key },
    { label: "Aadhaar card", docKey: user.vendor_adhar_doc_key },
    { label: "Business registration", docKey: business?.biz_reg_doc_key },
    { label: "GST certificate", docKey: business?.biz_gst_doc_key },
    { label: "MSME certificate", docKey: business?.biz_msme_cert_doc_key },
    { label: "Bank document", docKey: business?.biz_bank_doc_key },
  ];
  const uploadedCount = documents.filter((doc) => doc.docKey).length;

  return (
    <div className='space-y-6'>
      {/* Identity header */}
      <section
        className={cn(
          surfaceStyle,
          "flex flex-col gap-4 p-5 sm:flex-row sm:items-center",
        )}>
        <span
          aria-hidden
          className='flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary'>
          {getInitials(user.full_name, user.email)}
        </span>
        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <h2 className='truncate text-lg font-semibold text-slate-900'>
              {user.full_name || "Unnamed vendor"}
            </h2>
            <StatusBadge status={user.vendor_status} />
          </div>
          <p className='mt-0.5 truncate text-sm text-slate-600'>
            {organisation || "Organisation not added"}
          </p>
          <div className='mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500'>
            {user.vendor_code && (
              <MetaItem icon={Hash}>Vendor code {user.vendor_code}</MetaItem>
            )}
            {user.created_at && (
              <MetaItem icon={CalendarDays}>
                Member since {formatDisplayDate(user.created_at)}
              </MetaItem>
            )}
          </div>
        </div>
        <Button
          onClick={onEdit}
          className='shrink-0 self-start sm:self-center'>
          <Pencil
            aria-hidden
            className='size-4'
          />
          Edit profile
        </Button>
      </section>

      <div className='grid gap-6 lg:grid-cols-3'>
        <div className='space-y-6 lg:col-span-2'>
          <ProfileSection
            title='Contact person'
            icon={UserRound}>
            <DetailList>
              <DetailItem
                label='Full name'
                value={user.full_name}
              />
              <DetailItem
                label='Login email'
                value={user.email}
              />
              <DetailItem
                label='Contact number'
                value={user.vendor_contact}
              />
              <DetailItem
                label='Alternate contact'
                value={user.vendor_alt_contact}
              />
              <DetailItem
                label='PAN number'
                value={user.vendor_pan_number}
              />
            </DetailList>
          </ProfileSection>

          <ProfileSection
            title='Business'
            icon={Building2}>
            <DetailList>
              <DetailItem
                label='Legal name'
                value={business?.biz_legal_name}
              />
              <DetailItem
                label='Trade name'
                value={business?.biz_trade_name}
              />
              <DetailItem
                label='Classification'
                value={business?.biz_classification}
              />
              <DetailItem
                label='Registration number'
                value={business?.biz_reg_number}
              />
              <DetailItem
                label='Year established'
                value={business?.biz_established_year}
              />
              <DetailItem
                label='GST number'
                value={business?.biz_gst_number}
              />
              <DetailItem
                label='Employees'
                value={business?.biz_employee_count}
              />
              <DetailItem
                label='3-year turnover'
                value={business?.biz_3_year_turnover}
              />
            </DetailList>
          </ProfileSection>

          <ProfileSection
            title='Business contact & address'
            icon={MapPin}>
            <DetailList>
              <DetailItem
                label='Business email'
                value={business?.biz_email}
              />
              <DetailItem
                label='Business phone'
                value={business?.biz_phone}
              />
              <DetailItem label='Website'>
                {business?.biz_website ? (
                  <WebsiteLink url={business.biz_website} />
                ) : (
                  <NotProvided />
                )}
              </DetailItem>
              <DetailItem
                label='Address'
                className='sm:col-span-2'>
                {addressLines.length > 0 ? (
                  addressLines.map((line, index) => (
                    <span
                      key={index}
                      className='block'>
                      {line}
                    </span>
                  ))
                ) : (
                  <NotProvided />
                )}
              </DetailItem>
            </DetailList>
          </ProfileSection>
        </div>

        <aside className='space-y-6'>
          <ProfileSection
            title='Documents'
            icon={FileText}
            action={
              <span className='text-xs text-slate-500'>
                {uploadedCount} of {documents.length} uploaded
              </span>
            }>
            <ul className='-my-2.5 divide-y divide-slate-100'>
              {documents.map((doc) => (
                <DocumentRow
                  key={doc.label}
                  label={doc.label}
                  docKey={doc.docKey}
                />
              ))}
            </ul>
            <p className='mt-4 text-xs text-slate-500'>
              Documents uploaded during registration can&apos;t be changed
              here. Contact the tender team to replace one.
            </p>
          </ProfileSection>
        </aside>
      </div>
    </div>
  );
};

export default VendorProfileView;
