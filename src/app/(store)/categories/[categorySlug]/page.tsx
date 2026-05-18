"use client";

import { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon, PlusIcon } from "@heroicons/react/20/solid";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/eden";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

const breadcrumbs = [{ id: 1, name: "Men", href: "#" }];
const filters = [
  // {
  //   id: "color",
  //   name: "Color",
  //   options: [
  //     { value: "white", label: "White" },
  //     { value: "beige", label: "Beige" },
  //     { value: "blue", label: "Blue" },
  //     { value: "brown", label: "Brown" },
  //     { value: "green", label: "Green" },
  //     { value: "purple", label: "Purple" },
  //   ],
  // },
  {
    id: "category",
    name: "Category",
    options: [
      { value: "new-arrivals", label: "All New Arrivals" },
      { value: "tees", label: "Tees" },
      { value: "crewnecks", label: "Crewnecks" },
      { value: "sweatshirts", label: "Sweatshirts" },
      { value: "pants-shorts", label: "Pants & Shorts" },
    ],
  },
  // {
  //   id: "sizes",
  //   name: "Sizes",
  //   options: [
  //     { value: "xs", label: "XS" },
  //     { value: "s", label: "S" },
  //     { value: "m", label: "M" },
  //     { value: "l", label: "L" },
  //     { value: "xl", label: "XL" },
  //     { value: "2xl", label: "2XL" },
  //   ],
  // },
];
// const products = [
//   {
//     id: 1,
//     name: "Basic Tee 8-Pack",
//     href: "#",
//     price: "$256",
//     description:
//       "Get the full lineup of our Basic Tees. Have a fresh shirt all week, and an extra for laundry day.",
//     options: "8 colors",
//     imageSrc:
//       "https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-02-image-card-01.jpg",
//     imageAlt:
//       "Eight shirts arranged on table in black, olive, grey, blue, white, red, mustard, and green.",
//   },
//   {
//     id: 2,
//     name: "Basic Tee",
//     href: "#",
//     price: "$32",
//     description:
//       "Look like a visionary CEO and wear the same black t-shirt every day.",
//     options: "Black",
//     imageSrc:
//       "https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-02-image-card-02.jpg",
//     imageAlt: "Front of plain black t-shirt.",
//   },
//   {
//     id: 3,
//     name: "Kinda White Basic Tee",
//     href: "#",
//     price: "$32",
//     description: "It's probably, like, 5000 Kelvin instead of 6000 K.",
//     options: "White",
//     imageSrc:
//       "https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-02-image-card-03.jpg",
//     imageAlt: "Front of plain white t-shirt.",
//   },
//   {
//     id: 4,
//     name: "Stone Basic Tee",
//     href: "#",
//     price: "$32",
//     description:
//       "White tees stain easily, and black tees fade. This is going to be gray for a while.",
//     options: "Charcoal",
//     imageSrc:
//       "https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-02-image-card-04.jpg",
//     imageAlt: "Front of plain dark gray t-shirt.",
//   },
//   {
//     id: 5,
//     name: "Fall Basic Tee 3-Pack",
//     href: "#",
//     price: "$96",
//     description:
//       "Who need stark minimalism when you could have earth tones? Embrace the season.",
//     options: "Charcoal",
//     imageSrc:
//       "https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-02-image-card-05.jpg",
//     imageAlt:
//       "Three shirts arranged on table in mustard, dark gray, and olive.",
//   },
//   {
//     id: 6,
//     name: "Linework Artwork Tee 3-Pack",
//     href: "#",
//     price: "$108",
//     description:
//       "Get all 3 colors of our popular Linework design and some variety to your monotonous life.",
//     options: "3 colors",
//     imageSrc:
//       "https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-02-image-card-06.jpg",
//     imageAlt:
//       "Three shirts in gray, white, and blue arranged on table with same line drawing of hands and shapes overlapping on front of shirt.",
//   },
// ];

export default function Example() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filters state
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const { data: colors } = useQuery({
    queryKey: ["categories", categorySlug, "colors"],
    queryFn: () => api.categories({ slug: categorySlug }).colors.get(),
  });

  const { data: sizes } = useQuery({
    queryKey: ["categories", categorySlug, "sizes"],
    queryFn: () => api.categories({ slug: categorySlug }).sizes.get(),
  });

  const { data: category } = useQuery({
    queryKey: ["categories", categorySlug, selectedColors],
    queryFn: () => api.categories({ slug: categorySlug }).get(),
  });

  const { data: products } = useQuery({
    queryKey: ["products", categorySlug, selectedColors, selectedSizes],
    queryFn: () =>
      api.products.post({
        categorySlug: categorySlug,
        colors: selectedColors,
        sizes: selectedSizes,
      }),
  });

  return (
    <>
      <div>
        {/* Mobile filter dialog */}
        <Dialog
          open={mobileFiltersOpen}
          onClose={setMobileFiltersOpen}
          className="relative z-40 lg:hidden"
        >
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-closed:opacity-0"
          />

          <div className="fixed inset-0 z-40 flex">
            <DialogPanel
              transition
              className="relative ml-auto flex size-full max-w-xs transform flex-col overflow-y-auto bg-white pt-4 pb-6 shadow-xl transition duration-300 ease-in-out data-closed:translate-x-full"
            >
              <div className="flex items-center justify-between px-4">
                <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="relative -mr-2 flex size-10 items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Close menu</span>
                  <XMarkIcon aria-hidden="true" className="size-6" />
                </button>
              </div>

              {/* Filters */}
              <form className="mt-4">
                {filters.map((section) => (
                  <Disclosure
                    key={section.name}
                    as="div"
                    className="border-t border-gray-200 pt-4 pb-4"
                  >
                    <fieldset>
                      <legend className="w-full px-2">
                        <DisclosureButton className="group flex w-full items-center justify-between p-2 text-gray-400 hover:text-gray-500">
                          <span className="text-sm font-medium text-gray-900">
                            {section.name}
                          </span>
                          <span className="ml-6 flex h-7 items-center">
                            <ChevronDownIcon
                              aria-hidden="true"
                              className="size-5 rotate-0 transform group-data-open:-rotate-180"
                            />
                          </span>
                        </DisclosureButton>
                      </legend>
                      <DisclosurePanel className="px-4 pt-4 pb-2">
                        <div className="space-y-6">
                          {section.options.map((option, optionIdx) => (
                            <div key={option.value} className="flex gap-3">
                              <div className="flex h-5 shrink-0 items-center">
                                <div className="group grid size-4 grid-cols-1">
                                  <input
                                    defaultValue={option.value}
                                    id={`${section.id}-${optionIdx}-mobile`}
                                    name={`${section.id}[]`}
                                    type="checkbox"
                                    className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                                  />
                                  <svg
                                    fill="none"
                                    viewBox="0 0 14 14"
                                    className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                                  >
                                    <path
                                      d="M3 8L6 11L11 3.5"
                                      strokeWidth={2}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="opacity-0 group-has-checked:opacity-100"
                                    />
                                    <path
                                      d="M3 7H11"
                                      strokeWidth={2}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="opacity-0 group-has-indeterminate:opacity-100"
                                    />
                                  </svg>
                                </div>
                              </div>
                              <label
                                htmlFor={`${section.id}-${optionIdx}-mobile`}
                                className="text-sm text-gray-500"
                              >
                                {option.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </DisclosurePanel>
                    </fieldset>
                  </Disclosure>
                ))}
              </form>
            </DialogPanel>
          </div>
        </Dialog>

        <div className="border-b border-gray-200">
          <nav
            aria-label="Breadcrumb"
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          >
            <ol role="list" className="flex items-center space-x-4 py-4">
              {breadcrumbs.map((breadcrumb) => (
                <li key={breadcrumb.id}>
                  <div className="flex items-center">
                    <a
                      href={breadcrumb.href}
                      className="mr-4 text-sm font-medium text-gray-900"
                    >
                      {breadcrumb.name}
                    </a>
                    <svg
                      viewBox="0 0 6 20"
                      aria-hidden="true"
                      className="h-5 w-auto text-gray-300"
                    >
                      <path
                        d="M4.878 4.34H3.551L.27 16.532h1.327l3.281-12.19z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                </li>
              ))}
              <li className="text-sm">
                <a
                  href="#"
                  aria-current="page"
                  className="font-medium text-gray-500 hover:text-gray-600"
                >
                  {category?.data?.name}
                </a>
              </li>
            </ol>
          </nav>
        </div>

        <main className="mx-auto max-w-2xl px-4 lg:max-w-7xl lg:px-8">
          <div className="border-b border-gray-200 pt-24 pb-10">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              {category?.data?.name}
            </h1>
            <p className="mt-4 text-base text-gray-500">
              {category?.data?.description}
            </p>
          </div>

          <div className="pt-12 pb-24 lg:grid lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-4">
            <aside>
              <h2 className="sr-only">Filters</h2>

              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="inline-flex items-center lg:hidden"
              >
                <span className="text-sm font-medium text-gray-700">
                  Filters
                </span>
                <PlusIcon
                  aria-hidden="true"
                  className="ml-1 size-5 shrink-0 text-gray-400"
                />
              </button>

              <div className="hidden lg:block">
                <form className="divide-y divide-gray-200">
                  {filters.map((section) => (
                    <div
                      key={section.name}
                      className="py-10 first:pt-0 last:pb-0"
                    >
                      <fieldset>
                        <legend className="block text-sm font-medium text-gray-900">
                          {section.name}
                        </legend>
                        <div className="space-y-3 pt-6">
                          {section.options.map((option, optionIdx) => (
                            <div key={option.value} className="flex gap-3">
                              <div className="flex h-5 shrink-0 items-center">
                                <div className="group grid size-4 grid-cols-1">
                                  <input
                                    defaultValue={option.value}
                                    id={`${section.id}-${optionIdx}`}
                                    name={`${section.id}[]`}
                                    type="checkbox"
                                    className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                                  />
                                  <svg
                                    fill="none"
                                    viewBox="0 0 14 14"
                                    className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                                  >
                                    <path
                                      d="M3 8L6 11L11 3.5"
                                      strokeWidth={2}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="opacity-0 group-has-checked:opacity-100"
                                    />
                                    <path
                                      d="M3 7H11"
                                      strokeWidth={2}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="opacity-0 group-has-indeterminate:opacity-100"
                                    />
                                  </svg>
                                </div>
                              </div>
                              <label
                                htmlFor={`${section.id}-${optionIdx}`}
                                className="text-sm text-gray-600"
                              >
                                {option.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </fieldset>
                    </div>
                  ))}
                  {/* colors filter */}
                  <div className="py-10 first:pt-0 last:pb-0">
                    <fieldset>
                      <legend className="block text-sm font-medium text-gray-900">
                        Colors
                      </legend>
                      <div className="space-y-3 pt-6">
                        {colors?.data?.map((color, optionIdx) => (
                          <div key={color.id} className="flex gap-3">
                            <div className="flex h-5 shrink-0 items-center">
                              <div className="group grid size-4 grid-cols-1">
                                <input
                                  checked={selectedColors.includes(color.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedColors([
                                        ...selectedColors,
                                        color.id,
                                      ]);
                                    } else {
                                      setSelectedColors(
                                        selectedColors.filter(
                                          (id) => id !== color.id,
                                        ),
                                      );
                                    }
                                  }}
                                  id={`colors-${color.id}`}
                                  name="colors[]"
                                  type="checkbox"
                                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                                />
                                <svg
                                  fill="none"
                                  viewBox="0 0 14 14"
                                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                                >
                                  <path
                                    d="M3 8L6 11L11 3.5"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="opacity-0 group-has-checked:opacity-100"
                                  />
                                  <path
                                    d="M3 7H11"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="opacity-0 group-has-indeterminate:opacity-100"
                                  />
                                </svg>
                              </div>
                            </div>
                            <label
                              htmlFor={`colors-${color.id}`}
                              className="text-sm text-gray-600"
                            >
                              {color.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </fieldset>
                  </div>

                  {/* sizes filter */}
                  <div className="py-10 first:pt-0 last:pb-0">
                    <fieldset>
                      <legend className="block text-sm font-medium text-gray-900">
                        Sizes
                      </legend>
                      <div className="space-y-3 pt-6">
                        {sizes?.data?.map((size, optionIdx) => (
                          <div key={size.id} className="flex gap-3">
                            <div className="flex h-5 shrink-0 items-center">
                              <div className="group grid size-4 grid-cols-1">
                                <input
                                  checked={selectedSizes.includes(size.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedSizes([
                                        ...selectedSizes,
                                        size.id,
                                      ]);
                                    } else {
                                      setSelectedSizes(
                                        selectedSizes.filter(
                                          (id) => id !== size.id,
                                        ),
                                      );
                                    }
                                  }}
                                  id={`sizes-${size.id}`}
                                  name="sizes[]"
                                  type="checkbox"
                                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                                />
                                <svg
                                  fill="none"
                                  viewBox="0 0 14 14"
                                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                                >
                                  <path
                                    d="M3 8L6 11L11 3.5"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="opacity-0 group-has-checked:opacity-100"
                                  />
                                  <path
                                    d="M3 7H11"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="opacity-0 group-has-indeterminate:opacity-100"
                                  />
                                </svg>
                              </div>
                            </div>
                            <label
                              htmlFor={`sizes-${size.id}`}
                              className="text-sm text-gray-600"
                            >
                              {size.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </fieldset>
                  </div>
                </form>
              </div>
            </aside>

            <section
              aria-labelledby="product-heading"
              className="mt-6 lg:col-span-2 lg:mt-0 xl:col-span-3"
            >
              <h2 id="product-heading" className="sr-only">
                Products
              </h2>

              {/* <pre className="text-xs text-gray-500">
                {JSON.stringify(products, null, 2)}
              </pre> */}
              <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:gap-x-8 xl:grid-cols-3">
                {products?.data?.map((product) => (
                  <div
                    key={product.id}
                    className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white"
                  >
                    <Image
                      alt={product.images[0].imageAlt ?? ""}
                      src={product.images[0].imageSrc ?? ""}
                      width={1000}
                      height={1000}
                      className="aspect-3/4 bg-gray-200 object-cover group-hover:opacity-75 sm:h-96"
                    />
                    <div className="flex flex-1 flex-col space-y-2 p-4">
                      <h3 className="text-sm font-medium text-gray-900">
                        <Link href={`/products/${product.slug}`}>
                          <span
                            aria-hidden="true"
                            className="absolute inset-0"
                          />
                          {product.name}
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-500">
                        {product.description}
                      </p>
                      <div className="flex flex-1 flex-col justify-end">
                        {/* <p className="text-sm text-gray-500 italic">
                          {product.options}
                        </p> */}
                        <p className="text-base font-medium text-gray-900">
                          {formatPrice(Number(product.price), product.currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
