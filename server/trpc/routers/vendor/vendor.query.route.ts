import {
  router,
  protectedProcedure,
  adminProcedure,
  vendorProcedure,
} from "../../trpc";
import { TRPCError } from "@trpc/server";
import { handleProcedureError } from "../../errorHandler";
import { ROLES } from "@/lib/server/constants";

import {
  vendors,
  vendorDetails,
  vendorForSelection,
  vendorProfileByUserId,
  vendorDashboard,
  vendorTenderLinks,
} from "./vendor.service";
import { z } from "zod";
import { vendorForSelectionSchema, vendorsQuerySchema } from "./vendor.schema";

/**
 * Vendor Router - Uses Next.js backend services
 */
export const vendorQueryRoute = router({
  // Get all vendors (admin only)
  getAll: adminProcedure.input(vendorsQuerySchema).query(async ({ input }) => {
    try {
      const result = await vendors(input);
      return { success: true, ...result };
    } catch (error) {
      throw handleProcedureError(error, "Failed to fetch vendors");
    }
  }),

  // Get vendor details (admin can see all, vendor can only see own)
  getDetails: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      try {
        const result = await vendorDetails(input);

        // Authorization: Admin/Super can see all vendors, vendor can only see themselves
        const userRole = ctx.user.role;
        if (userRole === ROLES.VENDOR) {
          const userId = Number(ctx.user.id);
          // Check if the requested vendor profile belongs to this user
          if (result.vendor?.user_id !== userId) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You can only view your own profile",
            });
          }
        }

        return { success: true, ...result };
      } catch (error) {
        // Re-throw TRPCErrors (like FORBIDDEN) as-is
        if (error instanceof TRPCError) {
          throw error;
        }
        throw handleProcedureError(error, "Vendor not found");
      }
    }),

  // Get vendors for selection (admin)
  getForSelection: adminProcedure
    .input(vendorForSelectionSchema)
    .query(async ({ input }) => {
      try {
        const result = await vendorForSelection(input);
        return { success: true, ...result };
      } catch (error) {
        throw handleProcedureError(error, "Failed to fetch vendors");
      }
    }),

  // Get vendor's own profile (vendor only)
  getMyProfile: vendorProcedure.query(async ({ ctx }) => {
    try {
      const userId = Number(ctx.user.id);
      const result = await vendorProfileByUserId(userId);
      return { success: true, ...result };
    } catch (error) {
      throw handleProcedureError(error, "Profile not found");
    }
  }),

  // Get dashboard summary for the signed-in vendor (vendor only)
  getDashboard: vendorProcedure.query(async ({ ctx }) => {
    try {
      const result = await vendorDashboard(Number(ctx.user.id));
      return { success: true, ...result };
    } catch (error) {
      throw handleProcedureError(error, "Failed to fetch vendor dashboard");
    }
  }),

  // Tender ids the signed-in vendor has bid on or been invited to (vendor only)
  getMyTenderLinks: vendorProcedure.query(async ({ ctx }) => {
    try {
      const result = await vendorTenderLinks(Number(ctx.user.id));
      return { success: true, ...result };
    } catch (error) {
      throw handleProcedureError(error, "Failed to fetch vendor tender links");
    }
  }),
});
