"use server";
import z from "zod";
import { jobListingSchema } from "./schemas";
import { auth } from "@clerk/nextjs/server";
import { insertJobListing } from "../db/jobListing";
import { redirect } from "next/navigation";

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
  const jobListing = await insertJobListing({ organizationId:orgId, ...data, status: "draft" });

  redirect(`/employer/job-listings/${jobListing.id}`)
}
