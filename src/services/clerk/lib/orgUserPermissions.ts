import { auth } from "@clerk/nextjs/server";

type UserPermission =
  | "org:application:applicant_change_rating"
  | "org:application:applicant_change_state"
  | "org:job_listing:job_listing_change_status"
  | "org:job_listing:job_listing_create"
  | "org:job_listing:job_listing_delete"
  | "org:job_listing:job_listing_update";

export async function hasOrgUserPermission(permission: UserPermission) {
  const { has } = await auth();
  return has({ permission });
}
