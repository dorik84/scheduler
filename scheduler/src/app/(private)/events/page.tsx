import { Button } from "@/components/ui/button";
import { db } from "@/drizzle/db";
import { auth } from "@clerk/nextjs/server";
import { desc } from "drizzle-orm";
import { CalendarPlus, CalendarRange } from "lucide-react";
import Link from "next/link";

const EventsPage = async () => {
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
        {events.length > 0 ? (
          <h1>Events list</h1>
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
};

export default EventsPage;
