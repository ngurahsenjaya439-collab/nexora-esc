import "server-only";

import { cookies } from "next/headers";
import { getIronSession } from "iron-session";

import { sessionOptions, type SessionData } from "@/lib/session-config";

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}
