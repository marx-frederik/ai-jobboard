import { FilterDetails } from "@/features/jobListings/components/FilterDetails";
import { JobListingItems } from "./_shared/JobListingItems";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className="m-4">
      <FilterDetails searchParams={resolvedSearchParams} />
      <JobListingItems searchParams={searchParams} />
    </div>
  );
}
