import { auth } from "@clerk/nextjs/server";
import { SidebarUserButtonClient } from "./SiderbarUserButtonClient";
import getCurrentUser from "@/services/clerk/lib/getCurrentUser";
import { SignOutButton } from "@/services/clerk/components/AuthButtons";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { LogOutIcon } from "lucide-react";

export async function SidebarUserButton() {
  const { user } = await getCurrentUser({ allData: true });
  if (user == null) {
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
  return <SidebarUserButtonClient user={user} />;
}
