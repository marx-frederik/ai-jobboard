import { db } from "@/drizzle/db";
import { JobListingTable } from "@/drizzle/schema";
import getCurrentOrganization from "@/services/clerk/lib/getCurrentOrganization";
import { hasPlanFeature } from "@/services/clerk/lib/planFeatures";
import { count, eq, and } from "drizzle-orm";

export async function hasReachedMaxFeaturedJobListings() {
  const { orgId } = await getCurrentOrganization();
  if (orgId == null) return true;

  const count = await getPublishedJobListingsCount(orgId);

  const canPost = await Promise.all([
    hasPlanFeature("post_1_job_listings").then((res) => res && count < 1),
    hasPlanFeature("post_3_job_listings").then((res) => res && count < 3),
    hasPlanFeature("post_15_job_listings").then((res) => res && count < 15),
  ]);
  return !canPost.some(Boolean);
}

async function getPublishedJobListingsCount(orgId: string) {
  //TODO: cache
  const [res] = await db
    .select({ count: count() })
    .from(JobListingTable)
    .where(and(eq(JobListingTable.organizationId, orgId)));
  return res?.count ?? 0;
}