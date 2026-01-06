import z from "zod";

export const UserNotificationSettingsSchema = z.object({
    newJobEmailNotifications: z.boolean(),
    aiPrompt: z
      .string()
      .transform(val => (val.trim() === "" ? null : val))
      .nullable(),
  })