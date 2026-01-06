import JobListingForm from "@/features/jobListings/components/jobListingForm";
import { Card, CardContent } from "@/components/ui/card";
import { notFound } from "next/navigation";
import getCurrentOrganization from "@/services/clerk/lib/getCurrentOrganization";
import { eq, and } from "drizzle-orm";
import { JobListingTable } from "@/drizzle/schema";
import { db } from "@/drizzle/db";

type Props = {
  params: Promise<{ jobListingId: string }>;
};

export default async function EditJobListingPage(props: Props) {
  const jobListingId = await (await props.params).jobListingId;
  const { orgId } = await getCurrentOrganization();
  if (orgId == null) return notFound();
  
  const jobListing = await getJobListing(jobListingId, orgId);
  if (jobListing == null) return notFound();
  return (
    <div className="max-w-5xl mx-auto -4">
      <h1 className="text-2xl font-bold mb-2">New Job Listing</h1>
      <p className="text-muted-foreground mb-6">
        This does not post the listing yet. It just saves a draft.
      </p>
      <Card>
        <CardContent>
          <JobListingForm jobListing={jobListing} />
        </CardContent>
      </Card>
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
  