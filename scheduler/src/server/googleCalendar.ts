"use server";

import { google } from "googleapis";
import { clerkClient } from "@clerk/nextjs/server";
import { startOfDay, endOfDay, addMinutes } from "date-fns";

export async function getCalendarEventTimes(clerkUserId: string, { start, end }: { start: Date; end: Date }) {
  const OAuthClient = await getOAuthClient(clerkUserId);

  const events = await google.calendar("v3").events.list({
    auth: OAuthClient,
    calendarId: "primary",
    eventTypes: ["default"],
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 200,
  });

  return (events.data.items ?? []).map((event) => {
    if (event.start?.date != null && event.end?.date != null) {
      return {
        start: startOfDay(event.start.date),
        end: endOfDay(event.end.date),
      };
    }
    if (event.start?.dateTime != null && event.end?.dateTime != null) {
      return {
        start: new Date(event.start.dateTime),
        end: new Date(event.end.dateTime),
      };
    }
  });
}

export async function createCalendarEvent({
  clerkUserId,
  guestName,
  guestEmail,
  startTime,
  guestNotes,
  durationInMinutes,
  eventName,
}: {
  clerkUserId: string;
  guestName: string;
  guestEmail: string;
  startTime: Date;
  guestNotes?: string | null;
  durationInMinutes: number;
  eventName: string;
}) {
  const oAuthClient = await getOAuthClient(clerkUserId);
  const calendarUser = await (await clerkClient()).users.getUser(clerkUserId);
  if (calendarUser.primaryEmailAddress == null) {
    throw new Error("Clerk user has no email");
  }

  const calendarEvent = await google.calendar("v3").events.insert({
    calendarId: "primary",
    auth: oAuthClient,
    sendUpdates: "all",
    requestBody: {
      attendees: [
        { email: guestEmail, displayName: guestName },
        {
          email: calendarUser.primaryEmailAddress.emailAddress,
          displayName: calendarUser.fullName,
          responseStatus: "accepted",
        },
      ],
      description: guestNotes ? `Additional Details: ${guestNotes}` : undefined,
      start: {
        dateTime: startTime.toISOString(),
      },
      end: {
        dateTime: addMinutes(startTime, durationInMinutes).toISOString(),
      },
      summary: `${guestName} + ${calendarUser.fullName}: ${eventName}`,
    },
  });

  return calendarEvent.data;
}

async function getOAuthClient(clerkUserId: string) {
  const client = await clerkClient();
  const token = await client.users.getUserOauthAccessToken(clerkUserId, "oauth_google");
  if (token.data.length === 0 || token.data[0].token === null) return;

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_AUTH_CLIENT_ID,
    process.env.GOOGLE_AUTH_CLIENT_SECRET,
    process.env.GOOGLE_AUTH_REDIRECT_URL
  );

  oauth2Client.setCredentials({ access_token: token.data[0].token });
  return oauth2Client;
}
