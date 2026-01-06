import JobListingAiSearchForm from "@/features/jobListings/components/JobListingAiSearchForm";
import AsyncIf from "@/components/AsyncIf";
import LoadingSwap from "@/components/LoadingSwap";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignUpButton } from "@/services/clerk/components/AuthButtons";
import getCurrentUser from "@/services/clerk/lib/getCurrentUser";

export default function AiSearchPage() {
  return (
    <div className="p-4 flex items-center justify-center min-h-full">
      <Card className="max-w-4xl">
        <AsyncIf
          condition={async () => {
            const { userId } = await getCurrentUser();
            return userId != null;
          }}
          otherwise={NoPermission()}
          loadingFallback={
            <LoadingSwap isLoading>
              <AiCard />
            </LoadingSwap>
          }
        >
          <AiCard />
        </AsyncIf>
      </Card>
    </div>
  );
}

function AiCard() {
  return (
    <>
      <CardHeader>
        <CardTitle>AI Search</CardTitle>
        <CardDescription>
          This Can Take a few minutes to process, so please be patient.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <JobListingAiSearchForm />
      </CardContent>
    </>
  );
}

function NoPermission() {
  return (
    <CardContent className="">
      <h2 className="text-xl font-bold mb-1">Permission Denied</h2>
      <p className="mb-4 text-muted-foreground">
        You need to create an account before using AI search
      </p>
      <SignUpButton />
    </CardContent>
  );
}
