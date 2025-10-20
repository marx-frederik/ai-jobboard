import { auth } from "@clerk/nextjs/server";
import { SidebarUserButtonClient } from "./SiderbarUserButtonClient";

export async function SidebarUserButton() {
  const { userId } = await auth();
  return (
    <SidebarUserButtonClient
      user={{
        email: "freddy-marx@hotmail.de",
        name: "Frederik Marx",
        imageURL: "",
      }}
    />
  );
}
