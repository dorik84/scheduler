import { db } from "@/drizzle/db";
import { clerkClient } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
export default async function BookingPage({ params: { clerkUserId } }: { params: { clerkUserId: string } }) {
  const events = await db.query.EventTable.findMany({
    where: ({ clerkUserId: userIdCol, isActive }, { eq, and }) => and(eq(userIdCol, clerkUserId), eq(isActive, true)),
    orderBy: ({ name }, { desc }) => desc(name),
  });

  if (events.length === 0) return notFound();

  const client = await clerkClient();
  const { fullName } = await client.users.getUser(clerkUserId);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-4xl md:text-5xl font-semibold mb-4 text-center">{fullName}</div>;
    </div>
  );
}
