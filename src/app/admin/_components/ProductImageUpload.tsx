"use client";

import type { PutBlobResult } from "@vercel/blob";
import { useRef, useState } from "react";
import { Button, SecondaryButton, inputClassName } from "./ui";

export function ProductImageUpload({
  onUploaded,
}: {
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload() {
    const file = inputRef.current?.files?.[0];

    if (!file) {
      setError("Select an image first.");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const response = await fetch(
        `/api/admin/uploads/product-images?filename=${encodeURIComponent(file.name)}`,
        {
          method: "POST",
          body: file,
          headers: {
            "content-type": file.type,
          },
        },
      );

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error ?? "Could not upload image.");
      }

      const blob = (await response.json()) as PutBlobResult;
      onUploaded(blob.url);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Could not upload image.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className={inputClassName}
        />
        <Button type="button" onClick={upload} disabled={isUploading}>
          {isUploading ? "Uploading..." : "Upload"}
        </Button>
      </div>
      <p className="mt-2 text-xs text-stone-500">
        JPEG, PNG, or WebP. Server uploads are limited to 4.5 MB.
      </p>
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
      <SecondaryButton
        type="button"
        className="mt-3 hidden"
        onClick={() => inputRef.current?.click()}
      >
        Choose image
      </SecondaryButton>
    </div>
  );
}
