import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { LockClosedIcon } from "@heroicons/react/20/solid";

const subtotal = "$210.00";
const discount = { code: "CHEAPSKATE", amount: "$24.00" };
const taxes = "$23.68";
const shipping = "$22.00";
const total = "$341.68";
const products = [
  {
    id: 1,
    name: "Micro Backpack",
    href: "#",
    price: "$70.00",
    color: "Moss",
    size: "5L",
    imageSrc:
      "https://tailwindcss.com/plus-assets/img/ecommerce-images/checkout-page-04-product-01.jpg",
    imageAlt:
      "Moss green canvas compact backpack with double top zipper, zipper front pouch, and matching carry handle and backpack straps.",
  },
  {
    id: 2,
    name: "Small Stuff Satchel",
    href: "#",
    price: "$180.00",
    color: "Sand",
    size: "18L",
    imageSrc:
      "https://tailwindcss.com/plus-assets/img/ecommerce-images/checkout-page-04-product-02.jpg",
    imageAlt:
      "Front of satchel with tan canvas body, straps, handle, drawstring top, and front zipper pouch.",
  },
  {
    id: 3,
    name: "Carry Clutch",
    href: "#",
    price: "$70.00",
    color: "White and Black",
    size: "Small",
    imageSrc:
      "https://tailwindcss.com/plus-assets/img/ecommerce-images/checkout-page-04-product-03.jpg",
    imageAlt:
      "Folding zipper clutch with white fabric body, synthetic black leather accent strip, and black loop zipper pull.",
  },
];

type CheckoutPageProps = {
  searchParams: Promise<{
    payment?: string | string[];
    session_id?: string | string[];
  }>;
};

function searchParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Example({ searchParams }: CheckoutPageProps) {
  const paymentStatus = searchParamValue((await searchParams).payment);

  return (
    <>
      <main className="lg:flex lg:min-h-full lg:flex-row-reverse lg:overflow-hidden">
        <div className="px-4 py-6 sm:px-6 lg:hidden">
          <div className="mx-auto flex max-w-lg">
            <a href="#">
              <span className="sr-only">Your Company</span>
              <img
                alt=""
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
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
              <ul
                role="list"
                className="divide-y divide-gray-200 border-b border-gray-200"
              >
                {products.map((product) => (
                  <li key={product.id} className="flex space-x-6 py-6">
                    <img
                      alt={product.imageAlt}
                      src={product.imageSrc}
                      className="size-40 flex-none rounded-md bg-gray-200 object-cover"
                    />
                    <div className="flex flex-col justify-between space-y-4">
                      <div className="space-y-1 text-sm font-medium">
                        <h3 className="text-gray-900">{product.name}</h3>
                        <p className="text-gray-900">{product.price}</p>
                        <p className="text-gray-500">{product.color}</p>
                        <p className="text-gray-500">{product.size}</p>
                      </div>
                      <div className="flex space-x-4">
                        <button
                          type="button"
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          Edit
                        </button>
                        <div className="flex border-l border-gray-300 pl-4">
                          <button
                            type="button"
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <form className="mt-10">
                <label
                  htmlFor="discount-code-mobile"
                  className="block text-sm/6 font-medium text-gray-700"
                >
                  Discount code
                </label>
                <div className="mt-1 flex space-x-4">
                  <input
                    id="discount-code-mobile"
                    name="discount-code-mobile"
                    type="text"
                    className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-gray-200 px-4 text-sm font-medium text-gray-600 hover:bg-gray-300 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 focus:outline-hidden"
                  >
                    Apply
                  </button>
                </div>
              </form>

              <dl className="mt-10 space-y-6 text-sm font-medium text-gray-500">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd className="text-gray-900">{subtotal}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="flex">
                    Discount
                    <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs tracking-wide text-gray-600">
                      {discount.code}
                    </span>
                  </dt>
                  <dd className="text-gray-900">-{discount.amount}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Taxes</dt>
                  <dd className="text-gray-900">{taxes}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Shipping</dt>
                  <dd className="text-gray-900">{shipping}</dd>
                </div>
              </dl>
            </DisclosurePanel>

            <p className="mt-6 flex items-center justify-between border-t border-gray-200 pt-6 text-sm font-medium text-gray-900">
              <span className="text-base">Total</span>
              <span className="text-base">{total}</span>
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

          <ul
            role="list"
            className="flex-auto divide-y divide-gray-200 overflow-y-auto px-6"
          >
            {products.map((product) => (
              <li key={product.id} className="flex space-x-6 py-6">
                <img
                  alt={product.imageAlt}
                  src={product.imageSrc}
                  className="size-40 flex-none rounded-md bg-gray-200 object-cover"
                />
                <div className="flex flex-col justify-between space-y-4">
                  <div className="space-y-1 text-sm font-medium">
                    <h3 className="text-gray-900">{product.name}</h3>
                    <p className="text-gray-900">{product.price}</p>
                    <p className="text-gray-500">{product.color}</p>
                    <p className="text-gray-500">{product.size}</p>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Edit
                    </button>
                    <div className="flex border-l border-gray-300 pl-4">
                      <button
                        type="button"
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="sticky bottom-0 flex-none border-t border-gray-200 bg-gray-50 p-6">
            <form>
              <label
                htmlFor="discount-code"
                className="block text-sm/6 font-medium text-gray-700"
              >
                Discount code
              </label>
              <div className="mt-1 flex space-x-4">
                <input
                  id="discount-code"
                  name="discount-code"
                  type="text"
                  className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
                <button
                  type="submit"
                  className="rounded-md bg-gray-200 px-4 text-sm font-medium text-gray-600 hover:bg-gray-300 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 focus:outline-hidden"
                >
                  Apply
                </button>
              </div>
            </form>

            <dl className="mt-10 space-y-6 text-sm font-medium text-gray-500">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd className="text-gray-900">{subtotal}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="flex">
                  Discount
                  <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs tracking-wide text-gray-600">
                    {discount.code}
                  </span>
                </dt>
                <dd className="text-gray-900">-{discount.amount}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Taxes</dt>
                <dd className="text-gray-900">{taxes}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Shipping</dt>
                <dd className="text-gray-900">{shipping}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-6 text-gray-900">
                <dt className="text-base">Total</dt>
                <dd className="text-base">{total}</dd>
              </div>
            </dl>
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
                <img
                  alt=""
                  src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                  className="h-8 w-auto"
                />
              </a>
            </div>

            {paymentStatus === "success" ? (
              <div
                role="status"
                className="mb-6 rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800"
              >
                Payment successful. Thanks for your order, we&apos;re getting it
                ready.
              </div>
            ) : null}

            {paymentStatus === "cancelled" ? (
              <div
                role="alert"
                className="mb-6 rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800"
              >
                Payment was cancelled. You can review your details and try
                again.
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
                className="mt-6 w-full rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden"
              >
                Pay {total}
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
