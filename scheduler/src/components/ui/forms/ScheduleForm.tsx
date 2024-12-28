"use client";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../form";
import { Button } from "../button";

import { Fragment, useState } from "react";
import { DAY_OF_WEEK_IN_ORDER } from "@/data/constants";
import { scheduleFormSchema } from "@/schema/schedule";
import { timeToInt } from "@/lib/utils";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "./../select";
import { formatTimeZoneOffset } from "@/lib/formatters";
import { Plus, X } from "lucide-react";
import { Input } from "../input";
import { saveSchedule } from "@/server/actions/schedules";

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
  let [successMessage, setSuccessMessage] = useState<string>();
  const form = useForm<z.infer<typeof scheduleFormSchema>>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      timezone: schedule?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
      availabilities: schedule?.availabilities.toSorted((a, b) => timeToInt(a.startTime) - timeToInt(b.startTime)),
    },
  });

  const { append: appendAvailability, remove: removeAvailability, fields: availabilityFields } = useFieldArray({ name: "availabilities", control: form.control });

  const groupedAvailabilityFields = Object.groupBy(
    availabilityFields.map((field, index) => ({ ...field, index })),
    (availability) => availability.dayOfWeek
  );

  async function onSubmit(values: z.infer<typeof scheduleFormSchema>) {
    const data = await saveSchedule(values);
    if (data?.error) {
      form.setError("root", { message: "there was error saving your schedule" });
    } else {
      setSuccessMessage("Schedule saved successfully");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {form.formState.errors.root && <div className="text-destructive text-sm">{form.formState.errors.root.message}</div>}
        {successMessage && <div className="text-green-500 text-sm">{successMessage}</div>}
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

        <div className="grid grid-cols-[auto,1fr] gap-y-6 gap-x-4">
          {DAY_OF_WEEK_IN_ORDER.map((dayOfWeek) => (
            <Fragment key={dayOfWeek}>
              <div className="capitalize text-sm font-semibold">{dayOfWeek.substring(0, 3)}</div>
              <div className="flex flex-col gap-2">
                <Button
                  className="size-6 p-1"
                  type="button"
                  variant={"outline"}
                  onClick={() => {
                    appendAvailability({
                      dayOfWeek,
                      startTime: "09:00",
                      endTime: "17:00",
                    });
                  }}
                >
                  <Plus className="size-full" />
                </Button>
                {groupedAvailabilityFields[dayOfWeek]?.map((field, labelIndex) => (
                  <div className="flex flex-col gap-1" key={field.id}>
                    <div className="flex gap-2 items-center">
                      <FormField
                        control={form.control}
                        name={`availabilities.${field.index}.startTime`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input className="w-24" aria-label={`${dayOfWeek} Start Time ${labelIndex + 1}`} {...field}></Input>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      ></FormField>

                      <FormField
                        control={form.control}
                        name={`availabilities.${field.index}.endTime`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input className="w-24" aria-label={`${dayOfWeek} End Time ${labelIndex + 1}`} {...field}></Input>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      ></FormField>
                      <Button type="button" className="size-6 p-1" variant={"destructiveGhost"} onClick={() => removeAvailability(field.index)}>
                        <X />
                      </Button>
                    </div>
                    <FormMessage>{form.formState.errors.availabilities?.at?.(field.index)?.root?.message}</FormMessage>
                    <FormMessage>{form.formState.errors.availabilities?.at?.(field.index)?.startTime?.message}</FormMessage>
                    <FormMessage>{form.formState.errors.availabilities?.at?.(field.index)?.endTime?.message}</FormMessage>
                  </div>
                ))}
              </div>
            </Fragment>
          ))}
        </div>

        <div className="flex gap-2 justify-end">
          <Button disabled={form.formState.isSubmitting} type="submit">
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}
