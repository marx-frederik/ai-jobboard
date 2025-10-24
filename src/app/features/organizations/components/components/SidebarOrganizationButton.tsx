import { auth } from "@clerk/nextjs/server";
import { SidebarOrganizationButtonClient } from "./SiderbarOrganizationButtonClient";
import getCurrentUser from "@/services/clerk/lib/getCurrentUser";
import { SignOutButton } from "@/services/clerk/components/AuthButtons";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { LogOutIcon } from "lucide-react";
import getCurrentOrganization from "@/services/clerk/lib/getCurrentOrganization";

export async function SidebarOrganizationButton() {
  const [{ user }, { organization }] = await Promise.all([
    getCurrentUser({ allData: true }),
    getCurrentOrganization({ allData: true }),
  ]);
  if (user == null || organization == null) {
    return (
      //In case the webhook has not yet created the user in the database
      <SignOutButton>
        <SidebarMenuButton>
          <LogOutIcon />
          <span>Log Out</span>
        </SidebarMenuButton>
      </SignOutButton>
    );
  }
  return <SidebarOrganizationButtonClient user={user} organization={organization} />;
}
