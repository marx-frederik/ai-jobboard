import { timestamp } from "drizzle-orm/pg-core";
import {pgTable, varchar} from "drizzle-orm/pg-core";

export const OrganizationTable = pgTable("organizations", {
    id: varchar().primaryKey(),
    name: varchar().notNull(),
    imageUrl: varchar().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
})