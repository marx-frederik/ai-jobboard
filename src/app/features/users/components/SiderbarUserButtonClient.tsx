"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

type User = { name: string; imageURL: string; email: string }

export function SidebarUserButtonClient(user: {
  user: User;
}) {
  const isMobile = useIsMobile();
  return (
    <SidebarMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
        <SidebarMenuButton>
            <UserInfo {...user}/>
        </SidebarMenuButton>
        </DropdownMenuTrigger>
        </DropdownMenu>
    </SidebarMenu>
  );
}

function UserInfo(user:User){
    return <div>
        <Avatar className="">
            <AvatarImage src={imageURL} alt={name}/>
        </Avatar>
    </div>
}