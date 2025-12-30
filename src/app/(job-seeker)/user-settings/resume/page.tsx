import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Suspense } from "react";
import { DropzoneClient } from "./_DropzoneClient";
import getCurrentUser from "@/services/clerk/lib/getCurrentUser";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { db } from "@/drizzle/db";
import { UserResumeTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export default function UserResumePage() {
  return (
    <div className="max-3xl mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-bold">Upload your resume</h1>
      <Card>
        <CardContent>
          <DropzoneClient />
        </CardContent>
        <Suspense>
          <ResumeDetails />
        </Suspense>
      </Card>
      <Suspense>
        <AISummaryCard />
      </Suspense>
    </div>
  );
}

async function ResumeDetails() {
  const { userId } = await getCurrentUser();
  if (userId == null) return null;
  const userResume = await getUserResume(userId);
  if (userResume == null) return null;
  return (
    <Button asChild>
      <Link
        href={userResume.resumeFileUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        View Resume
      </Link>
    </Button>
  );
}

async function AISummaryCard() {
  const { userId } = await getCurrentUser();
  if (userId == null) return null;
  const userResume = await getUserResume(userId);
  if (userResume == null || userResume.aiSummary == null) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Summary</CardTitle>
        <CardDescription>
          This is an AI generated summary of our resume. This is used by
          emploeyers to quickly understand your qulifications and experience.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

async function getUserResume(userId: string) {
  return db.query.UserResumeTable.findFirst({
    where: eq(UserResumeTable.userId, userId),
  });
}
