"use server";

import { db } from "@/drizzle/db";
import { EventTable } from "@/drizzle/schema";
import { eventFormSchema } from "@/schema/events";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const { userId } = await auth();

export async function CreateEvent(unsafeData: z.infer<typeof eventFormSchema>): Promise<
  | {
      error: boolean;
    }
  | undefined
> {
  const { success, data } = eventFormSchema.safeParse(unsafeData);
  if (!success || userId == null) return { error: true };

  await db.insert(EventTable).values({ ...data, clerkUserId: userId });
  redirect("/events");
}
