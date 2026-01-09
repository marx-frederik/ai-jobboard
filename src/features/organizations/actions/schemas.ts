import z from "zod";

export const OrganizationUserSettingsSchema = z.object({
    newApplicationEmailNotifications:z.boolean(),
    minimumRating:z.number().min(1).max(5).nullable(),
})