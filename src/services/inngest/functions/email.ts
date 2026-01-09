import { db } from "@/drizzle/db";
import { inngest } from "../client";
import {
  JobListingApplicationTable,
  JobListingTable,
  OrganizationUserSettingsTable,
  UserNotificationSettingsTable,
} from "@/drizzle/schema";
import { and, eq, gte } from "drizzle-orm";
import { subDays } from "date-fns";
import { GetEvents } from "inngest";
import { getMatchingJobListings } from "../ai/getMatchingJobListings";
import { resend } from "@/services/resend/client";
import DailyJobListingEmail from "@/services/resend/components/DailyJobListingsEmail";
import { env } from "@/data/env/server";
import DailyJobListingApplicationsEmail from "@/services/resend/components/DailyJobListingsApplicationEmail";

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
    const getJobListings = step.run("get-recent-job-listings", async () => {
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
  { event: "app/email.daily-organisation-user-applications" }, // event we want to listen to
  async ({ event, step }) => {
    const { applications } = event.data;
    if (applications.length === 0) return;

    const user = event.user;

    await step.run("send-email", async () => {
      await resend.emails.send({
        from: "Job Board <onboard@resend.dev>",
        to: event.user.email,
        subject: "Your Daily Job Listings Applications",
        react: DailyJobListingApplicationsEmail({
          applications,
          userName: event.user.name,
        }),
      });
    });
  }
);

export const prepareDailyOrganizationUserApplicationNotifications =
  inngest.createFunction(
    {
      id: "prepare-daily-organization-user-application-notification",
      name: "Prepare Daily Organization User Application Notifications",
    },
    { cron: "TZ=America/Chicago 0 7 * * *" },
    async ({ step, event }) => {
      //get all users
      const getUsers = step.run("get-user-settings", async () => {
        return await db.query.OrganizationUserSettingsTable.findMany({
          where: eq(
            OrganizationUserSettingsTable.newApplicationEmailNotifications,
            true
          ),
          columns: {
            userId: true,
            organizationId: true,
            newApplicationEmailNotifications: true,
            minimumRating: true,
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
      const getApplications = step.run("get-recent-applications", async () => {
        return await db.query.JobListingApplicationTable.findMany({
          where: gte(
            JobListingApplicationTable.createdAt,
            subDays(new Date(event.ts ?? Date.now()), 1)
          ),
          columns: {
            rating: true,
          },
          with: {
            // we can put information about the user in the email
            user: {
              columns: {
                name: true,
              },
            },
            jobListing: {
              columns: {
                id: true,
                title: true,
              },
              with: {
                organization: {
                  columns: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        });
      });

      const [userNotifications, applications] = await Promise.all([
        getUsers,
        getApplications,
      ]);

      if (userNotifications.length === 0 || applications.length === 0) return;

      const groupedNotifications = Object.groupBy(
        userNotifications,
        (n) => n.userId
      );

      const events = Object.entries(groupedNotifications)
        .map(([, settings]) => {
          if (settings == null || settings.length === 0) return null;
          const userName = settings[0].user.name;
          const userEmail = settings[0].user.email;

          const filteredApplications = applications
            .filter((app) => {
              return settings.some(
                (set) =>
                  set.organizationId === app.jobListing.organization.id &&
                  (set.minimumRating == null ||
                    (app.rating ?? 0) >= set.minimumRating)
              );
            })
            .map((a) => ({
              organizationId: a.jobListing.organization.id,
              organizationName: a.jobListing.organization.name,
              jobListingId: a.jobListing.id,
              jobListingTitle: a.jobListing.title,
              userName: a.user.name,
              rating: a.rating,
            }));

          if (filteredApplications.length === 0) return null;

          return {
            name: "app/email.daily-organisation-user-applications",
            user: { name: userName, email: userEmail },
            data: { applications: filteredApplications },
          } as const satisfies GetEvents<
            typeof inngest
          >["app/email.daily-organisation-user-applications"];
        })
        .filter((v) => v != null);

      // send events to inngest
      await step.sendEvent("send-emails", events);
    }
  );

export const sendDailyOrganisationUserApplicationEmail = inngest.createFunction(
  {
    id: "send-daily-organization-user-application",
    name: "Send Daily Organization User Applications",
    throttle: {
      // makes sure the event can only be fired a limited amount of time
      limit: 1000,
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
        react: DailyJobListingEmail({
          jobListings,
          userName: event.user.name,
          serverUrl: env.SERVER_URL,
        }),
      });
    });
  }
);
