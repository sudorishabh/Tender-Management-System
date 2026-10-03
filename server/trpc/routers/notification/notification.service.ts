import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/server/db";
import { notificationsTable } from "@/server/db/schema";
import { ApiError, InternalServerError } from "@/lib/server/errors";

// Notifications shown in the top bar list
const NOTIFICATION_LIST_SIZE = 20;

export type NewNotification = Pick<
  typeof notificationsTable.$inferInsert,
  "user_id" | "notif_title" | "notif_message" | "notif_type" | "notif_link"
>;

// MUTATION
////////////////////////////////////////////////////////////////////

/**
 * Store in-app notifications. Never throws: a notification failure (for
 * example before the notifications migration is applied) must not undo or
 * fail the action that triggered it.
 */
export const notifyUsers = async (notifications: NewNotification[]) => {
  if (notifications.length === 0) return;

  try {
    await db.insert(notificationsTable).values(notifications);
  } catch (error) {
    console.error("Failed to store notifications:", error);
  }
};

/**
 * Mark the user's notifications as read, either the given ids or all of them
 */
export const markNotificationsRead = async (userId: number, ids?: number[]) => {
  try {
    await db
      .update(notificationsTable)
      .set({ notif_is_read: true })
      .where(
        and(
          eq(notificationsTable.user_id, userId),
          eq(notificationsTable.notif_is_read, false),
          ids ? inArray(notificationsTable.notif_id, ids) : undefined
        )
      );

    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new InternalServerError(
      "Failed to update notifications",
      "MARK_NOTIFICATIONS_READ_ERROR"
    );
  }
};

// QUERY
////////////////////////////////////////////////////////////////////

/**
 * Latest notifications and the unread count for a user
 */
export const myNotifications = async (userId: number) => {
  try {
    const [notifications, unreadCount] = await Promise.all([
      db
        .select({
          notif_id: notificationsTable.notif_id,
          notif_title: notificationsTable.notif_title,
          notif_message: notificationsTable.notif_message,
          notif_type: notificationsTable.notif_type,
          notif_link: notificationsTable.notif_link,
          notif_is_read: notificationsTable.notif_is_read,
          created_at: notificationsTable.created_at,
        })
        .from(notificationsTable)
        .where(eq(notificationsTable.user_id, userId))
        .orderBy(
          desc(notificationsTable.created_at),
          desc(notificationsTable.notif_id)
        )
        .limit(NOTIFICATION_LIST_SIZE),
      db.$count(
        notificationsTable,
        and(
          eq(notificationsTable.user_id, userId),
          eq(notificationsTable.notif_is_read, false)
        )
      ),
    ]);

    return { notifications, unreadCount };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new InternalServerError(
      "Failed to fetch notifications",
      "FETCH_NOTIFICATIONS_ERROR"
    );
  }
};
