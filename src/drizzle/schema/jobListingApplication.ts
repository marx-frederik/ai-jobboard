import {
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { UserTable } from "./user";
import { JobListingTable } from "./jobListing";
import { createdAt, updatedAt } from "../schemaHelpers";
import { relations } from "drizzle-orm";
import { OrganizationTable } from "./organizations";

const applicationStages = [
  "applied",
  "viewed",
  "interviewed",
  "declined",
  "accepted",
] as const;
type ApplicationStage = (typeof applicationStages)[number];
const applicationStageEnum = pgEnum("application_stage", applicationStages);

export const JobListingApplicationTable = pgTable(
  "job_listing_applications",
  {
    jobListingId: uuid().references(() => JobListingTable.id, {
      onDelete: "cascade",
    }),
    userId: uuid().references(() => UserTable.id, { onDelete: "cascade" }),
    coverLetter: text(),
    rating: integer(),
    stage: applicationStageEnum().notNull().default("applied"),
    createdAt,
    updatedAt,
  },
  (table) => [primaryKey({ columns: [table.jobListingId, table.userId] })]
);

export const jobListingApplicationRelations = relations(
  JobListingApplicationTable,
  ({ one, many }) => ({
    user: one(UserTable, {
      fields: [JobListingApplicationTable.userId],
      references: [UserTable.id],
    }),
    jobListingId: one(JobListingTable, {
      fields: [JobListingApplicationTable.jobListingId],
      references: [JobListingTable.id],
    }),
  })
);
