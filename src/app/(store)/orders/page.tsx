"use client";

import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/eden";
import { formatPrice } from "@/lib/utils";
import { Button } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";

type OrdersResponse = NonNullable<
  Awaited<ReturnType<typeof api.orders.get>>["data"]
>;
type Order = OrdersResponse["orders"][number];
type OrderItem = Order["items"][number];

function errorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "value" in error &&
    typeof error.value === "object" &&
    error.value !== null &&
    "error" in error.value &&
    typeof error.value.error === "string"
  ) {
    return error.value.error;
  }

  return fallback;
}

function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function fulfillmentLabel(status: OrderItem["fulfillmentStatus"]) {
  switch (status) {
    case "PROCESSING":
      return "Processing";
    case "SHIPPED":
      return "Shipped";
    case "OUT_FOR_DELIVERY":
      return "Out for delivery";
    case "DELIVERED":
      return "Delivered";
    case "CANCELLED":
      return "Cancelled";
    case "NOT_FULFILLED":
    default:
      return "Preparing";
  }
}

export default function OrdersPage() {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const {
    data,
    isLoading: isOrdersLoading,
    isError: isOrdersError,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await api.orders.get();

      if (response.error) {
        throw new Error(
          errorMessage(response.error, "Could not load your orders."),
        );
      }

      return response.data;
    },
    enabled: Boolean(session),
  });

  const orders = data?.orders ?? [];
  const isLoading = isSessionPending || isOrdersLoading;

  return (
    <>
      <div className="mx-auto max-w-4xl">
        <div className="px-4 sm:px-0">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Order history
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Check the status of recent orders, manage returns, and download
            invoices.
          </p>
        </div>

        {!isLoading && !session ? (
          <div
            role="alert"
            className="mt-8 rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800"
          >
            Sign in to view your order history.{" "}
            <Link href="/sign-in" className="font-medium underline">
              Go to sign in
            </Link>
            .
          </div>
        ) : null}

        {isLoading ? (
          <div
            role="status"
            className="mt-8 rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-600"
          >
            Loading your orders...
          </div>
        ) : null}

        {!isLoading && session && isOrdersError ? (
          <div
            role="alert"
            className="mt-8 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            Could not load your order history. Please refresh and try again.
          </div>
        ) : null}

        {!isLoading && session && !isOrdersError && orders.length === 0 ? (
          <div
            role="status"
            className="mt-8 rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-600"
          >
            You do not have any orders yet.{" "}
            <Link href="/products" className="font-medium text-indigo-600">
              Continue shopping
            </Link>
            .
          </div>
        ) : null}

        <section aria-labelledby="recent-heading" className="mt-16">
          <h2 id="recent-heading" className="sr-only">
            Recent orders
          </h2>

          <div className="space-y-16 sm:space-y-24">
            {orders.map((order) => (
              <div key={order.number}>
                <h3 className="sr-only">
                  Order placed on{" "}
                  <time dateTime={order.placedAt}>
                    {formatOrderDate(order.placedAt)}
                  </time>
                </h3>

                <div className="bg-gray-50 px-4 py-6 sm:rounded-lg sm:p-6 md:flex md:items-center md:justify-between md:space-x-6 lg:space-x-8">
                  <dl className="flex-auto divide-y divide-gray-200 text-sm text-gray-600 md:grid md:grid-cols-3 md:gap-x-6 md:divide-y-0 lg:w-1/2 lg:flex-none lg:gap-x-8">
                    <div className="max-md:flex max-md:justify-between max-md:py-4 max-md:first:pt-0 max-md:last:pb-0">
                      <dt className="font-medium text-gray-900">
                        Order number
                      </dt>
                      <dd className="md:mt-1">{order.number}</dd>
                    </div>
                    <div className="max-md:flex max-md:justify-between max-md:py-4 max-md:first:pt-0 max-md:last:pb-0">
                      <dt className="font-medium text-gray-900">Date placed</dt>
                      <dd className="md:mt-1">
                        <time dateTime={order.placedAt}>
                          {formatOrderDate(order.placedAt)}
                        </time>
                      </dd>
                    </div>
                    <div className="max-md:flex max-md:justify-between max-md:py-4 max-md:first:pt-0 max-md:last:pb-0">
                      <dt className="font-medium text-gray-900">
                        Total amount
                      </dt>
                      <dd className="font-medium text-gray-900 md:mt-1">
                        {formatPrice(order.totalAmount, order.currency)}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-6 space-y-4 sm:flex sm:space-y-0 sm:space-x-4 md:mt-0">
                    <Link
                      href={order.href}
                      className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-xs hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden md:w-auto"
                    >
                      View Order
                      <span className="sr-only">{order.number}</span>
                    </Link>
                    {order.invoiceUrl ? (
                      <Link
                        href={order.invoiceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-xs hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden md:w-auto"
                      >
                        View Invoice
                        <span className="sr-only">
                          for order {order.number}
                        </span>
                      </Link>
                    ) : (
                      <Button
                        disabled
                        className="flex w-full cursor-not-allowed items-center justify-center rounded-md border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-400 md:w-auto"
                      >
                        Invoice unavailable
                        <span className="sr-only">
                          for order {order.number}
                        </span>
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-6 flow-root px-4 sm:mt-10 sm:px-0">
                  <div className="-my-6 divide-y divide-gray-200 sm:-my-10">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex py-6 sm:py-10">
                        <div className="min-w-0 flex-1 lg:flex lg:flex-col">
                          <div className="lg:flex-1">
                            <div className="sm:flex">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {item.productName}
                                </h4>
                                {item.variantName ? (
                                  <p className="mt-1 text-sm text-gray-500">
                                    {item.variantName}
                                  </p>
                                ) : null}
                                {item.description ? (
                                  <p className="mt-2 hidden text-sm text-gray-500 sm:block">
                                    {item.description}
                                  </p>
                                ) : null}
                              </div>
                              <p className="mt-1 font-medium text-gray-900 sm:mt-0 sm:ml-6">
                                {formatPrice(item.unitPrice, order.currency)}
                              </p>
                            </div>
                            <div className="mt-2 flex text-sm font-medium sm:mt-4">
                              {item.href ? (
                                <Link
                                  href={item.href}
                                  className="text-indigo-600 hover:text-indigo-500"
                                >
                                  View Product
                                </Link>
                              ) : null}
                              <div className="ml-4 border-l border-gray-200 pl-4 sm:ml-6 sm:pl-6">
                                <a
                                  href="#"
                                  className="text-indigo-600 hover:text-indigo-500"
                                >
                                  Buy Again
                                </a>
                              </div>
                            </div>
                          </div>
                          <div className="mt-6 font-medium">
                            {item.fulfillmentStatus === "DELIVERED" ? (
                              <div className="flex space-x-2">
                                <CheckIcon
                                  aria-hidden="true"
                                  className="size-6 flex-none text-green-500"
                                />
                                <p>
                                  Delivered
                                  <span className="hidden sm:inline">
                                    {" "}
                                    for order placed on{" "}
                                    <time dateTime={order.placedAt}>
                                      {formatOrderDate(order.placedAt)}
                                    </time>
                                  </span>
                                </p>
                              </div>
                            ) : item.fulfillmentStatus === "CANCELLED" ? (
                              <p className="text-gray-500">Cancelled</p>
                            ) : (
                              <p>{fulfillmentLabel(item.fulfillmentStatus)}</p>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 shrink-0 sm:order-first sm:m-0 sm:mr-6">
                          {item.imageSrc ? (
                            <Image
                              alt={item.imageAlt ?? ""}
                              src={item.imageSrc}
                              width={208}
                              height={208}
                              className="col-start-2 col-end-3 size-20 rounded-lg object-cover sm:col-start-1 sm:row-span-2 sm:row-start-1 sm:size-40 lg:size-52"
                            />
                          ) : (
                            <div className="col-start-2 col-end-3 size-20 rounded-lg bg-gray-200 sm:col-start-1 sm:row-span-2 sm:row-start-1 sm:size-40 lg:size-52" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
