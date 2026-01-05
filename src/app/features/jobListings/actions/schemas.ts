import {
  experienceLevels,
  jobListingTypes,
  locationRequirements,
  wageIntervals,
} from "@/drizzle/schema";
import z from "zod";

export const jobListingSchema = z
  .object({
    title: z.string().min(1, "Required"),
    description: z.string().min(1, "Required"),
    experienceLevel: z.enum(experienceLevels),
    locationRequirement: z.enum(locationRequirements),
    type: z.enum(jobListingTypes),
    wage: z.number().int().positive().min(1, "Must be positive").nullable(),
    wageInterval: z.enum(wageIntervals).nullable(),
    stateAbbreviation: z
      .string()
      .transform((val) => (val.trim() === "" ? null : val))
      .nullable(),
    city: z
      .string()
      .transform((val) => (val.trim() === "" ? null : val))
      .nullable(),
  })
  .refine(
    (data) => {
      return data.locationRequirement === "remote" || data.city != null;
    },
    {
      message: "Required for non-remote listings",
      path: ["city"],
    }
  )
  .refine(
    (data) => {
      return (
        data.locationRequirement === "remote" || data.stateAbbreviation != null
      );
    },
    {
      message: "Required for non-remote listings",
      path: ["stateAbbreviation"],
    }
  );

export const jobListingApplicationFormSchema = z.object({
  coverLetter: z
    .string()
    .nullable()
    .transform((val) => (val?.trim() === " " ? null : val)),
});

export const jobListingAiSearchSchema = z.object({
  query: z.string().min(1, "Required"),
});
