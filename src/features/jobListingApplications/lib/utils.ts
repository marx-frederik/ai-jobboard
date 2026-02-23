import { ApplicationStage } from "@/drizzle/schema";

export function sortApplicationByStage(
  a: ApplicationStage,
  b: ApplicationStage
) {
  return APPLICATION_STAGE_SORT_ORDER[a] - APPLICATION_STAGE_SORT_ORDER[b];
}

const APPLICATION_STAGE_SORT_ORDER: Record<ApplicationStage, number> = {
  applied: 0,
  interested: 1,
  interviewed: 2,
  hired: 3,
  denied: 4,
};

export function formatJobListingApplicationStage(stage: ApplicationStage) {
  switch (stage) {
    case "denied":
      return "Denied";
    case "applied":
      return "Applied";
    case "interested":
      return "Interested";
    case "interviewed":
      return "Interviewed";
    case "hired":
      return "Hired";
    default:
      throw new Error(`Unknown application stage ${stage satisfies never}`);
  }
}
