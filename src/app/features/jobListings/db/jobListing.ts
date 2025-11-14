import { db } from "@/drizzle/db";
import { JobListingTable } from "@/drizzle/schema";
export async function insertJobListing(
  data: typeof JobListingTable.$inferInsert
) {
  const [result] =  await db.insert(JobListingTable).values(data).returning({
    id: JobListingTable.id,
    organizationId: JobListingTable.organizationId,
  });
  return result
}
