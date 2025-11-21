import { auth } from "@clerk/nextjs/server";

type PlanFeature =
  | "unlimited_featured_listings"
  | "1_featured_job_listing"
  | "post_15_job_listings"
  | "post_3_job_listings"
  | "post_1_job_listings"

export async function hasPlanFeature(feature: PlanFeature) {
  const { has } = await auth();
  return has({ feature });
}
