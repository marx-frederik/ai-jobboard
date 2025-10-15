import { timestamp } from "drizzle-orm/pg-core";
import {pgTable, varchar} from "drizzle-orm/pg-core";

export const UserTable = pgTable("users", {
    id: varchar().primaryKey(),
    name: varchar().notNull(),
    email: varchar().notNull(),
    imageUrl: varchar().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
})