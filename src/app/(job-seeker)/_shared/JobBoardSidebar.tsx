import { JobListingFilterForm } from "@/features/jobListings/components/JobListingFilterForm";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";

export function JobBoardSidebar() {
  return (
    <SidebarGroup className="group-data-[state=collapsed]:hidden">
      <SidebarGroupContent className="px-1">
        <JobListingFilterForm />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
