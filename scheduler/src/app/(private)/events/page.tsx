import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { EventButton } from "@/components/ui/EventButton";

import { db } from "@/drizzle/db";
import { formatEventDescription } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { desc } from "drizzle-orm";
import { CalendarPlus, CalendarRange } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";
export default async function EventsPage() {
  const { userId, redirectToSignIn } = await auth();
  if (userId == null) redirectToSignIn();

  const events = await db.query.EventTable.findMany({
    where: (EventTable, { eq }) => eq(EventTable.clerkUserId, userId!),
    orderBy: ({ createdAt }, { desc }) => desc(createdAt),
  });
  console.log(events);
  return (
    <>
      <div className="flex gap-4 items-start">
        <h1 className="text-3xl lg:text-4xl xl:text-5xl font-semibold mb-6">Events</h1>
        <Button asChild>
          <Link href="events/new">
            <CalendarPlus className="mr-4 size-6" />
            New Event
          </Link>
        </Button>
      </div>
      {events.length ? (
        <div className="grid gap-5 grid-cols-[repeat(auto-fill,minmax(400px,1fr))]">
          {events.map((event) => (
            <EventCard key={event.id} {...event}></EventCard>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <CalendarRange className="size-16 mx-auto" />
          You don't have events yet. Click here to get started!
          <Button size="lg" className="text-lg" asChild>
            <Link href="events/new">
              <CalendarPlus className="mr-4 size-6" />
              New Event
            </Link>
          </Button>
        </div>
      )}
    </>
  );
}

type EventCardProps = {
  id: string;
  isActive: boolean;
  name: string;
  duration: number;
  clerkUserId: string;
  desc: string | null;
};

function EventCard({ id, isActive, name, duration, clerkUserId, desc }: EventCardProps) {
  return (
    <Card className={cn("flex flex-col", !isActive && "border-secondary/50")}>
      <CardHeader className={cn(!isActive && "opacity-50")}>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{formatEventDescription(duration)}</CardDescription>
      </CardHeader>
      {desc != null && <CardContent className={cn(!isActive && "opacity-50")}>{desc}</CardContent>}
      <CardFooter className="flex justify-end gap-2 mt-auto">
        {isActive && <EventButton variant="outline" eventId={id} clerkUserId={clerkUserId} />}
        <Button asChild>
          <Link href={`/events/${id}/edit`}>Edit</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
