"use server";
import z from "zod";
import { jobListingSchema } from "./schemas";
import { auth } from "@clerk/nextjs/server";
import { insertJobListing, updateJobListing as updateJobListingDb } from "../db/jobListing";
import { redirect } from "next/navigation";
import { db } from "@/drizzle/db";
import { eq, and } from "drizzle-orm";
import { JobListingTable } from "@/drizzle/schema";

export async function createJobListing(
  unsafeData: z.infer<typeof jobListingSchema>
) {
  const { orgId } = await auth();
  if (orgId == null)
    return {
      error: true,
      message: "You don't have permission to create a job listing",
    };
  const { success, data } = jobListingSchema.safeParse(unsafeData);
  if (!success)
    return {
      error: true,
      message: "There is an error ccreating your job listing",
    };
  const jobListing = await insertJobListing({
    organizationId: orgId,
    ...data,
    status: "draft",
  });

  redirect(`/employer/job-listings/${jobListing.id}`);
}

export async function updateJobListing(
  id: string,
  unsafeData: z.infer<typeof jobListingSchema>
) {
  const { orgId } = await auth();
  if (orgId == null)
    return {
      error: true,
      message: "You don't have permission to create a job listing",
    };
  const { success, data } = jobListingSchema.safeParse(unsafeData);
  if (!success)
    return {
      error: true,
      message: "There was an error creating your job listing",
    };

  const jobListing = await getJobListing(id, orgId);
  if(jobListing == null)return {
    error: true,
    message: "There was an error updating your job listing",
  };

  const updatedJobListing = await updateJobListingDb(id, data);

  redirect(`/employer/job-listings/${updatedJobListing.id}`);
}

export async function getJobListing(jobListingId: string, organizationId: string) {
  return db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, jobListingId),
      eq(JobListingTable.organizationId, organizationId)
    ),
  });
}
