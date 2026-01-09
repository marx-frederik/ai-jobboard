"use server"
import z from "zod";
import { OrganizationUserSettingsSchema } from "./schemas";
import getCurrentUser from "@/services/clerk/lib/getCurrentUser";
import getCurrentOrganization from "@/services/clerk/lib/getCurrentOrganization";
import { updateOrganizationUserSettings as updateOrganizationUserSettingsDb } from "@/features/organizations/db/organizationUserSettings";

export async function updateOrganizationUserSettings(
  unsafeData: z.infer<typeof OrganizationUserSettingsSchema>
) {
  const { userId } = await getCurrentUser();
  const { orgId } = await getCurrentOrganization();

  if (userId == null || orgId == null) {
    return {
      error: true,
      message: "You don't have permission to update the notification settings",
    };
  }

  const { success, data } =
    OrganizationUserSettingsSchema.safeParse(unsafeData);
  if (!success) {
    return {
      error: true,
      message:
        "There was an error trying to update your notification settings.",
    };
  }
  await updateOrganizationUserSettingsDb(
    { userId, organizationId: orgId },
    data
  );
  return {
    error: false,
    message: "Your notifiction settings have been updated successfully",
  };
}
