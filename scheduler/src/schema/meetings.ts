import { startOfDay } from "date-fns";
import { z } from "zod";

export const meetingFormSchema = z.object({
  startTime: z.date(),
  guestEmail: z.string().email().min(5, "Required"),
  guestName: z.string().min(5, "Required"),
  guestNotes: z.string().optional(),
  timezone: z.string().min(2, "Required"),
  date: z.date().min(startOfDay(new Date()), "Must be in the future"),
});
