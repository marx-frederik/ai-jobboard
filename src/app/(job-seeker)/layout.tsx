import { ReactNode } from "react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { SidebarUserButton } from "../features/users/components/SidebarUserButton";
import { SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import {
  BrainCircuitIcon,
  Brain,
  ClipboardListIcon,
  LogInIcon,
  LayoutDashboardIcon,
} from "lucide-react";
import SidebarNavMenuGroup from "@/components/sidebar/SidebarNavMenuGroup";

export default function JobSeekerLayout({ children }: { children: ReactNode }) {
  return (
    <AppSidebar
      content={
        <SidebarNavMenuGroup
          className="mt-auto"
          items={[
            { href: "/", icon: <ClipboardListIcon />, label: "Jobboard" },
            {
              href: "/ai-search",
              icon: <BrainCircuitIcon />,
              label: "AI Search",
            },
            {
              href: "/employer",
              icon: <LayoutDashboardIcon />,
              label: "Employer Dashboard",
              authStatus:"signedIn"
            },
            {
              href: "/sign-in",
              icon: <LogInIcon />,
              label: "Sign In",
              authStatus:"signedOut"
            },
          ]}
        />
      }
      footerButton={<SidebarUserButton />}
    >
      {children}
    </AppSidebar>
  );
}
