"use client";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/eden";
import { formatPrice } from "@/lib/utils";
import {
  CheckIcon,
  ClockIcon,
  MinusIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
  XMarkIcon as XMarkIconMini,
} from "@heroicons/react/20/solid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// const products = [
//   {
//     id: 1,
//     name: "Basic Tee",
//     href: "#",
//     price: "$32.00",
//     color: "Sienna",
//     inStock: true,
//     size: "Large",
//     imageSrc:
//       "https://tailwindcss.com/plus-assets/img/ecommerce-images/shopping-cart-page-01-product-01.jpg",
//     imageAlt: "Front of men's Basic Tee in sienna.",
//   },
//   {
//     id: 2,
//     name: "Basic Tee",
//     href: "#",
//     price: "$32.00",
//     color: "Black",
//     inStock: false,
//     leadTime: "3–4 weeks",
//     size: "Large",
//     imageSrc:
//       "https://tailwindcss.com/plus-assets/img/ecommerce-images/shopping-cart-page-01-product-02.jpg",
//     imageAlt: "Front of men's Basic Tee in black.",
//   },
//   {
//     id: 3,
//     name: "Nomad Tumbler",
//     href: "#",
//     price: "$35.00",
//     color: "White",
//     inStock: true,
//     imageSrc:
//       "https://tailwindcss.com/plus-assets/img/ecommerce-images/shopping-cart-page-01-product-03.jpg",
//     imageAlt: "Insulated bottle with white base and black snap lid.",
//   },
// ];
const relatedProducts = [
  {
    id: 1,
    name: "Billfold Wallet",
    href: "#",
    imageSrc:
      "https://tailwindcss.com/plus-assets/img/ecommerce-images/shopping-cart-page-01-related-product-01.jpg",
    imageAlt: "Front of Billfold Wallet in natural leather.",
    price: "$118",
    color: "Natural",
  },
  {
    id: 2,
    name: "Machined Pen and Pencil Set",
    href: "#",
    imageSrc:
      "https://tailwindcss.com/plus-assets/img/ecommerce-images/shopping-cart-page-01-related-product-02.jpg",
    imageAlt:
      "Black machined pen and pencil with hexagonal shaft and small white logo.",
    price: "$70",
    color: "Black",
  },
  {
    id: 3,
    name: "Mini Sketchbook Set",
    href: "#",
    imageSrc:
      "https://tailwindcss.com/plus-assets/img/ecommerce-images/shopping-cart-page-01-related-product-03.jpg",
    imageAlt:
      "Three mini sketchbooks with tan and charcoal typography poster covers.",
    price: "$28",
    color: "Tan and Charcoal",
  },
  {
    id: 4,
    name: "Organize Set",
    href: "#",
    imageSrc:
      "https://tailwindcss.com/plus-assets/img/ecommerce-images/shopping-cart-page-01-related-product-04.jpg",
    imageAlt:
      "Grooved walnut desk organizer base with five modular white plastic organizer trays.",
    price: "$149",
    color: "Walnut",
  },
];

export default function Example() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending } = authClient.useSession();
  const { data: cartSummary } = useQuery({
    queryKey: ["cart", "summary"],
    queryFn: () => api.cart.get(),
    enabled: Boolean(session),
  });

  const [cartError, setCartError] = useState<string | null>(null);
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const [cartFeedbackItemId, setCartFeedbackItemId] = useState<string | null>(
    null,
  );

  const adjustCartItem = useMutation({
    mutationFn: async ({
      itemId,
      delta,
    }: {
      itemId: string;
      delta: -1 | 1;
    }) => {
      const response = await api.cart.items({ itemId }).patch({ delta });

      if (response.error) {
        const message =
          typeof response.error.value === "object" &&
          response.error.value &&
          "error" in response.error.value &&
          typeof response.error.value.error === "string"
            ? response.error.value.error
            : "Could not update this product quantity.";

        throw new Error(message);
      }

      return response.data;
    },
  });

  const removeCartItem = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await api.cart.items({ itemId }).delete();

      if (response.error) {
        const message =
          typeof response.error.value === "object" &&
          response.error.value &&
          "error" in response.error.value &&
          typeof response.error.value.error === "string"
            ? response.error.value.error
            : "Could not remove this product from your cart.";

        throw new Error(message);
      }

      return response.data;
    },
  });

  if (isPending) {
    return <div>Loading...</div>;
  }

  const cartItems = cartSummary?.data?.items ?? [];
  const isCartActionPending =
    adjustCartItem.isPending || removeCartItem.isPending;

  async function incrementItemQuantity(
    itemId: string,
    inventoryQuantity: number,
  ) {
    setCartError(null);
    setCartMessage(null);
    setCartFeedbackItemId(itemId);

    if (inventoryQuantity <= 0) {
      setCartError("This variant is currently out of stock.");
      return;
    }

    try {
      await adjustCartItem.mutateAsync({ itemId, delta: 1 });
      await queryClient.invalidateQueries({ queryKey: ["cart", "summary"] });
      setCartMessage("Quantity increased.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not increase this product quantity.";

      if (message === "Unauthorized") {
        router.push(`/sign-in`);
        return;
      }

      setCartError(message);
    }
  }

  async function decrementItemQuantity(itemId: string) {
    setCartError(null);
    setCartMessage(null);
    setCartFeedbackItemId(itemId);

    try {
      await adjustCartItem.mutateAsync({ itemId, delta: -1 });
      await queryClient.invalidateQueries({ queryKey: ["cart", "summary"] });
      setCartMessage("Quantity decreased.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not remove this product from your cart.";

      if (message === "Unauthorized") {
        router.push(`/sign-in`);
        return;
      }

      setCartError(message);
    }
  }

  async function removeItem(itemId: string) {
    setCartError(null);
    setCartMessage(null);
    setCartFeedbackItemId(itemId);

    try {
      await removeCartItem.mutateAsync(itemId);
      await queryClient.invalidateQueries({ queryKey: ["cart", "summary"] });
      setCartFeedbackItemId(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not remove this product from your cart.";

      if (message === "Unauthorized") {
        router.push(`/sign-in`);
        return;
      }

      setCartError(message);
    }
  }

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        Shopping Cart
      </h1>

      <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
        <section aria-labelledby="cart-heading" className="lg:col-span-7">
          <h2 id="cart-heading" className="sr-only">
            Items in your shopping cart
          </h2>

          <ul
            role="list"
            className="divide-y divide-gray-200 border-t border-b border-gray-200"
          >
            {cartItems.map((item) => (
              <li key={item.id} className="flex py-6 sm:py-10">
                <div className="shrink-0">
                  <Image
                    alt={item.product.images[0].imageAlt ?? ""}
                    src={item.product.images[0].imageSrc}
                    width={1000}
                    height={1000}
                    className="size-24 rounded-md object-cover sm:size-48"
                  />
                </div>

                <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                  <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                    <div>
                      <div className="flex justify-between">
                        <h3 className="text-sm">
                          <Link
                            href={`/products/${item.product.slug}`}
                            className="font-medium text-gray-700 hover:text-gray-800"
                          >
                            {item.product.name}
                          </Link>
                        </h3>
                      </div>
                      <div className="mt-1 flex text-sm">
                        <p className="text-gray-500">
                          {item.variant?.color?.name}
                        </p>
                        {item.variant?.size?.name ? (
                          <p className="ml-4 border-l border-gray-200 pl-4 text-gray-500">
                            {item.variant?.size?.name}
                          </p>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {formatPrice(
                          Number(item.product.price),
                          item.product.currency,
                        )}
                      </p>
                    </div>

                    <div className="mt-4 sm:mt-0 sm:pr-9">
                      <div className="flex w-fit items-center rounded-md bg-white outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                        <button
                          type="button"
                          aria-label={`Decrease quantity, ${item.product.name}`}
                          disabled={item.quantity <= 1 || isCartActionPending}
                          onClick={() => decrementItemQuantity(item.id)}
                          className="flex size-9 items-center justify-center rounded-l-md text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <MinusIcon aria-hidden="true" className="size-4" />
                        </button>
                        <input
                          id={`quantity-${item.id}`}
                          name={`quantity-${item.id}`}
                          type="number"
                          min={1}
                          max={item.variant?.inventoryQuantity ?? 99}
                          aria-label={`Quantity, ${item.product.name}`}
                          className="h-9 w-12 border-x border-gray-300 text-center text-sm text-gray-900 [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          value={item.quantity}
                          disabled
                        />
                        <button
                          type="button"
                          aria-label={`Increase quantity, ${item.product.name}`}
                          disabled={
                            item.quantity >=
                              (item.variant?.inventoryQuantity ?? 99) ||
                            isCartActionPending
                          }
                          onClick={() =>
                            incrementItemQuantity(
                              item.id,
                              item.variant?.inventoryQuantity ?? 99,
                            )
                          }
                          className="flex size-9 items-center justify-center rounded-r-md text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <PlusIcon aria-hidden="true" className="size-4" />
                        </button>
                      </div>
                      {cartFeedbackItemId === item.id &&
                      (cartError || cartMessage) ? (
                        <div
                          role={cartError ? "alert" : "status"}
                          className={`mt-3 flex items-start gap-2 rounded-md border px-3 py-2 text-sm shadow-xs ${
                            cartError
                              ? "border-red-200 bg-red-50 text-red-700"
                              : "border-green-200 bg-green-50 text-green-700"
                          }`}
                        >
                          <span
                            className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full ${
                              cartError ? "bg-red-100" : "bg-green-100"
                            }`}
                          >
                            {cartError ? (
                              <XMarkIconMini
                                aria-hidden="true"
                                className="size-3"
                              />
                            ) : (
                              <CheckIcon
                                aria-hidden="true"
                                className="size-3"
                              />
                            )}
                          </span>
                          <p className="font-medium">
                            {cartError ?? cartMessage}
                          </p>
                        </div>
                      ) : null}

                      <div className="absolute top-0 right-0">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          disabled={isCartActionPending}
                          className="-m-2 inline-flex p-2 text-sm font-medium text-indigo-600 hover:text-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 flex space-x-2 text-sm text-gray-700">
                    {(item.variant?.inventoryQuantity ?? 0) > 0 ? (
                      <CheckIcon
                        aria-hidden="true"
                        className="size-5 shrink-0 text-green-500"
                      />
                    ) : (
                      <ClockIcon
                        aria-hidden="true"
                        className="size-5 shrink-0 text-gray-300"
                      />
                    )}

                    <span>
                      {(item.variant?.inventoryQuantity ?? 0) > 0
                        ? "In stock"
                        : `Ships in ${item.variant?.leadTime ?? "3-4 weeks"}`}
                    </span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Order summary */}
        <section
          aria-labelledby="summary-heading"
          className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
        >
          <h2
            id="summary-heading"
            className="text-lg font-medium text-gray-900"
          >
            Order summary
          </h2>

          <dl className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-600">Subtotal</dt>
              <dd className="text-sm font-medium text-gray-900">$99.00</dd>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <dt className="flex items-center text-sm text-gray-600">
                <span>Shipping estimate</span>
                <a
                  href="#"
                  className="ml-2 shrink-0 text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">
                    Learn more about how shipping is calculated
                  </span>
                  <QuestionMarkCircleIcon
                    aria-hidden="true"
                    className="size-5"
                  />
                </a>
              </dt>
              <dd className="text-sm font-medium text-gray-900">$5.00</dd>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <dt className="flex text-sm text-gray-600">
                <span>Tax estimate</span>
                <a
                  href="#"
                  className="ml-2 shrink-0 text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">
                    Learn more about how tax is calculated
                  </span>
                  <QuestionMarkCircleIcon
                    aria-hidden="true"
                    className="size-5"
                  />
                </a>
              </dt>
              <dd className="text-sm font-medium text-gray-900">$8.32</dd>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <dt className="text-base font-medium text-gray-900">
                Order total
              </dt>
              <dd className="text-base font-medium text-gray-900">$112.32</dd>
            </div>
          </dl>

          <div className="mt-6">
            <button
              className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-xs hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 focus:outline-hidden"
              onClick={() => router.push("/checkout")}
            >
              Checkout
            </button>
          </div>
        </section>
      </div>

      {/* Related products */}
      <section aria-labelledby="related-heading" className="mt-24">
        <h2 id="related-heading" className="text-lg font-medium text-gray-900">
          You may also like&hellip;
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {relatedProducts.map((relatedProduct) => (
            <div key={relatedProduct.id} className="group relative">
              <Image
                alt={relatedProduct.imageAlt}
                src={relatedProduct.imageSrc}
                width={1000}
                height={1000}
                className="aspect-square w-full rounded-md object-cover group-hover:opacity-75 lg:aspect-auto lg:h-80"
              />
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-sm text-gray-700">
                    <a href={relatedProduct.href}>
                      <span aria-hidden="true" className="absolute inset-0" />
                      {relatedProduct.name}
                    </a>
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {relatedProduct.color}
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {relatedProduct.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
