"use server";

import { google } from "googleapis";
import { clerkClient } from "@clerk/nextjs/server";
import { startOfDay, endOfDay } from "date-fns";

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
