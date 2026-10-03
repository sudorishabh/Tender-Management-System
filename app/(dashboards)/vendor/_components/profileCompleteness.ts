import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/trpc/routers";

export type VendorProfileDetails =
  inferRouterOutputs<AppRouter>["vendor"]["getMyProfile"]["vendorDetails"];

const hasValue = (value: string | number | null | undefined) =>
  value !== null && value !== undefined && String(value).trim() !== "";

// Details a vendor can fill in from the profile edit form. Registration
// documents are left out because vendors cannot upload them afterwards.
// Labels are lower case so they read naturally mid-sentence.
const profileChecks: {
  label: string;
  isFilled: (profile: VendorProfileDetails) => boolean;
}[] = [
  { label: "contact number", isFilled: (p) => hasValue(p.user.vendor_contact) },
  {
    label: "alternate contact",
    isFilled: (p) => hasValue(p.user.vendor_alt_contact),
  },
  {
    label: "legal name",
    isFilled: (p) => hasValue(p.business?.biz_legal_name),
  },
  {
    label: "trade name",
    isFilled: (p) => hasValue(p.business?.biz_trade_name),
  },
  {
    label: "business classification",
    isFilled: (p) => hasValue(p.business?.biz_classification),
  },
  {
    label: "year established",
    isFilled: (p) => hasValue(p.business?.biz_established_year),
  },
  {
    label: "GST number",
    isFilled: (p) => hasValue(p.business?.biz_gst_number),
  },
  {
    label: "business address",
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
    isFilled: (p) => hasValue(p.business?.biz_email),
  },
  {
    label: "business phone",
    isFilled: (p) => hasValue(p.business?.biz_phone),
  },
  {
    label: "3-year turnover",
    isFilled: (p) => hasValue(p.business?.biz_3_year_turnover),
  },
  {
    label: "employee count",
    isFilled: (p) => hasValue(p.business?.biz_employee_count),
  },
];

export const getProfileCompleteness = (profile: VendorProfileDetails) => {
  const missing = profileChecks
    .filter((check) => !check.isFilled(profile))
    .map((check) => check.label);
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
