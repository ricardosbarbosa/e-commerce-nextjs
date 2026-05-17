"use client";

import { api } from "@/lib/eden";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";

export default function Page() {
  const { data: categories } = useQuery({
    queryKey: ["store", "categories"],
    queryFn: () => api.store.categories.get(),
  });

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        Categories
      </h1>

      <div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:grid-rows-2 sm:gap-x-6 lg:gap-8">
        {categories?.data?.map((category) => (
          <Link
            href={category.slug}
            key={category.id}
            className="group relative aspect-2/1 overflow-hidden rounded-lg sm:row-span-2 sm:aspect-square"
          >
            <Image
              alt={category.name}
              src={category.imageSrc ?? ""}
              width={1000}
              height={1000}
              className="absolute size-full object-cover group-hover:opacity-75"
            />
            <div className="absolute inset-0 flex items-end p-6">
              <div>
                <h3 className="font-semibold text-white">{category.name}</h3>
                <p aria-hidden="true" className="mt-1 text-sm text-white">
                  Shop now
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
