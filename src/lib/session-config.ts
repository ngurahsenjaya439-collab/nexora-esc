import type { SessionOptions } from "iron-session";

export type SessionData = {
  userId?: string;
};

const fallbackPassword = "nexora-insecure-dev-session-password-2026";
const password = process.env.SESSION_PASSWORD ?? fallbackPassword;

if (process.env.NODE_ENV === "production" && !process.env.SESSION_PASSWORD) {
  throw new Error("SESSION_PASSWORD wajib diisi di environment production.");
}

export const sessionOptions: SessionOptions = {
  cookieName: "nexora_session",
  password,
  ttl: 60 * 60 * 24 * 7,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  },
};
