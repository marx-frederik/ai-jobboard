"use client";

import { Badge } from "@/components/ui/badge";
import {
  ExperienceLevel,
  JobListingType,
  LocationRequirement,
  experienceLevels,
  jobListingTypes,
  locationRequirements,
} from "@/drizzle/schema";
import {
  formatExperienceLevel,
  formatJobType,
  formatLocationRequirement,
} from "../lib/formatters";
import { usePathname, useRouter } from "next/navigation";
import { XIcon } from "lucide-react";
import z from "zod/v4";

type SearchParams = Record<string, string | string[] | undefined>;

type FilterDetailsProps = {
  searchParams: SearchParams;
};

const searchParamsSchema = z.object({
  title: z.string().trim().min(1).optional().catch(undefined),
  city: z.string().trim().min(1).optional().catch(undefined),
  state: z.string().trim().min(1).optional().catch(undefined),
  experience: z.enum(experienceLevels).optional().catch(undefined),
  experienceLevel: z.enum(experienceLevels).optional().catch(undefined),
  location: z.enum(locationRequirements).optional().catch(undefined),
  locationRequirement: z.enum(locationRequirements).optional().catch(undefined),
  type: z.enum(jobListingTypes).optional().catch(undefined),
  jobIds: z
    .union([z.string(), z.array(z.string())])
    .transform((v) => (Array.isArray(v) ? v : [v]))
    .optional()
    .catch([]),
});

function deleteParams(current: SearchParams, keysToDelete: string[]) {
  const nextParams = new URLSearchParams();

  Object.entries(current).forEach(([key, value]) => {
    if (keysToDelete.includes(key) || value == null) return;

    if (Array.isArray(value)) {
      value.forEach((entry) => nextParams.append(key, entry));
      return;
    }

    nextParams.set(key, value);
  });

  return nextParams;
}

export function FilterDetails({ searchParams }: FilterDetailsProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { success, data: filters } = searchParamsSchema.safeParse(searchParams);
  if (!success) return null;

  const activeLocation =
    filters.locationRequirement ?? (filters.location as LocationRequirement | undefined);
  const activeExperience =
    filters.experience ?? (filters.experienceLevel as ExperienceLevel | undefined);

  const badges: { key: string; label: string; removeKeys: string[] }[] = [];

  if (filters.title) {
    badges.push({ key: "title", label: `${filters.title}`, removeKeys: ["title"] });
  }

  if (filters.city) {
    badges.push({ key: "city", label: `${filters.city}`, removeKeys: ["city"] });
  }

  if (filters.state) {
    badges.push({
      key: "state",
      label: `${filters.state.toUpperCase()}`,
      removeKeys: ["state"],
    });
  }

  if (activeLocation && locationRequirements.includes(activeLocation)) {
    badges.push({
      key: "location",
      label: `${formatLocationRequirement(activeLocation)}`,
      removeKeys: ["location", "locationRequirement"],
    });
  }

  if (activeExperience && experienceLevels.includes(activeExperience)) {
    badges.push({
      key: "experience",
      label: `${formatExperienceLevel(activeExperience)}`,
      removeKeys: ["experience", "experienceLevel"],
    });
  }

  if (filters.type && jobListingTypes.includes(filters.type as JobListingType)) {
    badges.push({
      key: "type",
      label: `${formatJobType(filters.type as JobListingType)}`,
      removeKeys: ["type"],
    });
  }

  if (badges.length === 0) return null;

  const handleRemoveFilter = (keysToDelete: string[]) => {
    const nextParams = deleteParams(searchParams, keysToDelete);
    const query = nextParams.toString();
    router.push(query.length > 0 ? `${pathname}?${query}` : pathname);
  };

  const handleClearAll = () => {
    router.push(pathname);
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {badges.map((badge) => (
        <Badge key={badge.key} variant="outline" className="px-3 py-1 text-sm">
          <span>{badge.label}</span>
          <button
            type="button"
            aria-label={`Clear ${badge.key} filter`}
            className="bg-transparent text-muted-foreground hover:text-foreground"
            onClick={() => handleRemoveFilter(badge.removeKeys)}
          >
            <XIcon className="size-4" />
          </button>
        </Badge>
      ))}
      <button
        type="button"
        onClick={handleClearAll}
        className="text-muted-foreground text-xs underline-offset-4 hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
