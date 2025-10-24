import { db } from "@/drizzle/db";
import { OrganizationTable } from "@/drizzle/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export default async function getCurrentOrganization({ allData = false } = {}) {
  const { orgId } = await auth();

  return{
    orgId,
    organization: allData && orgId != null ? await getOrganization(orgId) : undefined
  }
}

async function getOrganization(id: string) {
  return await db.query.OrganizationTable.findFirst({
    where: eq(OrganizationTable.id, id),
  });
}
