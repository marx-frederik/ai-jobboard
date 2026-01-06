"use server";
import z from "zod";
import { jobListingAiSearchSchema, jobListingSchema } from "./schemas";
import { auth } from "@clerk/nextjs/server";
import {
  insertJobListing,
  updateJobListing as updateJobListingDb,
  deleteJobListing as deleteJobListingDb,
} from "../db/jobListing";
import { redirect } from "next/navigation";
import { db } from "@/drizzle/db";
import { eq, and } from "drizzle-orm";
import { JobListingTable } from "@/drizzle/schema";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgUserPermissions";
import { getNextJobListingStatus } from "../lib/utils";
import {
  hasReachedMaxFeaturedJobListings,
  hasReachedMaxPublishedJobListings,
} from "../lib/planFeatureHelpers";
import { revalidatePath } from "next/cache";
import getCurrentUser from "@/services/clerk/lib/getCurrentUser";
import { getMatchingJobListings } from "@/services/inngest/ai/getMatchingJobListings";

export async function createJobListing(
  unsafeData: z.infer<typeof jobListingSchema>
) {
  const { orgId } = await auth();
  if (
    orgId == null ||
    !(await hasOrgUserPermission("org:job_listing:job_listing_create"))
  )
    return {
      error: true,
      message: "You don't have permission to create a job listing",
    };
  const { success, data } = jobListingSchema.safeParse(unsafeData);
  if (!success)
    return {
      error: true,
      message: "There is an error creating your job listing",
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
  if (
    orgId == null ||
    !(await hasOrgUserPermission("org:job_listing:job_listing_update"))
  )
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
  if (jobListing == null)
    return {
      error: true,
      message: "There was an error updating your job listing",
    };

  const updatedJobListing = await updateJobListingDb(id, data);

  redirect(`/employer/job-listings/${updatedJobListing.id}`);
}

export async function getJobListing(
  jobListingId: string,
  organizationId: string
) {
  return db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, jobListingId),
      eq(JobListingTable.organizationId, organizationId)
    ),
  });
}

export async function toggleJobListingStatus(id: string) {
  const error = {
    error: true,
    message: "You don't have permission to change the status.",
  };
  const { orgId } = await auth();
  if (
    orgId == null ||
    !(await hasOrgUserPermission("org:job_listing:job_listing_change_status"))
  )
    return error;

  const jobListing = await getJobListing(id, orgId);
  if (jobListing == null) return error;

  const newStatus = getNextJobListingStatus(jobListing.status);
  if (newStatus == "published" && (await hasReachedMaxPublishedJobListings()))
    return error;

  const updatedJobListing = await updateJobListingDb(id, {
    status: newStatus,
    isFeatured: newStatus === "published" ? undefined : false, //if we unpublish a job listing we dont want it to be featured anymore
    postedAt:
      newStatus === "published" && jobListing.postedAt == null
        ? new Date()
        : undefined,
  });
  //TODO: insert cache tag system
  revalidatePath(`/employer/job-listings/${id}`);
  return { error: false };
}

export async function toggleJobListingFeatured(id: string) {
  const error = {
    error: true,
    message: "You don't have permission to change the featured status.",
  };
  const { orgId } = await auth();
  if (
    orgId == null ||
    !(await hasOrgUserPermission("org:job_listing:job_listing_change_status"))
  )
    return error;

  const jobListing = await getJobListing(id, orgId);
  if (jobListing == null) return error;

  const newFeaturedStatus = !jobListing.isFeatured;

  if (newFeaturedStatus && (await hasReachedMaxFeaturedJobListings()))
    return error;

  const updatedJobListing = await updateJobListingDb(id, {
    isFeatured: newFeaturedStatus,
  });
  //TODO: insert cache tag system
  revalidatePath(`/employer/job-listings/${updatedJobListing.id}`);
  return { error: false };
}

export async function deleteJobListing(id: string) {
  const error = {
    error: true,
    message: "You don't have permission to delete the job listing.",
  };
  const { orgId } = await auth();
  if (
    orgId == null ||
    !(await hasOrgUserPermission("org:job_listing:job_listing_delete"))
  )
    return error;

  const jobListing = await getJobListing(id, orgId);
  if (jobListing == null) return error;

  await deleteJobListingDb(id);
  //TODO: insert cache tag system
  redirect("/employer");
}

export async function getAiJobListingSearchResults(
  unsafeData: z.infer<typeof jobListingAiSearchSchema>
):Promise<{ error: true; message: string } | { error: false; jobIds: string[] }>{
  const { success, data } = jobListingAiSearchSchema.safeParse(unsafeData);
  if (!success) {
    return {
      error: true,
      message: "There was en error processing your search query",
    };
  }
  const { userId } = await getCurrentUser();
  if (userId == null) {
    return {
      error: true,
      message: "You need an account to use AI search",
    };
  }

  const allListings = await getPublicJobListings();
  const matchedListings = await getMatchingJobListings(
    data.query,
    allListings,
    {
      maxNumberofJobListings: 10,
    }
  );

  if (matchedListings.length === 0) {
    return { error: true, message: "No jobs match your search criteria" };
  }

  return { error: false, jobIds: matchedListings };
}

function getPublicJobListings() {
  //TODO:add caching
  return db.query.JobListingTable.findMany({
    where: eq(JobListingTable.status, "published"),
  });
}
