import { JobListingTable } from "@/drizzle/schema";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/drizzle/db";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatJobListingStatus } from "@/app/features/jobListings/lib/formatters";
import JobListingBadges from "@/app/features/jobListings/components/jobListingBadges";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EditIcon } from "lucide-react";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import {MarkdownPartial} from "@/components/markdown/MarkdownPartial";

export default async function JobListingPage({
  params,
}: {
  params: Promise<{ jobListingId: string }>;
}) {
  const { orgId } = await auth();
  if (orgId == null) return null;

  const { jobListingId } = await params;
  const jobListing = await getJobListing(jobListingId, orgId);
  if (jobListing == null) {
    return notFound();
  }
  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 @container">
      <div className="flex items-center justify-between gap-4 @max-4xl:flex-col @max-4xl:items-start"></div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {jobListing.title}
        </h1>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge>{formatJobListingStatus(jobListing.status)}</Badge>
          <JobListingBadges jobListing={jobListing} />
        </div>
      </div>
      <div className="flex items-center gap-2 empty:-mt-4">
        {/* -mt-4 um bei leerem div die gap-4 von oben zu kontern */}
        <Button asChild variant="outline">
          <Link href={`employer/job-listing/${jobListing.id}/edit`}>
            <EditIcon className="size-4" />
            Edit
          </Link>
        </Button>
      </div>
      <div></div>
      <MarkdownPartial
        mainMarkdown={
          <MarkdownRenderer
            source={jobListing.description}
            className="prose-sm"
          />
        }
        dialogMarkdown={<MarkdownRenderer source={jobListing.description} />}
        dialogTitle="Description"
      />
    </div>
  );
}

export function getJobListing(jobListingId: string, organizationId: string) {
  return db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, jobListingId),
      eq(JobListingTable.organizationId, organizationId)
    ),
  });
}
