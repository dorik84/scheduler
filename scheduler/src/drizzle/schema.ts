import { boolean, index, integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { DAY_OF_WEEK_IN_ORDER } from "../data/constants";
import { relations } from "drizzle-orm";

const createdAt = timestamp("createdAt").defaultNow();
const updatedAt = timestamp("updatedAt")
  .defaultNow()
  .$onUpdate(() => new Date());


export const EventTable = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    desc: text("desc"),
    duration: integer("durationInMinutes").notNull(),
    clerkUserId: text("clerkUserId").notNull(),
    isActive: boolean("isActive").notNull().default(true),
    createdAt,
    updatedAt,
  },
  (table) => [index("clerUserIdIndex").on(table.clerkUserId)]
);


export const ScheduleTable = pgTable("schedules", {
  id: uuid("id").primaryKey().defaultRandom(),
  timezone: text("timezone").notNull(),
  clerkUserId: text("clerkUserId").notNull().unique(),
  createdAt,
  updatedAt,
});
export const scheduleRelations = relations(ScheduleTable, ({ many }) => ({ availabilities: many(ScheduleAvailabilityTable) }));

export const scheduleDayOfWeekEnum = pgEnum("day", DAY_OF_WEEK_IN_ORDER);
export const ScheduleAvailabilityTable = pgTable(
  "availability",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    scheduleId: uuid("scheduleId")
      .notNull()
      .references(() => ScheduleTable.id, { onDelete: "cascade" }),
    startTime: text("startTime").notNull(),
    endTime: text("endTime").notNull(),
    dayOfWeek: scheduleDayOfWeekEnum("dayOdWeek").notNull(),
  },
  (table) => [index("scheduleIdIndex").on(table.scheduleId)]
);
export const scheduleAvailabilityRelations = relations(ScheduleAvailabilityTable, ({ one }) => ({
  schedule: one(ScheduleTable, { fields: [ScheduleAvailabilityTable.scheduleId], references: [ScheduleTable.id] }),
}));
