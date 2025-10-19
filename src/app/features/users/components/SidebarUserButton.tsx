import { auth } from "@clerk/nextjs/server";

export async function SidebarUserButton() {
  const { userId } = await auth();
  return (
    <SidebarUserButtonClient
      user={{ email: "freddy-marx@hotmail.de", name: "Frederik Marx" }}
    />
  );
}
