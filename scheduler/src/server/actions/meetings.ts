"use server";
import { db } from "@/drizzle/db";
import { getValidTimesFromSchedule } from "@/lib/getValidTimesFromSchedule";
import { meetingActionSchema } from "@/schema/meetings";
import { z } from "zod";
import { createCalendarEvent } from "../googleCalendar";
import { redirect } from "next/navigation";

export async function createMeeting(unsafeData: z.infer<typeof meetingActionSchema>) {
  const { success, data } = meetingActionSchema.safeParse(unsafeData);

  if (!success) return { error: true };

  const event = await db.query.EventTable.findFirst({
    where: ({ clerkUserId, isActive, id }, { eq, and }) => and(eq(isActive, true), eq(clerkUserId, data.clerkUserId), eq(id, data.eventId)),
  });

  if (event == null) return { error: true };

  const validTimes = await getValidTimesFromSchedule([data.startTime], event);

  if (validTimes.length === 0) return { error: true };

  await createCalendarEvent({ ...data, durationInMinutes: event.duration, eventName: event.name });

  redirect(`/book/${data.clerkUserId}/${data.eventId}/success?startTime=${data.startTime}`);
}
