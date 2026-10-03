// Vendors see ranked bids as selected; the ranking itself stays internal
export const toVendorBidStatus = (status: string) =>
  status === "ranked" ? "selected" : status;
