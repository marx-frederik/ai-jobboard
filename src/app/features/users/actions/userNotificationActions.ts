import getCurrentUser from "@/services/clerk/lib/getCurrentUser";
import z from "zod";
import { UserNotificationSettingsSchema } from "./schemas";
import { updateUserNotificationsSettings as updateUserNotificationsSettingsDb } from "@/";
import {insert} from "@/"
export async function updateUserNotificationsSettings(
  unsafeData: z.infer<typeof UserNotificationSettingsSchema>
) {
  const { userId } = await getCurrentUser();
  if (userId == null)
    return {
      error: true,
      message: "You need to be signed in to update your notification settings.",
    };

  const { success, data } =
    UserNotificationSettingsSchema.safeParse(unsafeData);
  if (!success)
    return {
      error: true,
      message: "There was an error updating your notification settings.",
    };

  await updateUserNotificationsSettingsDb(userId, data);

  return {
    error: false,
    message: "Your Settings have been updated successfully.",
  };
}
