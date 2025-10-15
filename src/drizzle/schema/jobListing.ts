import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { OrganizationTable } from "./organizations";
import { relations } from "drizzle-orm";
import { JobListingApplicationTable } from "./jobListingApplication";

export const wageIntervals = ["hourly", "yearly"] as const;
type WageInterval = (typeof wageIntervals)[number];
export const wageIntervalEnum = pgEnum("wage_interval", wageIntervals);

const locationIntervals = ["remote", "onsite", "hybrid"] as const;
type LocationInterval = (typeof locationIntervals)[number];
export const locationIntervalEnum = pgEnum(
  "location_interval",
  locationIntervals
);

const experienceLevels = ["entry", "intermediate", "senior"] as const;
type ExperienceLevel = (typeof experienceLevels)[number];
export const experienceLevelEnum = pgEnum("experience_level", experienceLevels);

const jobTypes = ["full-time", "part-time", "contract", "internship"] as const;
type JobType = (typeof jobTypes)[number];
export const jobTypeEnum = pgEnum("job_type", jobTypes);

export const JobListingTable = pgTable(
  "job_listings",
  {
    id: uuid().primaryKey().defaultRandom(),
    organizationId: varchar().references(() => OrganizationTable.id, {
      onDelete: "cascade",
    }),
    title: varchar().notNull(),
    description: varchar().notNull(),
    wageInterval: wageIntervalEnum("hourly").notNull(),
    wage: integer().notNull(),
    stateAbbreviation: varchar(),
    city: varchar(),
    isFeatured: boolean().notNull().default(false),
    locationInterval: locationIntervalEnum("onsite").notNull(),
    experienceLevel: experienceLevelEnum("entry").notNull(),
    jobType: jobTypeEnum("full-time").notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
  },
  (table) => [index().on(table.stateAbbreviation)]
);

export const jobListingRelations = relations(
  JobListingTable,
  ({ one, many }) => ({
    organization: one(OrganizationTable, {
      fields: [JobListingTable.organizationId],
      references: [OrganizationTable.id],
    }),
    application: many(JobListingApplicationTable),
  })
);
