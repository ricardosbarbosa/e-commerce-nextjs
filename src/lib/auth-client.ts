import { createAuthClient } from "better-auth/react";

/** Set `NEXT_PUBLIC_APP_URL` when the browser talks to a different origin than the page. */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  basePath: "/api/auth",
});
