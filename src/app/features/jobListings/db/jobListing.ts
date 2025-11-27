import { db } from "@/drizzle/db";
import { JobListingTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function insertJobListing(
  data: typeof JobListingTable.$inferInsert
) {
  const [result] = await db.insert(JobListingTable).values(data).returning({
    id: JobListingTable.id,
    organizationId: JobListingTable.organizationId,
  });
  return result;
}

export async function updateJobListing(
  id: string,
  jobListing: Partial<typeof JobListingTable.$inferInsert>
) {
  const [updatedListing] = await db
    .update(JobListingTable)
    .set(jobListing)
    .where(eq(JobListingTable.id, id))
    .returning({
      id: JobListingTable.id,
      organizationId: JobListingTable.organizationId,
    });
  return updatedListing;
}


export async function deleteJobListing(id:string){
  const [deletedJobListing] = await db
    .delete(JobListingTable)
    .where(eq(JobListingTable.id, id))
    .returning({
      id: JobListingTable.id,
      organizationId: JobListingTable.organizationId,
    });
  return deletedJobListing;
}