"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventFormSchema } from "@/schema/events";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../form";
import { Input } from "../input";
import { Button } from "../button";
import Link from "next/link";
import { Textarea } from "../textarea";
import { Switch } from "../switch";
import { CreateEvent } from "@/server/actions/events";

export function EventForm() {
  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      isActive: true,
      duration: 30,
      name: "",
    },
  });

  async function onSubmit(values: z.infer<typeof eventFormSchema>) {
    const data = await CreateEvent(values);
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>The name users see when booking</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormDescription>In minutes</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration</FormLabel>
              <FormControl>
                <Textarea className="resize-none h-32" {...field} />
              </FormControl>
              <FormDescription>Optional description for an event</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>Active</FormLabel>
                <FormControl>
                  <Switch {...field} checked={field.value} value={undefined} onCheckedChange={field.onChange} />
                </FormControl>
              </div>
              <FormDescription>Optional description for an event</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" asChild>
            <Link href="/events">Cancel</Link>
          </Button>
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
}
