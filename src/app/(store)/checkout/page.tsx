"use client";

import { api } from "@/lib/eden";
import { formatPrice } from "@/lib/utils";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { LockClosedIcon } from "@heroicons/react/20/solid";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { authClient } from "@/lib/auth-client";

function getCartItemUnitPrice(item: CartItem) {
  return Number(item.variant?.price ?? item.product.price);
}

type CartSummary = NonNullable<
  Awaited<ReturnType<typeof api.cart.get>>["data"]
>;

type CartItem = NonNullable<CartSummary["items"]>[number];

function cartItemImage(item: CartItem) {
  return item.product.images[0];
}

function OrderItems({
  items,
  className = "divide-y divide-gray-200 border-b border-gray-200",
}: {
  items: CartItem[];
  className?: string;
}) {
  return (
    <ul role="list" className={className}>
      {items.map((item) => {
        const image = cartItemImage(item);

        return (
          <li key={item.id} className="flex space-x-6 py-6">
            {image ? (
              <Image
                alt={image.imageAlt ?? ""}
                src={image.imageSrc}
                width={160}
                height={160}
                className="size-40 flex-none rounded-md bg-gray-200 object-cover"
              />
            ) : (
              <div className="size-40 flex-none rounded-md bg-gray-200" />
            )}
            <div className="flex flex-col justify-between space-y-4">
              <div className="space-y-1 text-sm font-medium">
                <h3 className="text-gray-900">
                  <Link href={`/products/${item.product.slug}`}>
                    {item.product.name}
                  </Link>
                </h3>
                <p className="text-gray-900">
                  {formatPrice(
                    getCartItemUnitPrice(item),
                    item.product.currency,
                  )}
                </p>
                {item.variant?.color?.name ? (
                  <p className="text-gray-500">{item.variant.color.name}</p>
                ) : null}
                {item.variant?.size?.name ? (
                  <p className="text-gray-500">{item.variant.size.name}</p>
                ) : null}
                <p className="text-gray-500">Qty {item.quantity}</p>
              </div>
              <div>
                <Link
                  href="/cart"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Edit in cart
                </Link>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function OrderTotals({ total }: { total: string }) {
  return (
    <dl className="mt-10 space-y-6 text-sm font-medium text-gray-500">
      <div className="flex justify-between">
        <dt>Subtotal</dt>
        <dd className="text-gray-900">{total}</dd>
      </div>
      <div className="flex items-center justify-between border-t border-gray-200 pt-6 text-gray-900">
        <dt className="text-base">Total</dt>
        <dd className="text-base">{total}</dd>
      </div>
    </dl>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get("payment");
  const paymentMessage = searchParams.get("message");
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const {
    data: cartSummary,
    isLoading: isCartLoading,
    isError: isCartError,
  } = useQuery({
    queryKey: ["cart", "summary"],
    queryFn: () => api.cart.get(),
    enabled: Boolean(session),
  });

  const cartItems = cartSummary?.data?.items ?? [];
  const cartCurrency = cartItems[0]?.product.currency ?? "USD";
  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + getCartItemUnitPrice(item) * item.quantity,
    0,
  );
  const formattedTotal = formatPrice(cartSubtotal, cartCurrency);
  const isLoading = isSessionPending || isCartLoading;
  const canSubmitCheckout = Boolean(session) && cartItems.length > 0;

  return (
    <>
      <main className="lg:flex lg:min-h-full lg:flex-row-reverse lg:overflow-hidden">
        <div className="px-4 py-6 sm:px-6 lg:hidden">
          <div className="mx-auto flex max-w-lg">
            <a href="#">
              <span className="sr-only">Your Company</span>
              <Image
                alt=""
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
            </a>
          </div>
        </div>

        <h1 className="sr-only">Checkout</h1>

        {/* Mobile order summary */}
        <section
          aria-labelledby="order-heading"
          className="bg-gray-50 px-4 py-6 sm:px-6 lg:hidden"
        >
          <Disclosure as="div" className="mx-auto max-w-lg">
            <div className="flex items-center justify-between">
              <h2
                id="order-heading"
                className="text-lg font-medium text-gray-900"
              >
                Your Order
              </h2>
              <DisclosureButton className="group font-medium text-indigo-600 hover:text-indigo-500">
                <span className="group-not-data-open:hidden">
                  Hide full summary
                </span>
                <span className="group-data-open:hidden">
                  Show full summary
                </span>
              </DisclosureButton>
            </div>

            <DisclosurePanel>
              <OrderItems items={cartItems} />
              <OrderTotals total={formattedTotal} />
            </DisclosurePanel>

            <p className="mt-6 flex items-center justify-between border-t border-gray-200 pt-6 text-sm font-medium text-gray-900">
              <span className="text-base">Total</span>
              <span className="text-base">{formattedTotal}</span>
            </p>
          </Disclosure>
        </section>

        {/* Order summary */}
        <section
          aria-labelledby="summary-heading"
          className="hidden w-full max-w-md flex-col bg-gray-50 lg:flex"
        >
          <h2 id="summary-heading" className="sr-only">
            Order summary
          </h2>

          <OrderItems
            items={cartItems}
            className="flex-auto divide-y divide-gray-200 overflow-y-auto px-6"
          />

          <div className="sticky bottom-0 flex-none border-t border-gray-200 bg-gray-50 p-6">
            <OrderTotals total={formattedTotal} />
          </div>
        </section>

        {/* Checkout form */}
        <section
          aria-labelledby="payment-heading"
          className="flex-auto overflow-y-auto px-4 pt-12 pb-16 sm:px-6 sm:pt-16 lg:px-8 lg:pt-0 lg:pb-24"
        >
          <div className="mx-auto max-w-lg">
            <div className="hidden pt-10 pb-16 lg:flex">
              <a href="#">
                <span className="sr-only">Your Company</span>
                <Image
                  alt=""
                  src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                />
              </a>
            </div>

            {paymentStatus === "cancelled" ? (
              <div
                role="alert"
                className="mb-6 rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800"
              >
                {paymentMessage ??
                  "Payment was cancelled. You can review your details and try again."}
              </div>
            ) : null}

            {paymentStatus === "failed" ? (
              <div
                role="alert"
                className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {paymentMessage ??
                  "Payment was not completed. Please try another payment method."}
              </div>
            ) : null}

            <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
              <h2 className="text-sm font-medium text-indigo-950">
                Secure Stripe checkout
              </h2>
              <p className="mt-2 text-sm text-indigo-900">
                We&apos;ll send you to Stripe to complete payment with eligible
                payment methods, including cards and supported wallets.
              </p>
            </div>

            {isLoading ? (
              <div
                role="status"
                className="mt-6 rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-600"
              >
                Loading your cart...
              </div>
            ) : null}

            {!isLoading && !session ? (
              <div
                role="alert"
                className="mt-6 rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800"
              >
                Sign in before checking out.{" "}
                <Link href="/sign-in" className="font-medium underline">
                  Go to sign in
                </Link>
                .
              </div>
            ) : null}

            {!isLoading && session && isCartError ? (
              <div
                role="alert"
                className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                Could not load your cart. Please refresh and try again.
              </div>
            ) : null}

            {!isLoading && session && cartItems.length === 0 ? (
              <div
                role="status"
                className="mt-6 rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-600"
              >
                Your cart is empty.{" "}
                <Link href="/products" className="font-medium text-indigo-600">
                  Continue shopping
                </Link>
                .
              </div>
            ) : null}

            <form action="/api/checkout/stripe" method="post" className="mt-6">
              <div className="grid grid-cols-12 gap-x-4 gap-y-6">
                <div className="col-span-full">
                  <label
                    htmlFor="email-address"
                    className="block text-sm/6 font-medium text-gray-700"
                  >
                    Email address
                  </label>
                  <div className="mt-2">
                    <input
                      id="email-address"
                      name="email-address"
                      type="email"
                      autoComplete="email"
                      className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    />
                  </div>
                </div>

                <div className="col-span-full">
                  <label
                    htmlFor="address"
                    className="block text-sm/6 font-medium text-gray-700"
                  >
                    Address
                  </label>
                  <div className="mt-2">
                    <input
                      id="address"
                      name="address"
                      type="text"
                      autoComplete="street-address"
                      className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    />
                  </div>
                </div>

                <div className="col-span-full sm:col-span-4">
                  <label
                    htmlFor="city"
                    className="block text-sm/6 font-medium text-gray-700"
                  >
                    City
                  </label>
                  <div className="mt-2">
                    <input
                      id="city"
                      name="city"
                      type="text"
                      autoComplete="address-level2"
                      className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    />
                  </div>
                </div>

                <div className="col-span-full sm:col-span-4">
                  <label
                    htmlFor="region"
                    className="block text-sm/6 font-medium text-gray-700"
                  >
                    State / Province
                  </label>
                  <div className="mt-2">
                    <input
                      id="region"
                      name="region"
                      type="text"
                      autoComplete="address-level1"
                      className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    />
                  </div>
                </div>

                <div className="col-span-full sm:col-span-4">
                  <label
                    htmlFor="postal-code"
                    className="block text-sm/6 font-medium text-gray-700"
                  >
                    Postal code
                  </label>
                  <div className="mt-2">
                    <input
                      id="postal-code"
                      name="postal-code"
                      type="text"
                      autoComplete="postal-code"
                      className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <div className="flex h-5 shrink-0 items-center">
                  <div className="group grid size-4 grid-cols-1">
                    <input
                      defaultChecked
                      id="same-as-shipping"
                      name="same-as-shipping"
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
                  htmlFor="same-as-shipping"
                  className="text-sm font-medium text-gray-900"
                >
                  Billing address is the same as shipping address
                </label>
              </div>

              <button
                type="submit"
                disabled={!canSubmitCheckout}
                className="mt-6 w-full rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden"
              >
                Pay {formattedTotal}
              </button>

              <p className="mt-6 flex justify-center text-sm font-medium text-gray-500">
                <LockClosedIcon
                  aria-hidden="true"
                  className="mr-1.5 size-5 text-gray-400"
                />
                Payment details are handled by Stripe
              </p>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}

export default function Example() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-96 items-center justify-center px-4 py-16 text-sm text-gray-600">
          Loading checkout...
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
