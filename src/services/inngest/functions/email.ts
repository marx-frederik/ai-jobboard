import { db } from "@/drizzle/db";
import { inngest } from "../client";
import {
  JobListingTable,
  UserNotificationSettingsTable,
} from "@/drizzle/schema";
import { and, eq, gte } from "drizzle-orm";
import { subDays } from "date-fns";
import { GetEvents } from "inngest";
import { getMatchingJobListings } from "../ai/getMatchingJobListings";
import { resend } from "@/services/resend/client";
import DailyJobListingEmail from "@/services/resend/components/DailyJobListingsEmail";
import { env } from "@/data/env/server";
import React from "react";

export const prepareDailyUserJobListingNotifications = inngest.createFunction(
  {
    id: "prepare-daily-user-job-listings-notification",
    name: "Prepare Daily User Job Listing Notifications",
  },
  { cron: "TZ=America/Chicago 0 7 * * *" },
  async ({ step, event }) => {
    //get all users
    const getUsers = step.run("get-users", async () => {
      return await db.query.UserNotificationSettingsTable.findMany({
        where: eq(UserNotificationSettingsTable.newJobEmailNotifications, true),
        columns: {
          userId: true,
          newJobEmailNotifications: true,
          aiPrompt: true,
        },
        with: {
          user: {
            columns: {
              // information we can use in the mail we send to the user
              email: true,
              name: true,
            },
          },
        },
      });
    });

    //get all job listings that have been posted since today
    const getJobListings = step.run("get-recet-job-listings", async () => {
      return await db.query.JobListingTable.findMany({
        where: and(
          gte(
            JobListingTable.createdAt,
            subDays(new Date(event.ts ?? Date.now()), 1)
          ),
          eq(JobListingTable.status, "published")
        ),
        columns: {
          createdAt: false,
          postedAt: false,
          updatedAt: false,
          status: false,
          organizationId: false,
        },
        with: {
          // we can put information about the organization in the email
          organization: {
            columns: {
              name: true,
            },
          },
        },
      });
    });

    const [userNotifications, jobListings] = await Promise.all([
      getUsers,
      getJobListings,
    ]);

    if (jobListings.length === 0 || userNotifications.length === 0) return;

    //preparing events to be send for each user (incl. notification setting)
    const events = userNotifications.map((notification) => {
      return {
        name: "app/email.daily-user-job-listings",
        user: {
          name: notification.user.name,
          email: notification.user.email,
        },
        data: {
          aiPrompt: notification.aiPrompt ?? undefined,
          jobListings: jobListings.map((jobListing) => {
            return {
              ...jobListing,
              organizationName: jobListing.organization.name,
            };
          }),
        },
      } as const satisfies GetEvents<
        // make the return statement typesafe and auto fillable
        typeof inngest
      >["app/email.daily-user-job-listings"];
    });

    // send events to inngest
    await step.sendEvent("send-emails", events);
  }
);

export const sendDailyUserJobListingEmail = inngest.createFunction(
  {
    id: "send-daily-user-job-listing-email",
    name: "Send Daily User Job Listing Email",
    throttle: {
      // makes sure the event can only be fired a limited amount of time
      limit: 10,
      period: "1m",
    },
  },
  { event: "app/email.daily-user-job-listings" }, // event we want to listen to
  async ({ event, step }) => {
    const { aiPrompt, jobListings } = event.data;
    if (jobListings.length === 0) return;

    let matchingJobListings: typeof jobListings = [];
    if (aiPrompt == null || aiPrompt.trim() === "") {
      matchingJobListings = jobListings;
    } else {
      const matchingIds = await getMatchingJobListings(aiPrompt, jobListings);
      matchingJobListings = jobListings.filter((listing) =>
        matchingIds.includes(listing.id)
      );
    }
    // if no joblistings match
    if (matchingJobListings.length === 0) return;

    await step.run("send-email", async () => {
      await resend.emails.send({
        from: "Job Board <onboard@resend.dev>",
        to: event.user.email,
        subject: "Your Daily Job Listings",
        react:DailyJobListingEmail({
            jobListings,
            userName: event.user.name,
            serverUrl: env.SERVER_URL,
          }),
      });
    });
  }
);
