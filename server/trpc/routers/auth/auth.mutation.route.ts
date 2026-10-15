import {
  rateLimitedProcedure,
  router,
  superAdminProcedure,
} from "../../trpc";
import { handleProcedureError } from "../../errorHandler";
import {
  acceptAdminInviteSchema,
  sendAdminInviteSchema,
  vendorRegistrationSchema,
} from "./auth.schema";
import {
  acceptAdminInvite,
  registerVendorService,
  sendAdminInvite,
} from "./auth.service";

const HOUR_MS = 60 * 60 * 1000;

export const authMutationRoute = router({
  // Limited per address: each registration sends two emails
  register: rateLimitedProcedure("register", 10, HOUR_MS)
    .input(vendorRegistrationSchema)
    .mutation(async ({ input }) => {
      try {
        await registerVendorService(input);
        return {
          success: true,
          message: "Registration successful. Please sign in.",
        };
      } catch (error) {
        throw handleProcedureError(error, "Registration failed");
      }
    }),

  // Accept admin invite
  acceptInvite: rateLimitedProcedure("accept-invite", 10, HOUR_MS)
    .input(acceptAdminInviteSchema)
    .mutation(async ({ input }) => {
      try {
        const result = await acceptAdminInvite(input);
        return result;
      } catch (error) {
        throw handleProcedureError(error, "Failed to accept invite");
      }
    }),

  // Send admin invite
  sendAdminInvite: superAdminProcedure
    .input(sendAdminInviteSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const userId = Number(ctx.user.id);
        const result = await sendAdminInvite(input, userId);
        return result;
      } catch (error) {
        throw handleProcedureError(error, "Failed to send admin invite");
      }
    }),
});
