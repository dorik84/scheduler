"use server";
// import "use-server";

import { db } from "@/drizzle/db";
import { ScheduleAvailabilityTable, ScheduleTable } from "@/drizzle/schema";
import { scheduleFormSchema } from "@/schema/schedule";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

export async function saveSchedule(unsafeData: z.infer<typeof scheduleFormSchema>) {
  const { userId } = await auth();
  const { success, data } = scheduleFormSchema.safeParse(unsafeData);
  if (!success || userId == null) return { error: true };

  const { availabilities, ...scheduleData } = data;

  return await db.transaction(async (tx) => {
    // Insert/update schedule and get the ID
    const [{ id: scheduleId }] = await tx
      .insert(ScheduleTable)
      .values({ ...scheduleData, clerkUserId: userId })
      .onConflictDoUpdate({
        target: ScheduleTable.clerkUserId,
        set: scheduleData,
      })
      .returning({ id: ScheduleTable.id });

    // Delete existing availabilities
    await tx.delete(ScheduleAvailabilityTable).where(eq(ScheduleAvailabilityTable.scheduleId, scheduleId));

    // Insert new availabilities if any exist
    if (availabilities.length > 0) {
      await tx.insert(ScheduleAvailabilityTable).values(
        availabilities.map((availability) => ({
          ...availability,
          scheduleId,
        }))
      );
    }
  });
}
