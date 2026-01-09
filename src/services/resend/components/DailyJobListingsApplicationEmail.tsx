import { JobListingApplicationTable, JobListingTable } from "@/drizzle/schema";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import {
  formatExperienceLevel,
  formatJobListingLocation,
  formatJobType,
  formatLocationRequirement,
  formatWage,
} from "@/features/jobListings/lib/formatters";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

//job listing related information
export type Applications = Pick<
  typeof JobListingApplicationTable.$inferSelect,
  "rating"
> & {
  userName: string;
  organizationId: string;
  organizationName: string;
  jobListingId: string;
  jobListingTitle: string;
};

export default function DailyJobListingApplicationsEmail({
  applications,
  userName,
}: {
  userName: string;
  applications: Applications[];
}) {
  return (
    <Tailwind>
      <Html>
        <Head />
        <Body>
          <Container className="font-sans">
            <Heading as="h1">New Job Listings</Heading>
            <Text>
              hi {userName}, here are all the new applications for your job
              listings.
            </Text>
            {Object.entries(
              Object.groupBy(applications, (a) => a.organizationId)
            ).map(([orgId, orgApplications], i) => {
              if (orgApplications == null || orgApplications.length === 0) {
                return null;
              }
              return (
                <OrganizationSection
                  key={orgId}
                  orgName={orgApplications[0].organizationName}
                  applications={orgApplications}
                  noMargin={i === 0}
                />
              );
            })}
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}

function OrganizationSection({
  orgName,
  noMargin,
  applications,
}: {
  orgName: string;
  applications: Applications[];
  noMargin: boolean;
}) {
  return <Section className={noMargin ? undefined : "mt-8"}>
    <Heading as="h2" className="leading-none font-semibold text-3xl my-4">
      {orgName}
    </Heading>
    {Object.entries(Object.groupBy(applications, (a) => a.jobListingId)).map(
      ([jobListingId, listingApplications],i) => {
        if (listingApplications == null || listingApplications.length === 0) {
          return null;
        }

        return (
          <JobListingCard
            key={jobListingId}
            jobListingTitle={listingApplications[0].jobListingTitle}
            applications={listingApplications}
            noMargin={i === 0}
          />
        );
      }
    )}
  </Section>;
}

function JobListingCard({
  jobListingTitle,
  applications,
  noMargin,
}: {
  jobListingTitle: string;
  applications: Applications[];
  noMargin: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground rounded-lg border p-4 border-primary",
        !noMargin && "mt-6"
      )}
    >
      <Heading as="h3" className="leading-none font-semibold text-xl mt-0 mb-3">
        {jobListingTitle}
      </Heading>
      {applications.map((a, i) => (
        <Text key={i} className="mt-2 mb-0">
          <span className="mr-2">{a.userName}</span>
          <RatingIcons rating={a.rating} />
        </Text>
      ))}
    </div>
  );
}

function RatingIcons({ rating }: { rating: number | null }) {
  if (rating == null || rating < 1 || rating > 5) return "Unrated";
  const stars: ReactNode[] = [];

  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} className="w-3 -mb[7px] mr-0.5">
        {rating <= i ? "☆" : "★"}
      </span>
    );
  }
  return stars;
}

DailyJobListingApplicationsEmail.PreviewProps = {
  applications: [
    {
      organizationId: "org-1",
      organizationName: "Web Dev Simplified",
      jobListingId: "job-listing-1",
      jobListingTitle: "Software Engineer",
      rating: 2,
      userName: "Larry Cook",
    },
    {
      organizationId: "org-1",
      organizationName: "Web Dev Simplified",
      jobListingId: "job-listing-1",
      jobListingTitle: "Software Engineer",
      rating: 4,
      userName: "Jane Smith",
    },
    {
      organizationId: "org-1",
      organizationName: "Web Dev Simplified",
      jobListingId: "job-listing-2",
      jobListingTitle: "Backend Developer",
      rating: null,
      userName: "Jane Smith",
    },
    {
      organizationId: "org-2",
      organizationName: "Tech Innovations",
      jobListingId: "job-listing-3",
      jobListingTitle: "Frontend Developer",
      rating: 4,
      userName: "Jane Smith",
    },
  ],
  userName: "John Doe",
} satisfies Parameters<typeof DailyJobListingApplicationsEmail>[0];
