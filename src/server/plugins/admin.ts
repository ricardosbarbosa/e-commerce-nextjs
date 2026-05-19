import { auth } from "@/lib/auth";
import { Elysia } from "elysia";

function hasAdminRole(role: unknown) {
  if (typeof role !== "string") {
    return false;
  }

  return role
    .split(",")
    .map((value) => value.trim())
    .includes("admin");
}

function sessionUserRole(user: unknown) {
  return typeof user === "object" && user !== null && "role" in user
    ? user.role
    : null;
}

export const adminPlugin = new Elysia({
  name: "admin",
}).macro({
  admin: {
    async resolve({ request, status }) {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session) {
        return status(401, { error: "Unauthorized" });
      }

      if (!hasAdminRole(sessionUserRole(session.user))) {
        return status(403, { error: "Forbidden" });
      }

      return {
        user: session.user,
        session: session.session,
      };
    },
  },
});
