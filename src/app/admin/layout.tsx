import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AdminShell from "./_components/AdminShell";

function hasAdminRole(role: unknown) {
  return (
    typeof role === "string" &&
    role
      .split(",")
      .map((value) => value.trim())
      .includes("admin")
  );
}

function sessionUserRole(user: unknown) {
  return typeof user === "object" && user !== null && "role" in user
    ? user.role
    : null;
}

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  if (!hasAdminRole(sessionUserRole(session.user))) {
    redirect("/");
  }

  return <AdminShell>{children}</AdminShell>;
}
