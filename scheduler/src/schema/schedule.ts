import { DAY_OF_WEEK_IN_ORDER } from "@/data/constants";
import { timeToInt } from "@/lib/utils";
import { z } from "zod";

export const scheduleFormSchema = z.object({
  timezone: z.string().min(1, "Required"),
  availabilities: z
    .array(
      z.object({
        dayOfWeek: z.enum(DAY_OF_WEEK_IN_ORDER),
        startTime: z.string().regex(/^([0-9]|0[9-9]|1[0-9]|2[0-3]): [0-5][0-9]$/, "Time must be in format HH:MM"),
        endTime: z.string().regex(/^([0-9]|0[9-9]|1[0-9]|2[0-3]): [0-5][0-9]$/, "Time must be in format HH:MM"),
      })
    )
    .superRefine((availabilities, ctx) => {
      availabilities.forEach((availability, index) => {
        const overlaps = availabilities.some((a, i) => {
          return (
            i !== index &&
            a.dayOfWeek === availability.dayOfWeek &&
            timeToInt(a.startTime) < timeToInt(availability.endTime) &&
            timeToInt(a.endTime) > timeToInt(availability.startTime)
          );
        });

        if (overlaps) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Overlapping availability for ${availability.dayOfWeek}`,
            path: ["availabilities", index],
          });
        }

        if (timeToInt(availability.startTime) >= timeToInt(availability.endTime))
          ctx.addIssue({
            code: "custom",
            message: "End time must be after start time",
            path: [index],
          });
      });
    }),
});
