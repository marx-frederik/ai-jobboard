import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { LogInIcon } from "lucide-react";
import Link from "next/link";
import { SidebarUserButton } from "./features/users/components/SidebarUserButton";
import { AppSidebarClient } from "./_AppSidebarClient";

export default function Home() {
  return (
    <>
      <SidebarProvider>
        <AppSidebarClient>
          <Sidebar collapsible="icon" className="overflow-hidden">
            <SidebarHeader className="flex-row">
              <SidebarTrigger />
              <span className="text-xl">Netzschmiede</span>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarMenu>
                  <SignedOut>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/sign-in">
                          <LogInIcon />
                          <span>Log in</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SignedOut>
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <SidebarGroup>
                <SidebarMenu>
                  <SignedIn>
                    <SidebarUserButton />
                  </SignedIn>
                </SidebarMenu>
              </SidebarGroup>
            </SidebarFooter>
          </Sidebar>
          <main className="flex-1"></main>
        </AppSidebarClient>
      </SidebarProvider>
    </>
  );
}
