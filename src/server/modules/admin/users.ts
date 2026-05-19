import { auth } from "@/lib/auth";
import { adminPlugin } from "@/server/plugins/admin";
import { prismaPlugin } from "@/server/plugins/prisma";
import { Elysia } from "elysia";
import * as z from "zod";
import { idParamsSchema, paginationQuerySchema } from "./shared";

const userListQuerySchema = paginationQuerySchema.extend({
  searchValue: z.string().optional(),
  searchField: z.enum(["email", "name"]).optional(),
  searchOperator: z.enum(["contains", "starts_with", "ends_with"]).optional(),
  sortBy: z.string().optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
});

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  role: z.string().optional(),
});

const roleSchema = z.object({
  role: z.string().min(1),
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.string().min(1).optional(),
});

const banUserSchema = z.object({
  banReason: z.string().optional(),
  banExpiresIn: z.number().int().positive().optional(),
});

type AdminAuthApi = typeof auth.api & {
  createUser(args: {
    body: z.infer<typeof createUserSchema>;
    headers: Headers;
  }): Promise<unknown>;
  listUsers(args: {
    query: z.infer<typeof userListQuerySchema>;
    headers: Headers;
  }): Promise<unknown>;
  getUser(args: { query: { id: string }; headers: Headers }): Promise<unknown>;
  setRole(args: {
    body: { userId: string; role: string };
    headers: Headers;
  }): Promise<unknown>;
  adminUpdateUser(args: {
    body: { userId: string; data: z.infer<typeof updateUserSchema> };
    headers: Headers;
  }): Promise<unknown>;
  banUser(args: {
    body: { userId: string; banReason?: string; banExpiresIn?: number };
    headers: Headers;
  }): Promise<unknown>;
  unbanUser(args: {
    body: { userId: string };
    headers: Headers;
  }): Promise<unknown>;
  removeUser(args: {
    body: { userId: string };
    headers: Headers;
  }): Promise<unknown>;
  impersonateUser(args: {
    body: { userId: string };
    headers: Headers;
  }): Promise<unknown>;
};

const adminAuthApi = auth.api as AdminAuthApi;

export const adminUsersModule = new Elysia({
  name: "admin-users",
  prefix: "/users",
})
  .use(prismaPlugin)
  .use(adminPlugin)
  .get(
    "/",
    ({ query, request }) =>
      adminAuthApi.listUsers({ query, headers: request.headers }),
    {
      admin: true,
      query: userListQuerySchema,
      detail: {
        summary: "List users",
        tags: ["Admin", "Users"],
      },
    },
  )
  .post(
    "/",
    ({ body, request }) =>
      adminAuthApi.createUser({ body, headers: request.headers }),
    {
      admin: true,
      body: createUserSchema,
      detail: {
        summary: "Create a user",
        tags: ["Admin", "Users"],
      },
    },
  )
  .get(
    "/:id",
    ({ params, request }) =>
      adminAuthApi.getUser({
        query: { id: params.id },
        headers: request.headers,
      }),
    {
      admin: true,
      params: idParamsSchema,
      detail: {
        summary: "Get a user",
        tags: ["Admin", "Users"],
      },
    },
  )
  .patch(
    "/:id",
    async ({ params, body, request }) => {
      if (body.role) {
        await adminAuthApi.setRole({
          body: { userId: params.id, role: body.role },
          headers: request.headers,
        });
      }

      const data = {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.email !== undefined ? { email: body.email } : {}),
      };

      if (Object.keys(data).length === 0) {
        return adminAuthApi.getUser({
          query: { id: params.id },
          headers: request.headers,
        });
      }

      return adminAuthApi.adminUpdateUser({
        body: { userId: params.id, data },
        headers: request.headers,
      });
    },
    {
      admin: true,
      params: idParamsSchema,
      body: updateUserSchema,
      detail: {
        summary: "Update a user",
        tags: ["Admin", "Users"],
      },
    },
  )
  .patch(
    "/:id/role",
    ({ params, body, request }) =>
      adminAuthApi.setRole({
        body: { userId: params.id, role: body.role },
        headers: request.headers,
      }),
    {
      admin: true,
      params: idParamsSchema,
      body: roleSchema,
      detail: {
        summary: "Set a user role",
        tags: ["Admin", "Users"],
      },
    },
  )
  .post(
    "/:id/ban",
    ({ params, body, request }) =>
      adminAuthApi.banUser({
        body: { userId: params.id, ...body },
        headers: request.headers,
      }),
    {
      admin: true,
      params: idParamsSchema,
      body: banUserSchema,
      detail: {
        summary: "Ban a user",
        tags: ["Admin", "Users"],
      },
    },
  )
  .post(
    "/:id/unban",
    ({ params, request }) =>
      adminAuthApi.unbanUser({
        body: { userId: params.id },
        headers: request.headers,
      }),
    {
      admin: true,
      params: idParamsSchema,
      detail: {
        summary: "Unban a user",
        tags: ["Admin", "Users"],
      },
    },
  )
  .post(
    "/:id/impersonate",
    ({ params, request }) =>
      adminAuthApi.impersonateUser({
        body: { userId: params.id },
        headers: request.headers,
      }),
    {
      admin: true,
      params: idParamsSchema,
      detail: {
        summary: "Impersonate a user",
        tags: ["Admin", "Users"],
      },
    },
  )
  .delete(
    "/:id",
    ({ params, request }) =>
      adminAuthApi.removeUser({
        body: { userId: params.id },
        headers: request.headers,
      }),
    {
      admin: true,
      params: idParamsSchema,
      detail: {
        summary: "Delete a user",
        tags: ["Admin", "Users"],
      },
    },
  );
