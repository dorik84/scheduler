import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventForm } from "@/components/ui/forms/EventForm";
import { ScheduleForm } from "@/components/ui/forms/ScheduleForm";
import { db } from "@/drizzle/db";
import { auth } from "@clerk/nextjs/server";

export default async function SchedulePage() {
  const { userId, redirectToSignIn } = await auth();
  if (userId == null) return redirectToSignIn();

  const schedule = await db.query.ScheduleTable.findFirst({
    where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId),
    with: { availabilities: { orderBy: ({ startTime }, { desc }) => desc(startTime) } },
  });

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <ScheduleForm schedule={schedule}></ScheduleForm>
      </CardContent>
    </Card>
  );
}
