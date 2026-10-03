import { protectedProcedure, router } from "../../trpc";
import { handleProcedureError } from "../../errorHandler";
import { markNotificationsReadSchema } from "./notification.schema";
import {
  markNotificationsRead,
  myNotifications,
} from "./notification.service";

export const notificationRouter = router({
  // Latest notifications and unread count for the signed-in user
  getMine: protectedProcedure.query(async ({ ctx }) => {
    try {
      const result = await myNotifications(Number(ctx.user.id));
      return { success: true, ...result };
    } catch (error) {
      throw handleProcedureError(error, "Failed to fetch notifications");
    }
  }),

  // Mark the given notifications, or all of them, as read
  markRead: protectedProcedure
    .input(markNotificationsReadSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await markNotificationsRead(Number(ctx.user.id), input.ids);
      } catch (error) {
        throw handleProcedureError(error, "Failed to update notifications");
      }
    }),
});
