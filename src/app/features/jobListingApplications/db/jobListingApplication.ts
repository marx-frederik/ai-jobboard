"use server"
import { db } from "@/drizzle/db";
import { JobListingApplicationTable } from "@/drizzle/schema";

export async function insertJobListingApplication(
  data: typeof JobListingApplicationTable.$inferInsert
) {
  await db.insert(JobListingApplicationTable).values(data);
}
