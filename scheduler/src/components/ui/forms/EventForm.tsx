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
import { createEvent, deleteEvent, updateEvent } from "@/server/actions/events";

import {
  AlertDialogHeader,
  AlertDialogCancel,
  AlertDialogTrigger,
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
} from "../alert-dialog";
import { useTransition } from "react";

export function EventForm({
  event,
}: {
  event?: {
    id: string;
    isActive: boolean;
    name: string;
    duration: number;
    clerkUserId: string;
    desc?: string;
  };
}) {
  const [isDeletePending, startDeleteTransition] = useTransition();
  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: event ?? {
      isActive: true,
      duration: 30,
      name: "",
    },
  });

  async function onSubmit(values: z.infer<typeof eventFormSchema>) {
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
          name="desc"
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
          {event && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructiveGhost" disabled={isDeletePending || form.formState.isSubmitting}>
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogDescription>This action cannot be undone. This will permanently delete this event</AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={isDeletePending || form.formState.isSubmitting}
                  variant='destructiveGhost'
                  onClick={() =>
                    startDeleteTransition(async () => {
                      const data = await deleteEvent(event.id);
                      if (data?.error){
                        form.setError("root", { message: "there was error deleting your event" });
                      }
                    })
                  }
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button type="button" variant="outline" asChild>
            <Link href="/events">Cancel</Link>
          </Button>
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
}
