import {
  adminProcedure,
  publicProcedure,
  router,
  vendorProcedure,
} from "../../trpc";
import { handleProcedureError } from "../../errorHandler";
import {
  answerClarificationSchema,
  askClarificationSchema,
  tenderClarificationsSchema,
} from "./clarification.schema";
import {
  adminTenderClarifications,
  answerClarification,
  askClarification,
  tenderClarifications,
} from "./clarification.service";

export const clarificationRouter = router({
  // Answered questions for a tender, plus the vendor's own pending ones (public)
  getForTender: publicProcedure
    .input(tenderClarificationsSchema)
    .query(async ({ input, ctx }) => {
      try {
        const user = ctx.session?.user;
        const result = await tenderClarifications(
          input.tenderId,
          user ? { userId: Number(user.id), role: user.role } : undefined
        );
        return { success: true, ...result };
      } catch (error) {
        throw handleProcedureError(error, "Failed to fetch clarifications");
      }
    }),

  // Ask a clarification question (approved vendors only)
  ask: vendorProcedure
    .input(askClarificationSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        return await askClarification(Number(ctx.user.id), input);
      } catch (error) {
        throw handleProcedureError(error, "Failed to submit question");
      }
    }),

  // All questions on a tender with the asking business (admin)
  getForAdmin: adminProcedure
    .input(tenderClarificationsSchema)
    .query(async ({ input }) => {
      try {
        const result = await adminTenderClarifications(input.tenderId);
        return { success: true, ...result };
      } catch (error) {
        throw handleProcedureError(error, "Failed to fetch clarifications");
      }
    }),

  // Answer or edit the answer to a question (admin)
  answer: adminProcedure
    .input(answerClarificationSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        return await answerClarification(Number(ctx.user.id), input);
      } catch (error) {
        throw handleProcedureError(error, "Failed to save answer");
      }
    }),
});
