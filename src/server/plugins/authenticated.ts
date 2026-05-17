import { auth } from "@/lib/auth";
import { Elysia } from "elysia";

export const authenticatedPlugin = new Elysia({
  name: "authenticated",
}).macro({
  authenticated: {
    async resolve({ request, status }) {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session) {
        return status(401, { error: "Unauthorized" });
      }

      return {
        user: session.user,
        session: session.session,
      };
    },
  },
});
