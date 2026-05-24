import { put } from "@vercel/blob";
import { adminPlugin } from "@/server/plugins/admin";
import { Elysia } from "elysia";
import * as z from "zod";

const MAX_SERVER_UPLOAD_BYTES = 4.5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const uploadQuerySchema = z.object({
  filename: z.string().min(1),
});

type UploadFolder = "products" | "categories";

function sanitizeFilename(filename: string) {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const adminUploadsModule = new Elysia({
  name: "admin-uploads",
  prefix: "/uploads",
})
  .use(adminPlugin)
  .post(
    "/product-images",
    async ({ request, query, status }) => {
      const result = await uploadImage(request, query.filename, "products");

      return "error" in result
        ? status(result.status, { error: result.error })
        : result;
    },
    {
      admin: true,
      query: uploadQuerySchema,
      detail: {
        summary: "Upload a product image",
        tags: ["Admin", "Uploads"],
      },
    },
  )
  .post(
    "/category-images",
    async ({ request, query, status }) => {
      const result = await uploadImage(request, query.filename, "categories");

      return "error" in result
        ? status(result.status, { error: result.error })
        : result;
    },
    {
      admin: true,
      query: uploadQuerySchema,
      detail: {
        summary: "Upload a category image",
        tags: ["Admin", "Uploads"],
      },
    },
  );

async function uploadImage(
  request: Request,
  filename: string,
  folder: UploadFolder,
) {
  const contentType = request.headers.get("content-type") ?? "";
  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
    return {
      status: 415,
      error: "Only JPEG, PNG, and WebP images are supported.",
    };
  }

  if (contentLength > MAX_SERVER_UPLOAD_BYTES) {
    return {
      status: 413,
      error: "Images uploaded through the server must be 4.5 MB or smaller.",
    };
  }

  if (!request.body) {
    return { status: 400, error: "No image file provided." };
  }

  const safeFilename = sanitizeFilename(filename);
  const pathname = `${folder}/${crypto.randomUUID()}-${safeFilename}`;

  return put(pathname, request.body, {
    access: "public",
    contentType,
  });
}
