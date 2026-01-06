import { NotificationForm } from "@/features/users/components/NotificationForm";
import { getUserNotificationSettings } from "@/features/users/db/userNotification";
import { Card, CardContent } from "@/components/ui/card";
import getCurrentUser from "@/services/clerk/lib/getCurrentUser";
import { notFound } from "next/navigation";

export default async function NotificationsPage() {
  const { userId } = await getCurrentUser();
  if (userId == null) return notFound();

  const notificationSettings = await getUserNotificationSettings(userId);
  if (notificationSettings == null) return null

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

