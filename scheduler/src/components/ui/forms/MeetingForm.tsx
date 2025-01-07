"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../form";

import { Button } from "../button";
import Link from "next/link";

import { useMemo, useTransition } from "react";
import { meetingFormSchema } from "@/schema/meetings";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select";
import { formatDate, formatTimeZoneOffset } from "@/lib/formatters";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { Calendar } from "../calendar";
import { isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { toZonedTime } from "date-fns-tz";

export function MeetingForm({ validTimes, eventId, clerkUserId }: { validTimes: Date[]; eventId: string; clerkUserId: string }) {
  const form = useForm<z.infer<typeof meetingFormSchema>>({
    resolver: zodResolver(meetingFormSchema),
    defaultValues: { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
  });

  const timezone = form.watch("timezone");
  const validTimesInTimezone = useMemo(() => {
    return validTimes.map((date) => toZonedTime(date, timezone));
  }, [validTimes, timezone]);
  console.log(validTimes);
  async function onSubmit(values: z.infer<typeof meetingFormSchema>) {
    const data = await createMeeting(values);
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

        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <Popover>
                <FormItem className="flex-1">
                  <FormLabel>Date</FormLabel>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn("pl-3 text-left font-normal flex w-full", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? formatDate(field.value) : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => !validTimesInTimezone.some((time) => isSameDay(date, time))}
                      initialFocus
                    />
                  </PopoverContent>
                  <FormMessage />
                </FormItem>
              </Popover>
            )}
          />
        </div>

        <div className="flex gap-2 justify-end">
          <Button disabled={form.formState.isSubmitting} type="button" variant="outline" asChild>
            <Link href="/events">Cancel</Link>
          </Button>
          <Button disabled={form.formState.isSubmitting} type="submit">
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}
