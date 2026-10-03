/**
 * The bidding process at a glance, shown on the home sidebar and beside the
 * sign-in form. Mirrors the real flow: registration review, then the payment
 * receipt the bid form asks for. Payment methods follow the tender page's
 * instructions.
 */
export const bidSteps = [
  {
    title: "Register your business",
    detail:
      "It's free. Add your company details with your GST, PAN and registration documents.",
  },
  {
    title: "Get approved",
    detail: "TERI verifies your account. Only approved vendors can bid.",
  },
  {
    title: "Pay the fee and EMD",
    detail:
      "The fee by bank cheque and the EMD by demand draft, as set out on the tender. Keep the receipt.",
  },
  {
    title: "Submit your bid",
    detail:
      "Upload the receipt and the required documents before the deadline.",
  },
];
