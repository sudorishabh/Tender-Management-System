import { router, adminProcedure, vendorProcedure } from "../../trpc";
import { z } from "zod";
import { handleProcedureError } from "../../errorHandler";
import {
  tenderBids,
  bidById,
  allBids,
  vendorPurchasedBids,
  vendorApprovedBids,
  approvedBids,
  isBidSubmitted,
} from "./bid.service";

import {
  tenderBidsSchema,
  vendorPurchasedBidsSchema,
  vendorApprovedBidsSchema,
  allBidsQuerySchema,
  isBidSubmittedSchema,
} from "./bid.schema";

/**
 * Bid Router - Uses Next.js backend services
 */
export const bidQueryRoute = router({
  // Get all bids (admin)
  getAll: adminProcedure
    .input(allBidsQuerySchema.optional())
    .query(async ({ input }) => {
      try {
        const result = await allBids(input?.page, input?.limit);
        return { success: true, ...result };
      } catch (error) {
        throw handleProcedureError(error, "Failed to fetch bids");
      }
    }),

  // Get tender bids (admin only)
  getTenderBids: adminProcedure
    .input(tenderBidsSchema)
    .query(async ({ input }) => {
      try {
        const result = await tenderBids(input.tenderId);
        return { success: true, data: result };
      } catch (error) {
        throw handleProcedureError(error, "Failed to fetch tender bids");
      }
    }),

  // Get bid by ID (admin only: the result includes the vendor's KYC details)
  getById: adminProcedure.input(z.string()).query(async ({ input }) => {
    try {
      const data = await bidById(input);
      return { success: true, ...data };
    } catch (error) {
      throw handleProcedureError(error, "Bid not found");
    }
  }),

  // Get vendor purchased bids — userId always taken from session (IDOR prevention)
  getVendorPurchasedBids: vendorProcedure
    .input(vendorPurchasedBidsSchema)
    .query(async ({ ctx }) => {
      try {
        const result = await vendorPurchasedBids(ctx.user.id);
        return { success: true, result };
      } catch (error) {
        throw handleProcedureError(
          error,
          "Failed to fetch vendor purchased bids"
        );
      }
    }),

  // Get vendor approved bids — userId always taken from session (IDOR prevention)
  getVendorApprovedBids: vendorProcedure
    .input(vendorApprovedBidsSchema)
    .query(async ({ input, ctx }) => {
      try {
        const result = await vendorApprovedBids(
          ctx.user.id,
          input.page,
          input.limit
        );
        return { success: true, ...result };
      } catch (error) {
        throw handleProcedureError(
          error,
          "Failed to fetch vendor approved bids"
        );
      }
    }),

  // Get approved bids
  getApprovedBids: adminProcedure
    .input(allBidsQuerySchema.optional())
    .query(async ({ input }) => {
      try {
        const result = await approvedBids(input?.page, input?.limit);
        return { success: true, ...result };
      } catch (error) {
        throw handleProcedureError(error, "Failed to fetch approved bids");
      }
    }),

  // Check if bid submitted by vendor for a tender — userId always from session (IDOR prevention)
  isBidSubmitted: vendorProcedure
    .input(isBidSubmittedSchema)
    .query(async ({ input, ctx }) => {
      try {
        const result = await isBidSubmitted(input.tenderId, ctx.user.id);
        return { success: true, ...result };
      } catch (error) {
        throw handleProcedureError(error, "Failed to check bid submission");
      }
    }),
});
