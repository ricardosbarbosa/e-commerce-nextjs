"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminApi, jsonBody } from "../_components/admin-api";
import {
  Button,
  Card,
  Field,
  PageHeader,
  SecondaryButton,
  StatusBadge,
  inputClassName,
} from "../_components/ui";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  banned?: boolean | null;
  createdAt?: string;
};

type UsersResponse = {
  users: UserRecord[];
  total: number;
};

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", search],
    queryFn: () =>
      adminApi<UsersResponse>(
        `/users?limit=50${search ? `&searchValue=${encodeURIComponent(search)}` : ""}`,
      ),
  });

  const createUser = useMutation({
    mutationFn: (form: FormData) =>
      adminApi("/users", {
        method: "POST",
        body: jsonBody({
          name: String(form.get("name") ?? ""),
          email: String(form.get("email") ?? ""),
          password: String(form.get("password") ?? ""),
          role: String(form.get("role") ?? "user"),
        }),
      }),
    onSuccess: () => {
      setCreateOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  const patchUser = useMutation({
    mutationFn: ({ id, body }: { id: string; body: unknown }) =>
      adminApi(`/users/${id}`, { method: "PATCH", body: jsonBody(body) }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });

  const banUser = useMutation({
    mutationFn: (id: string) =>
      adminApi(`/users/${id}/ban`, {
        method: "POST",
        body: jsonBody({ banReason: "Admin action" }),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });

  const unbanUser = useMutation({
    mutationFn: (id: string) =>
      adminApi(`/users/${id}/unban`, { method: "POST" }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });

  const removeUser = useMutation({
    mutationFn: (id: string) => adminApi(`/users/${id}`, { method: "DELETE" }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Customer ledger"
        title="Users"
        description="Create accounts, assign roles, and control access with Better Auth admin operations."
        action={
          <Button
            type="button"
            onClick={() => setCreateOpen((value) => !value)}
          >
            New user
          </Button>
        }
      />

      {createOpen ? (
        <Card className="p-5">
          <form
            className="grid gap-4 md:grid-cols-5"
            action={(formData) => createUser.mutate(formData)}
          >
            <Field label="Name">
              <input name="name" required className={inputClassName} />
            </Field>
            <Field label="Email">
              <input
                name="email"
                type="email"
                required
                className={inputClassName}
              />
            </Field>
            <Field label="Password">
              <input
                name="password"
                type="password"
                required
                minLength={8}
                className={inputClassName}
              />
            </Field>
            <Field label="Role">
              <select
                name="role"
                className={inputClassName}
                defaultValue="user"
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </Field>
            <div className="flex items-end">
              <Button type="submit" disabled={createUser.isPending}>
                Create
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <Card className="p-5">
        <div className="mb-4 max-w-sm">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name or email"
            className={inputClassName}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stone-200 text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-stone-500">
                <th className="py-3 pr-4">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="py-3 pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {(data?.users ?? []).map((user) => (
                <tr key={user.id}>
                  <td className="py-3 pr-4">
                    <div className="font-medium text-stone-950">
                      {user.name}
                    </div>
                    <div className="text-stone-500">{user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role ?? "user"}
                      className={inputClassName}
                      onChange={(event) =>
                        patchUser.mutate({
                          id: user.id,
                          body: { role: event.target.value },
                        })
                      }
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge>
                      {user.banned ? "Banned" : "Active"}
                    </StatusBadge>
                  </td>
                  <td className="py-3 pl-4">
                    <div className="flex justify-end gap-2">
                      {user.banned ? (
                        <SecondaryButton
                          type="button"
                          onClick={() => unbanUser.mutate(user.id)}
                        >
                          Unban
                        </SecondaryButton>
                      ) : (
                        <SecondaryButton
                          type="button"
                          onClick={() => banUser.mutate(user.id)}
                        >
                          Ban
                        </SecondaryButton>
                      )}
                      <SecondaryButton
                        type="button"
                        onClick={() => removeUser.mutate(user.id)}
                      >
                        Delete
                      </SecondaryButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading ? (
            <p className="py-6 text-sm text-stone-500">Loading users...</p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
