import { Card, CardContent } from "@/components/ui/card";
import getCurrentUser from "@/services/clerk/lib/getCurrentUser";
import { notFound } from "next/navigation";
import getCurrentOrganization from "@/services/clerk/lib/getCurrentOrganization";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";
import { OrganizationUserSettingsTable } from "@/drizzle/schema";
import { NotificationForm } from "@/features/organizations/components/NotificationForm";

export default async function EmployerUserSettingsPage() {
  const { userId } = await getCurrentUser();
  const { orgId } = await getCurrentOrganization();
  if (userId == null || orgId == null) return notFound();

  const notificationSettings = await getNotificationSettings({
    orgId,
    userId,
  });

  return (
    <div className="max-w-3xl mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      <Card>
        <CardContent>
          <NotificationForm notificationSettings={notificationSettings} />
        </CardContent>
      </Card>
    </div>
  );
}

async function getNotificationSettings({
  orgId,
  userId,
}: {
  orgId: string;
  userId: string;
}) {
  return await db.query.OrganizationUserSettingsTable.findFirst({
    where: and(
      eq(OrganizationUserSettingsTable.userId, userId),
      eq(OrganizationUserSettingsTable.organizationId, orgId)
    ),
  });
}
