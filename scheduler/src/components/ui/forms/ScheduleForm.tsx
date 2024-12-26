"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventFormSchema } from "@/schema/events";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../form";

import { Button } from "../button";

import { createEvent, updateEvent } from "@/server/actions/events";

import { useTransition } from "react";
import { DAY_OF_WEEK_IN_ORDER } from "@/data/constants";
import { scheduleFormSchema } from "@/schema/schedule";
import { timeToInt } from "@/lib/utils";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "./../select";
import { formatTimeZoneOffset } from "@/lib/formatters";

type Availability = {
  startTime: string;
  endTime: string;
  dayOfWeek: (typeof DAY_OF_WEEK_IN_ORDER)[number];
};

export function ScheduleForm({
  schedule,
}: {
  schedule?: {
    timezone: string;
    availabilities: Availability[];
  };
}) {
  const [isDeletePending, startDeleteTransition] = useTransition();
  const form = useForm<z.infer<typeof scheduleFormSchema>>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      timezone: schedule?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
      availabilities: schedule?.availabilities.toSorted((a, b) => timeToInt(a.startTime) - timeToInt(b.startTime)),
    },
  });

  async function onSubmit(values: z.infer<typeof scheduleFormSchema>) {
    const action = event == null ? createEvent : updateEvent.bind(null, event.id);
    const data = await action(values);
    if (data?.error) {
      form.setError("root", { message: "there was error saving your event" });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {form.formState.errors.root && <div className="text-destructive text-sm">{form.formState.errors.root.message}</div>}
        <FormField
          control={form.control}
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timezone</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue></SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Intl.supportedValuesOf("timeZone").map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                      {` (${formatTimeZoneOffset(tz)})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>

        <div className="flex gap-2 justify-end">
          <Button disabled={form.formState.isSubmitting} type="submit">
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}
