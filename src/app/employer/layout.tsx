import { ReactNode } from "react";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { SidebarUserButton } from "../features/users/components/SidebarUserButton";
import { ClipboardListIcon, LayoutIcon, Plus, PlusIcon } from "lucide-react";
import SidebarNavMenuGroup from "@/components/sidebar/SidebarNavMenuGroup";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { SidebarOrganizationButton } from "../features/organizations/components/components/SidebarOrganizationButton";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AsyncIf from "@/components/AsyncIf";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgUserPermissions";
import { db } from "@/drizzle/db";
import {
  JobListingApplicationTable,
  JobListingStatus,
  JobListingTable,
} from "@/drizzle/schema";
import { count, desc, eq } from "drizzle-orm";
import { sortJobListingByStatus } from "../features/jobListings/lib/utils";
import { JobListingMenuGroup } from "./_JobListingMenuGroup";

export default async function EmployerLayoutyout({
  children,
}: {
  children: ReactNode;
}) {
  const { orgId } = await auth();
  if (orgId == null) return redirect("/organizations/select");
  return (
    <AppSidebar
      content={
        <>
          <SidebarGroup>
            <SidebarGroupLabel>Job Listings</SidebarGroupLabel>
            <AsyncIf
              condition={() =>
                hasOrgUserPermission("org:job_listing:job_listing_create")
              }
            >
              <SidebarGroupAction title="Add Job Listing" asChild>
                <Link href="/employer/job-listings/new">
                  <span className="sr-only">Add Lob Listing</span>
                  <Plus />
                </Link>
              </SidebarGroupAction>
            </AsyncIf>
            <SidebarGroupContent className="">
              <JobListingMenu orgId={orgId} />
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarNavMenuGroup
            className="mt-auto"
            items={[
              { href: "/", icon: <ClipboardListIcon />, label: "Jobboard" },
            ]}
          />
        </>
      }
      footerButton={<SidebarOrganizationButton />}
    >
      {children}
    </AppSidebar>
  );
}

async function JobListingMenu({orgId}: {orgId:string}) {
  const jobListings = await getJobListings(orgId);
  if (jobListings.length == 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/employer/job-listings/new">
              <PlusIcon className="size-4" />
              Create your first job listing
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  //grouping our job listings
  return Object.entries(Object.groupBy(jobListings, (j) => j.status))
    .sort(([statusA], [statusB]) => {
      return sortJobListingByStatus(
        statusA as JobListingStatus,
        statusB as JobListingStatus
      );
    })
    .map(([status, jobListings]) => (
      <JobListingMenuGroup
        key={status}
        status={status as JobListingStatus}
        jobListings={jobListings}
      />
    ));

  return <></>;
}

async function getJobListings(orgId: string) {
  const jobListings = db
    .select({
      id: JobListingTable.id,
      title: JobListingTable.title,
      status: JobListingTable.status,
      applicationCount: count(JobListingApplicationTable.userId),
    })
    .from(JobListingTable)
    .where(eq(JobListingTable.organizationId, orgId))
    .leftJoin(
      JobListingApplicationTable,
      eq(JobListingTable.id, JobListingApplicationTable.jobListingId)
    )
    .groupBy(JobListingApplicationTable.jobListingId, JobListingTable.id)
    .orderBy(desc(JobListingTable.createdAt));

  return jobListings;
}
