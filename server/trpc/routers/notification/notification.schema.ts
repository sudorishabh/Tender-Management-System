import { z } from "zod";

// Omit ids to mark every unread notification as read
export const markNotificationsReadSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1).optional(),
});

export type MarkNotificationsReadInput = z.infer<
  typeof markNotificationsReadSchema
>;
