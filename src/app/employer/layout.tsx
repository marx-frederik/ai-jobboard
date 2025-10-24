import { ReactNode } from "react";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { SidebarUserButton } from "../features/users/components/SidebarUserButton";
import {
  ClipboardListIcon,
  Plus,
} from "lucide-react";
import SidebarNavMenuGroup from "@/components/sidebar/SidebarNavMenuGroup";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { SidebarOrganizationButton } from "../features/organizations/components/components/SidebarOrganizationButton";

export default function EmployerLayout({ children }: { children: ReactNode }) {
  return (
    <AppSidebar
      content={
        <>
          <SidebarGroup>
            <SidebarGroupLabel>Job Listings</SidebarGroupLabel>
            <SidebarGroupAction title="Add Job Listing" asChild>
              <Link href="/employer/job-listing/new">
                <span className="sr-only">Add Lob Listing</span>
                <Plus />
              </Link>
            </SidebarGroupAction>
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
