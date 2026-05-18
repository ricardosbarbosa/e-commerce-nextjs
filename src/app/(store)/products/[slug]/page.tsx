"use client";

import {
  CurrencyDollarIcon,
  GlobeAmericasIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/20/solid";
import { cn, formatPrice } from "@/lib/utils";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/eden";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

// const product = {
//   name: "Basic Tee",
//   price: "$35",
//   href: "#",
//   breadcrumbs: [
//     { id: 1, name: "Women", href: "#" },
//     { id: 2, name: "Clothing", href: "#" },
//   ],
//   images: [
//     {
//       id: 1,
//       imageSrc:
//         "https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-featured-product-shot.jpg",
//       imageAlt: "Back of women's Basic Tee in black.",
//       primary: true,
//     },
//     {
//       id: 2,
//       imageSrc:
//         "https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-product-shot-01.jpg",
//       imageAlt: "Side profile of women's Basic Tee in black.",
//       primary: false,
//     },
//     {
//       id: 3,
//       imageSrc:
//         "https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-product-shot-02.jpg",
//       imageAlt: "Front of women's Basic Tee in black.",
//       primary: false,
//     },
//   ],
//   colors: [
//     {
//       id: "black",
//       name: "Black",
//       classes: "bg-gray-900 checked:outline-gray-900",
//     },
//     {
//       id: "heather-grey",
//       name: "Heather Grey",
//       classes: "bg-gray-400 checked:outline-gray-400",
//     },
//   ],
//   sizes: [
//     { id: "xxs", name: "XXS", inStock: true },
//     { id: "xs", name: "XS", inStock: true },
//     { id: "s", name: "S", inStock: true },
//     { id: "m", name: "M", inStock: true },
//     { id: "l", name: "L", inStock: true },
//     { id: "xl", name: "XL", inStock: false },
//   ],
//   description: `
//     <p>The Basic tee is an honest new take on a classic. The tee uses super soft, pre-shrunk cotton for true comfort and a dependable fit. They are hand cut and sewn locally, with a special dye technique that gives each tee it's own look.</p>
//     <p>Looking to stock your closet? The Basic tee also comes in a 3-pack or 5-pack at a bundle discount.</p>
//   `,
//   details: [
//     "Only the best materials",
//     "Ethically and locally made",
//     "Pre-washed and pre-shrunk",
//     "Machine wash cold with similar colors",
//   ],
// };
const policies = [
  {
    name: "International delivery",
    icon: GlobeAmericasIcon,
    description: "Get your order in 2 years",
  },
  {
    name: "Loyalty rewards",
    icon: CurrencyDollarIcon,
    description: "Don't look at other tees",
  },
];
// const reviews = {
//   average: 3.9,
//   totalCount: 512,
//   featured: [
//     {
//       id: 1,
//       title: "Can't say enough good things",
//       rating: 5,
//       content: `
//         <p>I was really pleased with the overall shopping experience. My order even included a little personal, handwritten note, which delighted me!</p>
//         <p>The product quality is amazing, it looks and feel even better than I had anticipated. Brilliant stuff! I would gladly recommend this store to my friends. And, now that I think of it... I actually have, many times!</p>
//       `,
//       author: "Risako M",
//       date: "May 16, 2021",
//       datetime: "2021-01-06",
//     },
//     {
//       id: 2,
//       title: "Very comfy and looks the part",
//       rating: 5,
//       content: `
//         <p>After a quick chat with customer support, I had a good feeling about this shirt and ordered three of them.</p>
//         <p>Less than 48 hours later, my delivery arrived. I haven't worn anything else since that day! These shirts are so comfortable, yet look classy enough that I can wear them at work or even some formal events. Winning!</p>
//       `,
//       author: "Jackie H",
//       date: "April 6, 2021",
//       datetime: "2021-01-06",
//     },
//     {
//       id: 3,
//       title: "The last shirts I may ever need",
//       rating: 4,
//       content: `
//         <p>I bought two of those comfy cotton shirts, and let me tell you: they're amazing! I have been wearing them almost every day. Even after a dozen of washes, that still looks and feel good as new. Will definitely order a few more... If I ever need to!</p>
//       `,
//       author: "Laura G",
//       date: "February 24, 2021",
//       datetime: "2021-01-06",
//     },
//   ],
// };
// const relatedProducts = [
//   {
//     id: 1,
//     name: "Basic Tee",
//     href: "#",
//     imageSrc:
//       "https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-02.jpg",
//     imageAlt: "Front of men's Basic Tee in white.",
//     price: "$35",
//     color: "Aspen White",
//   },
//   {
//     id: 2,
//     name: "Basic Tee",
//     href: "#",
//     imageSrc:
//       "https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-03.jpg",
//     imageAlt: "Front of men's Basic Tee in dark gray.",
//     price: "$35",
//     color: "Charcoal",
//   },
//   {
//     id: 3,
//     name: "Artwork Tee",
//     href: "#",
//     imageSrc:
//       "https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-04.jpg",
//     imageAlt:
//       "Front of men's Artwork Tee in peach with white and brown dots forming an isometric cube.",
//     price: "$35",
//     color: "Iso Dots",
//   },
//   {
//     id: 4,
//     name: "Basic Tee",
//     href: "#",
//     imageSrc:
//       "https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-01.jpg",
//     imageAlt: "Front of men's Basic Tee in black.",
//     price: "$35",
//     color: "Black",
//   },
// ];

export default function Example() {
  const { slug } = useParams<{ slug: string }>();

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(2);

  const { data: product } = useQuery({
    queryKey: ["products", slug],
    queryFn: () => api.products({ slug }).get(),
  });

  const { data: colors } = useQuery({
    queryKey: ["products", slug, "colors"],
    queryFn: () => api.products({ slug }).colors.get(),
  });

  const { data: sizes } = useQuery({
    queryKey: ["products", slug, "sizes"],
    queryFn: () => api.products({ slug }).sizes.get(),
  });

  const { data: reviews } = useQuery({
    queryKey: ["products", slug, "reviews", page, limit],
    queryFn: () =>
      api.products({ slug }).reviews.get({
        query: {
          limit: limit.toString(),
          page: page.toString(),
        },
      }),
  });

  if (!product || !product.data) {
    return <div>Product not found</div>;
  }

  const selectedVariant = product.data.variants.find(
    (variant) =>
      variant.color?.id === selectedColor && variant.size?.id === selectedSize,
  );

  return (
    <>
      <pre className="text-xs text-gray-500">
        {JSON.stringify(selectedVariant, null, 2)}
      </pre>
      <div className="lg:grid lg:auto-rows-min lg:grid-cols-12 lg:gap-x-8">
        <div className="lg:col-span-5 lg:col-start-8">
          <div className="flex justify-between">
            <h1 className="text-xl font-medium text-gray-900">
              {product.data.name}
            </h1>
            <p className="text-xl font-medium text-gray-900">
              {formatPrice(Number(product.data.price), product.data.currency)}
            </p>
          </div>
          {/* Reviews */}
          <div className="mt-4">
            <h2 className="sr-only">Reviews</h2>
            <div className="flex items-center">
              <p className="text-sm text-gray-700">
                {reviews?.data?.averageRating ?? 0}
                <span className="sr-only"> out of 5 stars</span>
              </p>
              <div className="ml-1 flex items-center">
                {[0, 1, 2, 3, 4].map((rating) => (
                  <StarIcon
                    key={rating}
                    aria-hidden="true"
                    className={cn(
                      (reviews?.data?.averageRating ?? 0) > rating
                        ? "text-yellow-400"
                        : "text-gray-200",
                      "size-5 shrink-0",
                    )}
                  />
                ))}
              </div>
              <div aria-hidden="true" className="ml-4 text-sm text-gray-300">
                ·
              </div>
              <div className="ml-4 flex">
                <a
                  href="#"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  See all {reviews?.data?.totalCount ?? 0} reviews
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Image gallery */}
        <div className="mt-8 lg:col-span-7 lg:col-start-1 lg:row-span-3 lg:row-start-1 lg:mt-0">
          <h2 className="sr-only">Images</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-3 lg:gap-8">
            {product.data.images.map((image) => (
              <img
                key={image.id}
                alt={image.imageAlt ?? product.data?.name ?? ""}
                src={image.imageSrc}
                className={cn(
                  image.isPrimary
                    ? "lg:col-span-2 lg:row-span-2"
                    : "hidden lg:block",
                  "rounded-lg",
                )}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 lg:col-span-5">
          <form>
            {/* Color picker */}
            <div>
              <h2 className="text-sm font-medium text-gray-900">Color</h2>

              <fieldset aria-label="Choose a color" className="mt-2">
                <div className="flex items-center gap-x-3">
                  {colors?.data?.map((color) => (
                    <div
                      key={color.id}
                      className="flex rounded-full outline -outline-offset-1 outline-black/10"
                    >
                      <input
                        value={color.id}
                        checked={selectedColor === color.id}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        name="color"
                        type="radio"
                        aria-label={color.name}
                        style={{ backgroundColor: color.hex ?? undefined }}
                        className={cn(
                          color.className,
                          "size-8 appearance-none rounded-full forced-color-adjust-none checked:outline-2 checked:outline-offset-2 focus-visible:outline-3 focus-visible:outline-offset-3",
                        )}
                      />
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>

            {/* Size picker */}
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-900">Size</h2>
                <a
                  href="#"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  See sizing chart
                </a>
              </div>

              <fieldset aria-label="Choose a size" className="mt-2">
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                  {sizes?.data?.map((size) => (
                    <label
                      key={size.id}
                      aria-label={size.name}
                      className="group relative flex items-center justify-center rounded-md border border-gray-300 bg-white p-3 has-checked:border-indigo-600 has-checked:bg-indigo-600 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-indigo-600 has-disabled:border-gray-400 has-disabled:bg-gray-200 has-disabled:opacity-25"
                    >
                      <input
                        value={size.id}
                        checked={selectedSize === size.id}
                        onChange={(e) => setSelectedSize(e.target.value)}
                        name="size"
                        type="radio"
                        className="absolute inset-0 appearance-none focus:outline-none disabled:cursor-not-allowed"
                      />
                      <span className="text-sm font-medium text-gray-900 uppercase group-has-checked:text-white">
                        {size.name}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <button
              type="submit"
              className="mt-8 flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden"
            >
              Add to cart
            </button>
          </form>

          {/* Product details */}
          <div className="mt-10">
            <h2 className="text-sm font-medium text-gray-900">Description</h2>

            <div
              dangerouslySetInnerHTML={{
                __html: product.data.description ?? "",
              }}
              className="mt-4 space-y-4 text-sm/6 text-gray-500"
            />
          </div>

          <div className="mt-8 border-t border-gray-200 pt-8">
            <h2 className="text-sm font-medium text-gray-900">
              Fabric &amp; Care
            </h2>

            <div className="mt-4">
              <ul
                role="list"
                className="list-disc space-y-1 pl-5 text-sm/6 text-gray-500 marker:text-gray-300"
              >
                {product.data.details.map((item) => (
                  <li key={item} className="pl-2">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Policies */}
          <section aria-labelledby="policies-heading" className="mt-10">
            <h2 id="policies-heading" className="sr-only">
              Our Policies
            </h2>

            <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {policies.map((policy) => (
                <div
                  key={policy.name}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center"
                >
                  <dt>
                    <policy.icon
                      aria-hidden="true"
                      className="mx-auto size-6 shrink-0 text-gray-400"
                    />
                    <span className="mt-4 text-sm font-medium text-gray-900">
                      {policy.name}
                    </span>
                  </dt>
                  <dd className="mt-1 text-sm text-gray-500">
                    {policy.description}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>

      {/* Reviews */}
      <section aria-labelledby="reviews-heading" className="mt-16 sm:mt-24">
        <h2 id="reviews-heading" className="text-lg font-medium text-gray-900">
          Recent reviews
        </h2>

        <div className="mt-6 divide-y divide-gray-200 border-t border-b border-gray-200">
          {reviews?.data?.reviews?.map((review) => (
            <div
              key={review.id}
              className="py-10 lg:grid lg:grid-cols-12 lg:gap-x-8"
            >
              <div className="lg:col-span-8 lg:col-start-5 xl:col-span-9 xl:col-start-4 xl:grid xl:grid-cols-3 xl:items-start xl:gap-x-8">
                <div className="flex items-center xl:col-span-1">
                  <div className="flex items-center">
                    {[0, 1, 2, 3, 4].map((rating) => (
                      <StarIcon
                        key={rating}
                        aria-hidden="true"
                        className={cn(
                          review.rating > rating
                            ? "text-yellow-400"
                            : "text-gray-200",
                          "size-5 shrink-0",
                        )}
                      />
                    ))}
                  </div>
                  <p className="ml-3 text-sm text-gray-700">
                    {review.rating}
                    <span className="sr-only"> out of 5 stars</span>
                  </p>
                </div>

                <div className="mt-4 lg:mt-6 xl:col-span-2 xl:mt-0">
                  <h3 className="text-sm font-medium text-gray-900">
                    {review.title}
                  </h3>

                  <div
                    dangerouslySetInnerHTML={{ __html: review.content }}
                    className="mt-3 space-y-6 text-sm text-gray-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center text-sm lg:col-span-4 lg:col-start-1 lg:row-start-1 lg:mt-0 lg:flex-col lg:items-start xl:col-span-3">
                <p className="font-medium text-gray-900">{review.authorName}</p>
                <time
                  dateTime={review.publishedAt?.toISOString()}
                  className="ml-4 border-l border-gray-200 pl-4 text-gray-500 lg:mt-2 lg:ml-0 lg:border-0 lg:pl-0"
                >
                  {review.publishedAt?.toLocaleDateString() ?? ""}
                </time>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination: 1 of x reviews */}
        <div className="mt-6">
          <div className="flex items-center gap-x-2">
            <button
              onClick={() => setPage(page - 1)}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              {page} of {Math.ceil((reviews?.data?.totalCount ?? 0) / limit)}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* Related products */}
      <section aria-labelledby="related-heading" className="mt-16 sm:mt-24">
        <h2 id="related-heading" className="text-lg font-medium text-gray-900">
          Customers also purchased
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {product.data.recommendations.map((relatedProduct) => (
            <div
              key={relatedProduct.recommendedProductId}
              className="group relative"
            >
              <Image
                alt={relatedProduct.recommendedProduct.images[0].imageAlt ?? ""}
                src={relatedProduct.recommendedProduct.images[0].imageSrc ?? ""}
                width={1000}
                height={1000}
                className="aspect-square w-full rounded-md object-cover group-hover:opacity-75 lg:aspect-auto lg:h-80"
              />
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-sm text-gray-700">
                    <Link href={relatedProduct.recommendedProduct.slug}>
                      <span aria-hidden="true" className="absolute inset-0" />
                      {relatedProduct.recommendedProduct.name}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {relatedProduct.recommendedProduct.variants?.[0]?.color
                      ?.name ?? ""}
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {formatPrice(
                    Number(relatedProduct.recommendedProduct.price ?? 0),
                    relatedProduct.recommendedProduct.currency,
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
