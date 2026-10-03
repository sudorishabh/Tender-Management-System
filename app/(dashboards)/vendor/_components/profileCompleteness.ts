import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/trpc/routers";

export type VendorProfileDetails =
  inferRouterOutputs<AppRouter>["vendor"]["getMyProfile"]["vendorDetails"];

// Profile edit form inputs that a completeness check can point to
export type ProfileFormField =
  | "user.vendor_contact"
  | "user.vendor_alt_contact"
  | "business.biz_legal_name"
  | "business.biz_trade_name"
  | "business.biz_classification"
  | "business.biz_established_year"
  | "business.biz_gst_number"
  | "business.biz_addr_line1"
  | "business.biz_email"
  | "business.biz_phone"
  | "business.biz_3_year_turnover"
  | "business.biz_employee_count";

export interface ProfileCheck {
  label: string;
  field: ProfileFormField;
  isFilled: (profile: VendorProfileDetails) => boolean;
}

const hasValue = (value: string | number | null | undefined) =>
  value !== null && value !== undefined && String(value).trim() !== "";

// Details a vendor can fill in from the profile edit form. Registration
// documents are left out because vendors cannot upload them afterwards.
// Labels are lower case so they read naturally mid-sentence.
const profileChecks: ProfileCheck[] = [
  {
    label: "contact number",
    field: "user.vendor_contact",
    isFilled: (p) => hasValue(p.user.vendor_contact),
  },
  {
    label: "alternate contact",
    field: "user.vendor_alt_contact",
    isFilled: (p) => hasValue(p.user.vendor_alt_contact),
  },
  {
    label: "legal name",
    field: "business.biz_legal_name",
    isFilled: (p) => hasValue(p.business?.biz_legal_name),
  },
  {
    label: "trade name",
    field: "business.biz_trade_name",
    isFilled: (p) => hasValue(p.business?.biz_trade_name),
  },
  {
    label: "business classification",
    field: "business.biz_classification",
    isFilled: (p) => hasValue(p.business?.biz_classification),
  },
  {
    label: "year established",
    field: "business.biz_established_year",
    isFilled: (p) => hasValue(p.business?.biz_established_year),
  },
  {
    label: "GST number",
    field: "business.biz_gst_number",
    isFilled: (p) => hasValue(p.business?.biz_gst_number),
  },
  {
    label: "business address",
    field: "business.biz_addr_line1",
    isFilled: (p) =>
      [
        p.business?.biz_addr_line1,
        p.business?.biz_city,
        p.business?.biz_state,
        p.business?.biz_pin_code,
      ].every(hasValue),
  },
  {
    label: "business email",
    field: "business.biz_email",
    isFilled: (p) => hasValue(p.business?.biz_email),
  },
  {
    label: "business phone",
    field: "business.biz_phone",
    isFilled: (p) => hasValue(p.business?.biz_phone),
  },
  {
    label: "3-year turnover",
    field: "business.biz_3_year_turnover",
    isFilled: (p) => hasValue(p.business?.biz_3_year_turnover),
  },
  {
    label: "employee count",
    field: "business.biz_employee_count",
    isFilled: (p) => hasValue(p.business?.biz_employee_count),
  },
];

export const getProfileCompleteness = (profile: VendorProfileDetails) => {
  const missing = profileChecks.filter((check) => !check.isFilled(profile));
  const filled = profileChecks.length - missing.length;

  return {
    percent: Math.round((filled / profileChecks.length) * 100),
    missing,
  };
};

// ["a"] -> "a", ["a", "b"] -> "a and b", ["a", "b", "c"] -> "a, b and 1 more"
export const summariseMissing = (labels: string[]) => {
  if (labels.length <= 2) return labels.join(" and ");
  return `${labels.slice(0, 2).join(", ")} and ${labels.length - 2} more`;
};
