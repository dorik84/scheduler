import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MeetingForm } from "@/components/ui/forms/MeetingForm";
import { db } from "@/drizzle/db";
import { getValidTimesFromSchedule } from "@/lib/getValidTimesFromSchedule";
import { clerkClient } from "@clerk/nextjs/server";
import { addMonths, eachMinuteOfInterval, endOfDay, roundToNearestMinutes } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";

type BookEventPageParams = {
  clerkUserId: string;
  eventId: string;
};

export default async function BookEventPage({ params }: { params: BookEventPageParams }) {
  const { clerkUserId, eventId } = await params;
  const event = await db.query.EventTable.findFirst({
    where: ({ clerkUserId: userIdCol, isActive, id }, { eq, and }) => and(eq(isActive, true), eq(userIdCol, clerkUserId), eq(id, eventId)),
  });

  if (event == null) return notFound();

  const calendarUser = await (await clerkClient()).users.getUser(clerkUserId);
  const startDate = roundToNearestMinutes(new Date(), { nearestTo: 15, roundingMethod: "ceil" });
  const endDate = endOfDay(addMonths(startDate, 2));

  const validTimes = await getValidTimesFromSchedule(eachMinuteOfInterval({ start: startDate, end: endDate }, { step: 15 }), event);
  if (validTimes.length === 0) return <NoTimeSlots event={event} calendarUser={calendarUser} />;
  return (
    <Card className="max-w-mdmx-auto">
      <CardHeader>
        <CardTitle>
          Book {event.name} with {calendarUser.fullName}
        </CardTitle>
        {event.desc && <CardDescription>{event.desc}</CardDescription>}
      </CardHeader>
      <CardContent>
        <MeetingForm validTimes={validTimes} eventId={event.id} clerkUserId={clerkUserId} />
      </CardContent>
    </Card>
  );
}

function NoTimeSlots({
  event,
  calendarUser,
}: {
  event: { name: string; desc: string | null };
  calendarUser: { id: string; fullName: string | null };
}) {
  return (
    <Card className="max-w-mdmx-auto">
      <CardHeader>
        <CardTitle>
          Book {event.name} with {calendarUser.fullName}
        </CardTitle>
        {event.desc && <CardDescription>{event.desc}</CardDescription>}
      </CardHeader>
      <CardContent>{calendarUser.fullName} is currently booked up. Please check back later or choose a shorter event.</CardContent>
      <CardFooter>
        <Button asChild>
          <Link href={`/book/${calendarUser.id}`}>Choose Another Event</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
