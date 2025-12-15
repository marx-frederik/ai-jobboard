"use server"
import z from "zod";
import { jobListingApplicationFormSchema } from "../../jobListings/actions/schemas";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";
import { JobListingTable, UserResumeTable } from "@/drizzle/schema";
import getCurrentUser from "@/services/clerk/lib/getCurrentUser";
import { insertJobListingApplication } from "../db/jobListingApplication";
import { inngest } from "@/services/inngest/client";

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

  const { success, data } = jobListingApplicationFormSchema.safeParse(unsafeData);

  if(!success)return{error:true,message:"There was an error submitting your application"}

//TODO: AI generation
await inngest.send({
    name:"app/jobListingApplication.created",
    data:{jobListingId, userId}
})

  await insertJobListingApplication({jobListingId, userId, ...data})
  return{
    error:false,
    message:"Your application was successfully submitted"
  }
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
