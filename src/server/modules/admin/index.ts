import { Elysia } from "elysia";
import { adminCategoriesModule } from "./categories";
import { adminDashboardModule } from "./dashboard";
import { adminOrdersModule } from "./orders";
import { adminProductsModule } from "./products";
import { adminUploadsModule } from "./uploads";
import { adminUsersModule } from "./users";
import { adminVariantsModule } from "./variants";

export const adminModule = new Elysia({
  name: "admin-module",
  prefix: "/admin",
})
  .use(adminDashboardModule)
  .use(adminUsersModule)
  .use(adminProductsModule)
  .use(adminVariantsModule)
  .use(adminCategoriesModule)
  .use(adminOrdersModule)
  .use(adminUploadsModule);
