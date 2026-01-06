import { db } from "@/drizzle/db";
import { inngest } from "../client";
import { eq, and } from "drizzle-orm";
import JobListingApplicationForm from "@/features/jobListingApplications/components/JobListingApplicationForm";
import {
  JobListingApplicationTable,
  JobListingTable,
  UserResumeTable,
  UserTable,
} from "@/drizzle/schema";
import { applicantRankingAgent } from "../ai/applicantRankingAgent";

export const rankApplication = inngest.createFunction(
  {
    id: "rank-application",
    name: "Rank Job Application",
  },
  {
    event: "app/jobListingApplication.created",
  },

  async ({ step, event }) => {
    const { userId, jobListingId } = event.data;

    const getCoverletter = step.run("get-cover-letter", async () => {
      const application = await db.query.JobListingApplicationTable.findFirst({
        where: and(
          eq(JobListingApplicationTable.userId, userId),
          eq(JobListingApplicationTable.jobListingId, jobListingId)
        ),
      });

      return application?.coverLetter;
    });

    const getResume = step.run("get-resume", async () => {
      const aiSummary = await db.query.UserResumeTable.findFirst({
        where: eq(UserResumeTable.userId, userId),
        columns: { aiSummary: true },
      });

      return aiSummary;
    });

    const getJobListing = step.run("get-joblisting", async () => {
      const jobListing = db.query.JobListingTable.findFirst({
        where: eq(JobListingTable.id, jobListingId),
        columns: {
          id: true,
          city: true,
          description: true,
          experienceLevel: true,
          locationRequirement: true,
          stateAbbreviation: true,
          title: true,
          wage: true,
          wageInterval: true,
          type: true,
        },
      });

      return jobListing;
    });

    const [coverLetter, resumeSummary, jobListing] = await Promise.all([
      getCoverletter,
      getResume,
      getJobListing,
    ]);

    if (resumeSummary == null || jobListing == null) return;

    await applicantRankingAgent.run(
      JSON.stringify({ coverLetter, resumeSummary, jobListingId, userId })
    );
  }
);
