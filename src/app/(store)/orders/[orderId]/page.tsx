"use client";

import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/eden";
import { cn, formatPrice } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

type OrderResponse = NonNullable<
  Awaited<ReturnType<ReturnType<typeof api.orders>["get"]>>["data"]
>;
type Order = OrderResponse["order"];
type OrderItem = Order["items"][number];
type Address = NonNullable<Order["shippingAddress"]>;

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
      return "Preparing to ship";
  }
}

function fulfillmentStep(status: OrderItem["fulfillmentStatus"]) {
  switch (status) {
    case "PROCESSING":
      return 1;
    case "SHIPPED":
    case "OUT_FOR_DELIVERY":
      return 2;
    case "DELIVERED":
      return 3;
    case "CANCELLED":
    case "NOT_FULFILLED":
    default:
      return 0;
  }
}

function addressLines(address: Address | null) {
  if (!address) {
    return [];
  }

  return [
    address.name,
    address.line1,
    address.line2,
    [address.city, address.region, address.postalCode]
      .filter(Boolean)
      .join(", "),
    address.country,
  ].filter(Boolean);
}

function routeParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function OrderPage() {
  const params = useParams();
  const orderId = routeParam(params.orderId);
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const {
    data,
    isLoading: isOrderLoading,
    isError: isOrderError,
  } = useQuery({
    queryKey: ["orders", orderId],
    queryFn: async () => {
      if (!orderId) {
        throw new Error("Missing order id.");
      }

      const response = await api.orders({ orderId }).get();

      if (response.error) {
        throw new Error(
          response.error.status === 404
            ? "Order not found."
            : errorMessage(response.error, "Could not load this order."),
        );
      }

      return response.data;
    },
    enabled: Boolean(session && orderId),
  });

  const order = data?.order;
  const isLoading = isSessionPending || isOrderLoading;
  const deliveryAddressLines = addressLines(order?.shippingAddress ?? null);
  const billingAddressLines = addressLines(
    order?.billingAddress ?? order?.shippingAddress ?? null,
  );

  return (
    <>
      {!isLoading && !session ? (
        <div
          role="alert"
          className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800"
        >
          Sign in to view this order.{" "}
          <Link href="/sign-in" className="font-medium underline">
            Go to sign in
          </Link>
          .
        </div>
      ) : null}

      {isLoading ? (
        <div
          role="status"
          className="rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-600"
        >
          Loading order...
        </div>
      ) : null}

      {!isLoading && session && isOrderError ? (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          Could not load this order. Please refresh and try again.
        </div>
      ) : null}

      {!isLoading && session && order ? (
        <>
          <div className="space-y-2 px-4 sm:flex sm:items-baseline sm:justify-between sm:space-y-0 sm:px-0">
            <div className="flex sm:items-baseline sm:space-x-4">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Order {order.number}
              </h1>
              {order.invoiceUrl ? (
                <Link
                  href={order.invoiceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden text-sm font-medium text-indigo-600 hover:text-indigo-500 sm:block"
                >
                  View invoice
                  <span aria-hidden="true"> &rarr;</span>
                </Link>
              ) : null}
            </div>
            <p className="text-sm text-gray-600">
              Order placed{" "}
              <time
                dateTime={order.placedAt}
                className="font-medium text-gray-900"
              >
                {formatOrderDate(order.placedAt)}
              </time>
            </p>
            {order.invoiceUrl ? (
              <Link
                href={order.invoiceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 sm:hidden"
              >
                View invoice
                <span aria-hidden="true"> &rarr;</span>
              </Link>
            ) : null}
          </div>

          {/* Products */}
          <section aria-labelledby="products-heading" className="mt-6">
            <h2 id="products-heading" className="sr-only">
              Products purchased
            </h2>

            <div className="space-y-8">
              {order.items.map((item) => {
                const step = fulfillmentStep(item.fulfillmentStatus);

                return (
                  <div
                    key={item.id}
                    className="border-t border-b border-gray-200 bg-white shadow-xs sm:rounded-lg sm:border"
                  >
                    <div className="px-4 py-6 sm:px-6 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:p-8">
                      <div className="sm:flex lg:col-span-7">
                        {item.imageSrc ? (
                          <Image
                            alt={item.imageAlt ?? ""}
                            src={item.imageSrc}
                            width={160}
                            height={160}
                            className="aspect-square w-full shrink-0 rounded-lg object-cover sm:size-40"
                          />
                        ) : (
                          <div className="aspect-square w-full shrink-0 rounded-lg bg-gray-200 sm:size-40" />
                        )}

                        <div className="mt-6 sm:mt-0 sm:ml-6">
                          <h3 className="text-base font-medium text-gray-900">
                            {item.href ? (
                              <Link href={item.href}>{item.productName}</Link>
                            ) : (
                              item.productName
                            )}
                          </h3>
                          <p className="mt-2 text-sm font-medium text-gray-900">
                            {formatPrice(item.unitPrice, order.currency)}
                          </p>
                          {item.variantName ? (
                            <p className="mt-2 text-sm text-gray-500">
                              {item.variantName}
                            </p>
                          ) : null}
                          {item.description ? (
                            <p className="mt-3 text-sm text-gray-500">
                              {item.description}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-6 lg:col-span-5 lg:mt-0">
                        <dl className="grid grid-cols-2 gap-x-6 text-sm">
                          <div>
                            <dt className="font-medium text-gray-900">
                              Delivery address
                            </dt>
                            <dd className="mt-3 text-gray-500">
                              {deliveryAddressLines.length > 0 ? (
                                deliveryAddressLines.map((line) => (
                                  <span key={line} className="block">
                                    {line}
                                  </span>
                                ))
                              ) : (
                                <span className="block">
                                  No delivery address saved
                                </span>
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-medium text-gray-900">
                              Shipping updates
                            </dt>
                            <dd className="mt-3 space-y-3 text-gray-500">
                              <p>{order.email}</p>
                              {order.shippingAddress?.phone ? (
                                <p>{order.shippingAddress.phone}</p>
                              ) : null}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 px-4 py-6 sm:px-6 lg:p-8">
                      <h4 className="sr-only">Status</h4>
                      <p className="text-sm font-medium text-gray-900">
                        {fulfillmentLabel(item.fulfillmentStatus)} for order
                        placed on{" "}
                        <time dateTime={order.placedAt}>
                          {formatOrderDate(order.placedAt)}
                        </time>
                      </p>
                      <div aria-hidden="true" className="mt-6">
                        <div className="overflow-hidden rounded-full bg-gray-200">
                          <div
                            style={{
                              width: `calc((${step} * 2 + 1) / 8 * 100%)`,
                            }}
                            className="h-2 rounded-full bg-indigo-600"
                          />
                        </div>
                        <div className="mt-6 hidden grid-cols-4 text-sm font-medium text-gray-600 sm:grid">
                          <div className="text-indigo-600">Order placed</div>
                          <div
                            className={cn(
                              step > 0 ? "text-indigo-600" : "",
                              "text-center",
                            )}
                          >
                            Processing
                          </div>
                          <div
                            className={cn(
                              step > 1 ? "text-indigo-600" : "",
                              "text-center",
                            )}
                          >
                            Shipped
                          </div>
                          <div
                            className={cn(
                              step > 2 ? "text-indigo-600" : "",
                              "text-right",
                            )}
                          >
                            Delivered
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Billing */}
          <section aria-labelledby="summary-heading" className="mt-16">
            <h2 id="summary-heading" className="sr-only">
              Billing Summary
            </h2>

            <div className="bg-gray-100 px-4 py-6 sm:rounded-lg sm:px-6 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:px-8 lg:py-8">
              <dl className="grid grid-cols-2 gap-6 text-sm md:gap-x-8 lg:col-span-7">
                <div>
                  <dt className="font-medium text-gray-900">Billing address</dt>
                  <dd className="mt-3 text-gray-500">
                    {billingAddressLines.length > 0 ? (
                      billingAddressLines.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))
                    ) : (
                      <span className="block">No billing address saved</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-900">
                    Payment information
                  </dt>
                  <dd className="-mt-1 -ml-4 flex flex-wrap text-gray-600">
                    <div className="mt-4 ml-4 shrink-0">
                      <svg
                        width={36}
                        height={24}
                        viewBox="0 0 36 24"
                        aria-hidden="true"
                        className="h-6 w-auto"
                      >
                        <rect rx={4} fill="#224DBA" width={36} height={24} />
                        <path
                          d="M10.925 15.673H8.874l-1.538-6c-.073-.276-.228-.52-.456-.635A6.575 6.575 0 005 8.403v-.231h3.304c.456 0 .798.347.855.75l.798 4.328 2.05-5.078h1.994l-3.076 7.5zm4.216 0h-1.937L14.8 8.172h1.937l-1.595 7.5zm4.101-5.422c.057-.404.399-.635.798-.635a3.54 3.54 0 011.88.346l.342-1.615A4.808 4.808 0 0020.496 8c-1.88 0-3.248 1.039-3.248 2.481 0 1.097.969 1.673 1.653 2.02.74.346 1.025.577.968.923 0 .519-.57.75-1.139.75a4.795 4.795 0 01-1.994-.462l-.342 1.616a5.48 5.48 0 002.108.404c2.108.057 3.418-.981 3.418-2.539 0-1.962-2.678-2.077-2.678-2.942zm9.457 5.422L27.16 8.172h-1.652a.858.858 0 00-.798.577l-2.848 6.924h1.994l.398-1.096h2.45l.228 1.096h1.766zm-2.905-5.482l.57 2.827h-1.596l1.026-2.827z"
                          fill="#fff"
                        />
                      </svg>
                      <p className="sr-only">{order.payment?.provider}</p>
                    </div>
                    <div className="mt-4 ml-4">
                      <p className="text-gray-900">
                        {order.payment?.brand
                          ? order.payment.brand
                          : (order.payment?.provider ?? "Payment")}{" "}
                        {order.payment?.last4
                          ? `ending with ${order.payment.last4}`
                          : (order.payment?.status.toLowerCase() ?? "pending")}
                      </p>
                      {order.payment?.expMonth && order.payment.expYear ? (
                        <p>
                          Expires{" "}
                          {String(order.payment.expMonth).padStart(2, "0")} /{" "}
                          {order.payment.expYear}
                        </p>
                      ) : null}
                    </div>
                  </dd>
                </div>
              </dl>

              <dl className="mt-8 divide-y divide-gray-200 text-sm lg:col-span-5 lg:mt-0">
                <div className="flex items-center justify-between pb-4">
                  <dt className="text-gray-600">Subtotal</dt>
                  <dd className="font-medium text-gray-900">
                    {formatPrice(order.subtotalAmount, order.currency)}
                  </dd>
                </div>
                <div className="flex items-center justify-between py-4">
                  <dt className="text-gray-600">Shipping</dt>
                  <dd className="font-medium text-gray-900">
                    {formatPrice(order.shippingAmount, order.currency)}
                  </dd>
                </div>
                <div className="flex items-center justify-between py-4">
                  <dt className="text-gray-600">Tax</dt>
                  <dd className="font-medium text-gray-900">
                    {formatPrice(order.taxAmount, order.currency)}
                  </dd>
                </div>
                <div className="flex items-center justify-between py-4">
                  <dt className="text-gray-600">Discount</dt>
                  <dd className="font-medium text-gray-900">
                    {formatPrice(order.discountAmount, order.currency)}
                  </dd>
                </div>
                <div className="flex items-center justify-between pt-4">
                  <dt className="font-medium text-gray-900">Order total</dt>
                  <dd className="font-medium text-indigo-600">
                    {formatPrice(order.totalAmount, order.currency)}
                  </dd>
                </div>
              </dl>
            </div>
          </section>
        </>
      ) : null}
    </>
  );
}
