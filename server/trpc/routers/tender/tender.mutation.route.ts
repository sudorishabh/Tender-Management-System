import { router, adminProcedure, superAdminProcedure } from "../../trpc";
import { handleProcedureError } from "../../errorHandler";
import { createTender, saveTender, deleteSavedTender } from "./tender.service";
import {
  createTenderSchema,
  saveTenderSchema,
  deleteSavedTenderSchema,
  updateTenderStatusSchema,
  updateLiveTenderSchema,
} from "./tender.schema";
import { updateTenderStatusService, updateLiveTenderService } from "./tender.service.helper";
import { TENDER_STATUS } from "@/lib/server/constants";

export const tenderMutationRoute = router({
  // Create tender (admin only) 👍
  create: adminProcedure
    .input(createTenderSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const userId = Number(ctx.user.id);
        const result = await createTender(input, userId);
        return result;
      } catch (error) {
        throw handleProcedureError(error, "Failed to create tender");
      }
    }),

  // Save tender draft (admin only) 👍
  save: adminProcedure
    .input(saveTenderSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const userId = Number(ctx.user.id);
        const result = await saveTender(
          input as Parameters<typeof saveTender>[0],
          userId
        );
        return result;
      } catch (error) {
        throw handleProcedureError(error, "Failed to save tender");
      }
    }),

  // Delete saved tender (admin only)
  deleteSaved: adminProcedure
    .input(deleteSavedTenderSchema)
    .mutation(async ({ input }) => {
      try {
        const result = await deleteSavedTender(input);
        return result;
      } catch (error) {
        throw handleProcedureError(error, "Failed to delete tender");
      }
    }),

  // Update (edit) a published live tender (admin only)
  updateLiveTender: adminProcedure
    .input(updateLiveTenderSchema)
    .mutation(async ({ input }) => {
      try {
        const result = await updateLiveTenderService(input);
        return result;
      } catch (error) {
        throw handleProcedureError(error, "Failed to update tender");
      }
    }),

  // Publish or reschedule a tender in review (super admin only, so an admin
  // can't approve their own tender)
  tenderStatusUpdateSuperAdmin: superAdminProcedure
    .input(updateTenderStatusSchema)
    .mutation(async ({ input }) => {
      try {
        const result = await updateTenderStatusService({
          ...input,
          tender_status: input.tender_status as TENDER_STATUS,
        });
        return result;
      } catch (error) {
        throw handleProcedureError(error, "Failed to update tender status");
      }
    }),
});
