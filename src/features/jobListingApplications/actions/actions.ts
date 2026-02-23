"use server";
import z, { string } from "zod";
import { jobListingApplicationFormSchema } from "../../jobListings/actions/schemas";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";
import {
  JobListingTable,
  JobListingType,
  UserResumeTable,
} from "@/drizzle/schema";
import getCurrentUser from "@/services/clerk/lib/getCurrentUser";
import {
  insertJobListingApplication,
  updateJobListingApplication,
} from "../db/jobListingApplication";
import { inngest } from "@/services/inngest/client";
import {
  ApplicationStage,
  applicationStages,
  JobListingApplicationTable,
} from "@/drizzle/schema/jobListingApplication";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgUserPermissions";
import getCurrentOrganization from "@/services/clerk/lib/getCurrentOrganization";

export async function createJobListingApplication({
  jobListingId,
  unsafeData,
}: {
  jobListingId: string;
  unsafeData: z.infer<typeof jobListingApplicationFormSchema>;
}) {
  const permissionError = { error: true, message: "" };
  const { userId } = await getCurrentUser();
  if (userId == null) return permissionError;

  const [userResume, jobListing] = await Promise.all([
    getUserResume(userId),
    getPublicJobListing(jobListingId),
  ]);

  if (userResume == null || jobListing == null) return permissionError;

  const { success, data } =
    jobListingApplicationFormSchema.safeParse(unsafeData);

  if (!success)
    return {
      error: true,
      message: "There was an error submitting your application",
    };

  /* AI generation */
  await inngest.send({
    name: "app/jobListingApplication.created",
    data: { jobListingId, userId },
  });

  await insertJobListingApplication({ jobListingId, userId, ...data });
  return {
    error: false,
    message: "Your application was successfully submitted",
  };
}

async function getPublicJobListing(id: string) {
  //TODO: caching
  return db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, id),
      eq(JobListingTable.status, "published")
    ),
    columns: { id: true },
  });
}

async function getUserResume(userId: string) {
  //TODO: caching
  return db.query.UserResumeTable.findFirst({
    where: eq(UserResumeTable.userId, userId),
    columns: { userId: true },
  });
}

async function getJobListing(id: string) {
  //"use cache"
  //TODO:implement caching

  return db.query.JobListingTable.findFirst({
    where: eq(JobListingTable.id, id),
    columns: { organizationId: true },
  });
}

export async function updateJobListingApplicationStage(
  jobListingId: string,
  unsafeStage: ApplicationStage
) {
  const { success, data: stage } = z
    .enum(applicationStages)
    .safeParse(unsafeStage);

  if (!success) {
    return {
      error: true,
      message: "Invalid stage",
    };
  }

  const { userId } = await getCurrentUser();
  const { orgId } = await getCurrentOrganization();
  const jobListing = await getJobListing(jobListingId);
  if (userId == null || orgId == null || orgId !== jobListing?.organizationId)
    return {
      error: true,
      message: "",
    };

  if (!hasOrgUserPermission("org:application:applicant_change_state")) {
    return {
      error: true,
      message: "You don't have permission to change the application state.",
    };
  }

  await updateJobListingApplication({ jobListingId, userId }, { stage });
}

export async function updateJobListingApplicationRating(
  jobListingId: string,
  unsafeRating: number | null
) {
  const { success, data: rating } = z
    .number()
    .min(1)
    .max(5)
    .nullish()
    .safeParse(unsafeRating);

  if (!success) {
    return {
      error: true,
      message: "Invalid rating",
    };
  }

  const { userId } = await getCurrentUser();
  const { orgId } = await getCurrentOrganization();
  const jobListing = await getJobListing(jobListingId);
  if (userId == null || orgId == null || orgId !== jobListing?.organizationId)
    return {
      error: true,
      message: "You don't have permission to change the application rating.",
    };

  if (!hasOrgUserPermission("org:application:applicant_change_state")) {
    return {
      error: true,
      message: "You don't have permission to change the application rating.",
    };
  }

  await updateJobListingApplication({ jobListingId, userId }, { rating });
}
