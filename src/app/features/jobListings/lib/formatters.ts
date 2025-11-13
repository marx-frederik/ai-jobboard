import {
  ExperienceLevel,
  JobListingType,
  LocationRequirement,
  WageInterval,
} from "@/drizzle/schema";

export function formatWageInterval(intervals: WageInterval) {
  switch (intervals) {
    case "hourly":
      return "Hour";
    case "yearly":
      return "Year";
    default:
      throw new Error("Invalid wage interval");
  }
}

export function formatLocationRequirement(
  locationRequirement: LocationRequirement
) {
  switch (locationRequirement) {
    case "in-office":
      return "In Office";
    case "hybrid":
      return "Hybrid";
    case "remote":
      return "Remote";

    default:
      throw new Error("No valid location found.");
  }
}

export function formatExperienceLevel(experienceLevel: ExperienceLevel) {
  switch (experienceLevel) {
    case "junior":
      return "Junior";
    case "mid-level":
      return "Mid-Level";
    case "senior":
      return "Senior";

    default:
      throw new Error("No valid experience level found.");
  }
}

export function formatJobType(jobType: JobListingType) {
  switch (jobType) {
    case "internship":
      return "Internship";
    case "part-time":
      return "Part-Time";
    case "full-time":
      return "Full-Time";

    default:
      throw new Error("No valid job type found.");
  }
}
