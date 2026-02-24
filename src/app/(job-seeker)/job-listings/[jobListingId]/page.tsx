import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { IsBreakpoint } from "@/components/IsBreakpoint";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { db } from "@/drizzle/db";
import { eq, and } from "drizzle-orm";
import {
  JobListingApplicationTable,
  JobListingTable,
  UserResumeTable,
} from "@/drizzle/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DaysSincePosting,
  JobListingItems,
} from "../../_shared/JobListingItems";
import { notFound } from "next/navigation";
import { ClientSheet } from "./_ClientSheet";
import JobListingBadges from "@/features/jobListings/components/jobListingBadges";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import { Button } from "@/components/ui/button";
import { convertSearchParamsToString } from "@/lib/convertSearchParamsToString";
import { XIcon } from "lucide-react";
import Link from "next/link";
import getCurrentUser from "@/services/clerk/lib/getCurrentUser";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SignUpButton } from "@/services/clerk/components/AuthButtons";
import { differenceInDays } from "date-fns";
import { DialogTrigger } from "@radix-ui/react-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import JobListingApplicationForm from "@/features/jobListingApplications/components/JobListingApplicationForm";

export default function JobListingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ jobListingId: string }>;
  searchParams: Promise<Record<string, string | string[]>>; // same as [key: string]: string | string[];
  /*example: 
  {
    q: "frontend";
    location: "Berlin";
    jobIds: ["1", "2", "3"];
  };*/
}) {
  return (
    <>
      <ResizablePanelGroup autoSaveId="job-panel-panel" direction="horizontal">
        <ResizablePanel id="left" order={1} defaultSize={60} minSize={30}>
          <div className="p-4 h-screen over oveerflow-y-auto">
            <JobListingItems searchParams={searchParams} params={params} />
          </div>
        </ResizablePanel>
        <IsBreakpoint
          breakpoint="min-width: 1024px"
          otherwise={
            
            <ClientSheet>
              
              <SheetContent hideCloseButton className="p-4 overflow-y-auto">
                <SheetHeader className="sr-only">
                  <SheetTitle>Job Listing Details</SheetTitle>
                </SheetHeader>
                <Suspense fallback={<Spinner />}>
                  <JobListingDetails
                    params={params}
                    searchParams={searchParams}
                  />
                </Suspense>
              </SheetContent>
            </ClientSheet>
          }
        >
          <ResizableHandle withHandle className="mx-2" />
          <ResizablePanel id="right" order={2} defaultSize={40} minSize={30}>
            <div className="p-4 h-screen overflow-y-auto">
              <Suspense fallback={<Spinner />}>
                <JobListingDetails
                  params={params}
                  searchParams={searchParams}
                />
              </Suspense>
            </div>
          </ResizablePanel>
        </IsBreakpoint>
      </ResizablePanelGroup>
    </>
  );
}

async function JobListingDetails({
  params,
  searchParams,
}: {
  params: Promise<{ jobListingId: string }>;
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const { jobListingId } = await params;
  const jobListing = await getJobListing(jobListingId);

  if (!jobListing) return notFound();

  const nameInitials = jobListing.organization.name
    .split(" ")
    .splice(0, 4)
    .map((word) => word[0])
    .join("");

  return (
    <div className="space-y-6 @container">
      <div className="flex gap-4 items-start">
        <Avatar className="size-14 @max-md:hidden">
          <AvatarImage
            src={jobListing.organization.imageUrl ?? undefined}
            alt={jobListing.organization.name}
          />
          <AvatarFallback className="uppercase bg-primary text-primary-foreground">
            {nameInitials}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {jobListing.title}
          </h1>
          <div className="text-base text-foreground-muted">
            {jobListing.organization.name}
          </div>
          {jobListing.postedAt != null && (
            <div className="text-sm font-medium text-primary @min-lg:hidden">
              <DaysSincePosting postedAt={jobListing.postedAt.toDateString()} />
            </div>
          )}
        </div>
        <div className="ml-auto flex items-center">
          {/* for lager screens */}
          {jobListing.postedAt != null && (
            <div className="text-sm font-medium text-primary ml-auto @max-lg:hidden">
              <DaysSincePosting postedAt={jobListing.postedAt.toDateString()} />
            </div>
          )}
          <Button size="icon" variant="outline" asChild>
            <Link href={`/?${convertSearchParamsToString(await searchParams)}`}>
              <span className="sr-only">Close</span>
              <XIcon />
            </Link>
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        <JobListingBadges jobListing={jobListing} />
      </div>
      <Suspense fallback={<Button disabled>Apply</Button>}>
        <ApplyButton jobListingId={jobListingId} />
      </Suspense>
      <MarkdownRenderer source={jobListing.description} className="overflow-auto prose-sm" />
    </div>
  );
}

async function ApplyButton({ jobListingId }: { jobListingId: string }) {
  const { userId } = await getCurrentUser();
  if (userId == null) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button>Apply</Button>
        </PopoverTrigger>
        <PopoverContent className="flex flex-col gap-2">
          You need to sign in befire applying for this job
          <SignUpButton />
        </PopoverContent>
      </Popover>
    );
  }

  const application = await getJobListingApplication({ jobListingId, userId });
  if (application != null) {
    const formatter = new Intl.RelativeTimeFormat(undefined, {
      style: "short",
      numeric: "always",
    });

    //await connection()
    const difference = differenceInDays(application.createdAt, new Date());
    return (
      <div className="text-muted-foreground text-sm">
        You applied for this job{" "}
        {difference === 0 ? "today" : formatter.format(difference, "days")}
      </div>
    );
  }

  const userResume = await getUserResume({ userId });
  if (userResume == null) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button>Apply</Button>
        </PopoverTrigger>
        <PopoverContent className="flex flex-col gap-2">
          You have to upload a resume before applying for a job
          <Button asChild>
            <Link href="/user-settings/resume">Upload Resume</Link>
          </Button>
        </PopoverContent>
      </Popover>
    );
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Apply</Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-3xl max-h-[calc(100%-2rem)] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Application</DialogTitle>
          <DialogDescription>
            Applying for a job cannot be undone and can only be done once per
            job listing
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <JobListingApplicationForm jobListingId={jobListingId} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

async function getUserResume({ userId }: { userId: string }) {
  return db.query.UserResumeTable.findFirst({
    where: eq(UserResumeTable.userId, userId),
  });
}

async function getJobListingApplication({
  jobListingId,
  userId,
}: {
  jobListingId: string;
  userId: string;
}) {
  return db.query.JobListingApplicationTable.findFirst({
    where: and(
      eq(JobListingApplicationTable.jobListingId, jobListingId),
      eq(JobListingApplicationTable.userId, userId)
    ),
  });
}

async function getJobListing(id: string) {
  const jobListing = await db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, id),
      eq(JobListingTable.status, "published")
    ),
    with: {
      organization: {
        columns: {
          id: true,
          name: true,
          imageUrl: true,
        },
      },
    },
  });

  if (jobListing != null) {
    //TODO: caching
  }

  return jobListing;
}
