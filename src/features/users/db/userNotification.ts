import { db } from "@/drizzle/db";
import { UserNotificationSettingsTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function insertUserNotificationSettings(
  settings: typeof UserNotificationSettingsTable.$inferInsert
) {
  await db
    .insert(UserNotificationSettingsTable)
    .values(settings)
    .onConflictDoNothing();
}

export async function getUserNotificationSettings(userId: string) {
  return await db.query.UserNotificationSettingsTable.findFirst({
    where: eq(UserNotificationSettingsTable.userId, userId),
  });
}

export async function updateUserNotificationsSettings(
  userId: string,
  data: Partial<
    Omit<typeof UserNotificationSettingsTable.$inferInsert, "userId">
  >
) {
  await db
    .insert(UserNotificationSettingsTable)
    .values({ ...data, userId })
    .onConflictDoUpdate({
      target: UserNotificationSettingsTable.userId,
      set: data,
    });
}
