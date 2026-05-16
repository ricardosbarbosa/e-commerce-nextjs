import Link from "next/link";
import React from "react";

export const categories = [
  {
    id: 1,
    name: "New Arrivals",
    href: "/categories/new-arrivals",
    imageSrc:
      "https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-featured-category.jpg",
    imageAlt:
      "Two models wearing women's black cotton crewneck tee and off-white cotton crewneck tee.",
  },
  {
    id: 2,
    name: "Accessories",
    href: "/categories/accessories",
    imageSrc:
      "https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-category-01.jpg",
    imageAlt:
      "Wooden shelf with gray and olive drab green baseball caps, next to wooden clothes hanger with sweaters.",
  },
  {
    id: 3,
    name: "Workspace",
    href: "/categories/workspace",
    imageSrc:
      "https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-category-02.jpg",
    imageAlt:
      "Walnut desk organizer set with white modular trays, next to porcelain mug on wooden desk.",
  },
];

export default function page() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        Categories
      </h1>

      <div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:grid-rows-2 sm:gap-x-6 lg:gap-8">
        {categories.map((category) => (
          <Link
            href={category.href}
            key={category.id}
            className="group relative aspect-2/1 overflow-hidden rounded-lg sm:row-span-2 sm:aspect-square"
          >
            <img
              alt={category.name}
              src={category.imageSrc}
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
