"use server";
import { db } from "@/drizzle/db";
import { JobListingApplicationTable } from "@/drizzle/schema";
import { useCellValues } from "@mdxeditor/editor";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function insertJobListingApplication(
  data: typeof JobListingApplicationTable.$inferInsert
) {
  await db
  .insert(JobListingApplicationTable)
  .values(data)
  .onConflictDoNothing({
    target: [
      JobListingApplicationTable.jobListingId,
      JobListingApplicationTable.userId,
    ],
  });

  //TODO:implement tag chaching
  revalidatePath(`/job-listings/${data.jobListingId}`);
}

export async function updateJobListingApplication(
  {
    jobListingId,
    userId,
  }: {
    jobListingId: string;
    userId: string;
  },
  data: Partial<typeof JobListingApplicationTable.$inferInsert>
) {
  await db
    .update(JobListingApplicationTable)
    .set(data)
    .where(
      and(
        eq(JobListingApplicationTable.jobListingId, jobListingId),
        eq(JobListingApplicationTable.userId, userId)
      )
    );
    
  revalidatePath(`/job-listings/${jobListingId}`);
}
