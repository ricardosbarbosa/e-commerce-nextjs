import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  CartStatus,
  CollectionType,
  DiscountType,
  FulfillmentStatus,
  OrderStatus,
  PaymentProvider,
  PaymentStatus,
  ProductStatus,
} from "../src/generated/prisma/enums";

const defaultDatabaseUrl = "postgresql://app:app@127.0.0.1:5433/ecommerce";
const databaseUrl =
  process.env.DATABASE_PRISMA_DATABASE_URL ??
  process.env.DATABASE_URL ??
  defaultDatabaseUrl;

const pool = new Pool({
  connectionString: databaseUrl,
});

const userId = "gHNtel8EfqtFxEDzHS7ajOcgbxJ7aRo2";
const adminUser = {
  id: userId,
  name: "Store Admin",
  email: "admin@example.com",
  emailVerified: true,
  role: "admin",
};

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
  log: ["error", "warn"],
});

type ImageSeed = {
  src: string;
  alt?: string;
  primary?: boolean;
};

type VariantSeed = {
  color?: string;
  size?: string;
  sku?: string;
  inventoryQuantity?: number;
  leadTime?: string;
};

type ReviewSeed = {
  authorName: string;
  title: string;
  content: string;
  rating: number;
  publishedAt: string;
};

type ProductSeed = {
  slug: string;
  name: string;
  description?: string;
  details?: string[];
  price: string;
  compareAtPrice?: string;
  isFeatured?: boolean;
  categories?: string[];
  collections?: string[];
  images: ImageSeed[];
  variants?: VariantSeed[];
  reviews?: ReviewSeed[];
};

type OrderItemSeed = {
  productSlug: string;
  productName: string;
  variantName?: string;
  unitPrice: string;
  quantity?: number;
  fulfillmentStatus?: (typeof FulfillmentStatus)[keyof typeof FulfillmentStatus];
  fulfilledAt?: string;
  imageSrc?: string;
  imageAlt?: string;
};

type OrderSeed = {
  number: string;
  email: string;
  status: (typeof OrderStatus)[keyof typeof OrderStatus];
  paymentStatus: (typeof PaymentStatus)[keyof typeof PaymentStatus];
  fulfillmentStatus: (typeof FulfillmentStatus)[keyof typeof FulfillmentStatus];
  subtotalAmount: string;
  discountAmount?: string;
  shippingAmount?: string;
  taxAmount?: string;
  totalAmount: string;
  discountCode?: string;
  placedAt: string;
  shippingAddressId?: string;
  billingAddressId?: string;
  payment?: {
    provider: (typeof PaymentProvider)[keyof typeof PaymentProvider];
    status: (typeof PaymentStatus)[keyof typeof PaymentStatus];
    amount: string;
    brand?: string;
    last4?: string;
    expMonth?: number;
    expYear?: number;
  };
  invoice?: {
    number: string;
    url?: string;
    issuedAt?: string;
  };
  items: OrderItemSeed[];
};

function money(value: string) {
  return value.replace(/[^0-9.]/g, "");
}

function seedId(...parts: string[]) {
  return `seed-${parts
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}`;
}

const categorySeeds = [
  {
    slug: "new-arrivals",
    name: "New Arrivals",
    description:
      "Checkout out the latest release of Basic Tees, new and improved with four openings!",
    imageSrc:
      "https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-featured-category.jpg",
    imageAlt:
      "Two models wearing women's black cotton crewneck tee and off-white cotton crewneck tee.",
  },
  {
    slug: "accessories",
    name: "Accessories",
    imageSrc:
      "https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-category-01.jpg",
    imageAlt:
      "Wooden shelf with gray and olive drab green baseball caps, next to wooden clothes hanger with sweaters.",
  },
  {
    slug: "workspace",
    name: "Workspace",
    imageSrc:
      "https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-category-02.jpg",
    imageAlt:
      "Walnut desk organizer set with white modular trays, next to porcelain mug on wooden desk.",
  },
  {
    slug: "tees",
    name: "Tees",
  },
  {
    slug: "crewnecks",
    name: "Crewnecks",
  },
  {
    slug: "sweatshirts",
    name: "Sweatshirts",
  },
  {
    slug: "pants-shorts",
    name: "Pants & Shorts",
  },
];

const colorSeeds = [
  {
    slug: "black",
    name: "Black",
    hex: "#111827",
    className: "bg-gray-900 checked:outline-gray-900",
  },
  {
    slug: "heather-grey",
    name: "Heather Grey",
    hex: "#9ca3af",
    className: "bg-gray-400 checked:outline-gray-400",
  },
  { slug: "white", name: "White", hex: "#ffffff" },
  { slug: "off-white", name: "Off-White", hex: "#f9fafb" },
  { slug: "burgundy-red", name: "Burgundy Red", hex: "#7f1d1d" },
  { slug: "aspen-white", name: "Aspen White", hex: "#f8fafc" },
  { slug: "charcoal", name: "Charcoal", hex: "#374151" },
  { slug: "iso-dots", name: "Iso Dots" },
  { slug: "sienna", name: "Sienna", hex: "#a16207" },
  { slug: "moss", name: "Moss", hex: "#4d7c0f" },
  { slug: "sand", name: "Sand", hex: "#d6d3d1" },
  { slug: "white-and-black", name: "White and Black" },
  { slug: "natural", name: "Natural" },
  { slug: "tan-and-charcoal", name: "Tan and Charcoal" },
  { slug: "walnut", name: "Walnut" },
];

const sizeSeeds = [
  { slug: "xxs", name: "XXS", sortOrder: 0 },
  { slug: "xs", name: "XS", sortOrder: 1 },
  { slug: "s", name: "S", sortOrder: 2 },
  { slug: "m", name: "M", sortOrder: 3 },
  { slug: "l", name: "L", sortOrder: 4 },
  { slug: "large", name: "Large", sortOrder: 5 },
  { slug: "xl", name: "XL", sortOrder: 6 },
  { slug: "2xl", name: "2XL", sortOrder: 7 },
  { slug: "5l", name: "5L", sortOrder: 8 },
  { slug: "18l", name: "18L", sortOrder: 9 },
  { slug: "small", name: "Small", sortOrder: 10 },
];

const collectionSeeds = [
  {
    slug: "our-favorites",
    name: "Our Favorites",
    description: "Featured products from the storefront favorites section.",
    type: CollectionType.FAVORITES,
  },
  {
    slug: "new-arrivals",
    name: "New Arrivals",
    description: "Products from the New Arrivals category page.",
    type: CollectionType.NEW_ARRIVALS,
    imageSrc:
      "https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-featured-category.jpg",
    imageAlt:
      "Two models wearing women's black cotton crewneck tee and off-white cotton crewneck tee.",
  },
  {
    slug: "cart-recommendations",
    name: "You may also like",
    description: "Related products shown on the shopping cart page.",
    type: CollectionType.FEATURED,
  },
  {
    slug: "checkout-order",
    name: "Checkout Order",
    description: "Products shown in the static checkout order summary.",
    type: CollectionType.FEATURED,
  },
  {
    slug: "sale",
    name: "Final Stock",
    description: "Up to 50% off.",
    type: CollectionType.SALE,
    imageSrc:
      "https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-feature-section-full-width.jpg",
  },
];

const productSeeds: ProductSeed[] = [
  {
    slug: "black-basic-tee",
    name: "Black Basic Tee",
    price: "32.00",
    isFeatured: true,
    categories: ["new-arrivals", "tees"],
    collections: ["our-favorites", "sale"],
    images: [
      {
        src: "https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-favorite-01.jpg",
        alt: "Model wearing women's black cotton crewneck tee.",
        primary: true,
      },
    ],
    variants: [{ color: "black", sku: "TEE-BASIC-BLACK" }],
  },
  {
    slug: "off-white-basic-tee",
    name: "Off-White Basic Tee",
    price: "32.00",
    isFeatured: true,
    categories: ["new-arrivals", "tees"],
    collections: ["our-favorites"],
    images: [
      {
        src: "https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-favorite-02.jpg",
        alt: "Model wearing women's off-white cotton crewneck tee.",
        primary: true,
      },
    ],
    variants: [{ color: "off-white", sku: "TEE-BASIC-OFF-WHITE" }],
  },
  {
    slug: "mountains-artwork-tee",
    name: "Mountains Artwork Tee",
    price: "36.00",
    isFeatured: true,
    categories: ["new-arrivals", "tees"],
    collections: ["our-favorites"],
    images: [
      {
        src: "https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-favorite-03.jpg",
        alt: "Model wearing women's burgundy red crewneck artwork tee with small white triangle overlapping larger black triangle.",
        primary: true,
      },
    ],
    variants: [{ color: "burgundy-red", sku: "TEE-MOUNTAINS-BURGUNDY" }],
  },
  {
    slug: "basic-tee-8-pack",
    name: "Basic Tee 8-Pack",
    description:
      "Get the full lineup of our Basic Tees. Have a fresh shirt all week, and an extra for laundry day.",
    price: "256.00",
    categories: ["new-arrivals", "tees"],
    collections: ["new-arrivals"],
    images: [
      {
        src: "https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-02-image-card-01.jpg",
        alt: "Eight shirts arranged on table in black, olive, grey, blue, white, red, mustard, and green.",
        primary: true,
      },
    ],
  },
  {
    slug: "basic-tee-black-category",
    name: "Basic Tee",
    description:
      "Look like a visionary CEO and wear the same black t-shirt every day.",
    price: "32.00",
    categories: ["new-arrivals", "tees"],
    collections: ["new-arrivals"],
    images: [
      {
        src: "https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-02-image-card-02.jpg",
        alt: "Front of plain black t-shirt.",
        primary: true,
      },
    ],
    variants: [{ color: "black", sku: "TEE-BASIC-BLACK-CATEGORY" }],
  },
  {
    slug: "kinda-white-basic-tee",
    name: "Kinda White Basic Tee",
    description: "It's probably, like, 5000 Kelvin instead of 6000 K.",
    price: "32.00",
    categories: ["new-arrivals", "tees"],
    collections: ["new-arrivals"],
    images: [
      {
        src: "https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-02-image-card-03.jpg",
        alt: "Front of plain white t-shirt.",
        primary: true,
      },
    ],
    variants: [{ color: "white", sku: "TEE-BASIC-KINDA-WHITE" }],
  },
  {
    slug: "stone-basic-tee",
    name: "Stone Basic Tee",
    description:
      "White tees stain easily, and black tees fade. This is going to be gray for a while.",
    price: "32.00",
    categories: ["new-arrivals", "tees"],
    collections: ["new-arrivals"],
    images: [
      {
        src: "https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-02-image-card-04.jpg",
        alt: "Front of plain dark gray t-shirt.",
        primary: true,
      },
    ],
    variants: [{ color: "charcoal", sku: "TEE-BASIC-STONE" }],
  },
  {
    slug: "fall-basic-tee-3-pack",
    name: "Fall Basic Tee 3-Pack",
    description:
      "Who need stark minimalism when you could have earth tones? Embrace the season.",
    price: "96.00",
    categories: ["new-arrivals", "tees"],
    collections: ["new-arrivals"],
    images: [
      {
        src: "https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-02-image-card-05.jpg",
        alt: "Three shirts arranged on table in mustard, dark gray, and olive.",
        primary: true,
      },
    ],
    variants: [{ color: "charcoal", sku: "TEE-BASIC-FALL-3-PACK" }],
  },
  {
    slug: "linework-artwork-tee-3-pack",
    name: "Linework Artwork Tee 3-Pack",
    description:
      "Get all 3 colors of our popular Linework design and some variety to your monotonous life.",
    price: "108.00",
    categories: ["new-arrivals", "tees"],
    collections: ["new-arrivals"],
    images: [
      {
        src: "https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-02-image-card-06.jpg",
        alt: "Three shirts in gray, white, and blue arranged on table with same line drawing of hands and shapes overlapping on front of shirt.",
        primary: true,
      },
    ],
  },
  {
    slug: "basic-tee-detail",
    name: "Basic Tee",
    description:
      "The Basic tee is an honest new take on a classic. The tee uses super soft, pre-shrunk cotton for true comfort and a dependable fit. Looking to stock your closet? The Basic tee also comes in a 3-pack or 5-pack at a bundle discount.",
    details: [
      "Only the best materials",
      "Ethically and locally made",
      "Pre-washed and pre-shrunk",
      "Machine wash cold with similar colors",
    ],
    price: "35.00",
    categories: ["new-arrivals", "tees"],
    images: [
      {
        src: "https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-featured-product-shot.jpg",
        alt: "Back of women's Basic Tee in black.",
        primary: true,
      },
      {
        src: "https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-product-shot-01.jpg",
        alt: "Side profile of women's Basic Tee in black.",
      },
      {
        src: "https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-product-shot-02.jpg",
        alt: "Front of women's Basic Tee in black.",
      },
    ],
    variants: [
      {
        color: "black",
        size: "xxs",
        sku: "TEE-BASIC-DETAIL-BLACK-XXS",
        inventoryQuantity: 18,
      },
      {
        color: "black",
        size: "xs",
        sku: "TEE-BASIC-DETAIL-BLACK-XS",
        inventoryQuantity: 18,
      },
      {
        color: "black",
        size: "s",
        sku: "TEE-BASIC-DETAIL-BLACK-S",
        inventoryQuantity: 18,
      },
      {
        color: "black",
        size: "m",
        sku: "TEE-BASIC-DETAIL-BLACK-M",
        inventoryQuantity: 18,
      },
      {
        color: "black",
        size: "l",
        sku: "TEE-BASIC-DETAIL-BLACK-L",
        inventoryQuantity: 18,
      },
      {
        color: "black",
        size: "xl",
        sku: "TEE-BASIC-DETAIL-BLACK-XL",
        inventoryQuantity: 0,
      },
      {
        color: "heather-grey",
        size: "s",
        sku: "TEE-BASIC-DETAIL-GREY-S",
        inventoryQuantity: 12,
      },
      {
        color: "heather-grey",
        size: "m",
        sku: "TEE-BASIC-DETAIL-GREY-M",
        inventoryQuantity: 12,
      },
    ],
    reviews: [
      {
        authorName: "Risako M",
        title: "Can't say enough good things",
        content:
          "I was really pleased with the overall shopping experience. My order even included a little personal, handwritten note, which delighted me! The product quality is amazing, it looks and feel even better than I had anticipated.",
        rating: 5,
        publishedAt: "2021-01-06",
      },
      {
        authorName: "Jackie H",
        title: "Very comfy and looks the part",
        content:
          "After a quick chat with customer support, I had a good feeling about this shirt and ordered three of them. Less than 48 hours later, my delivery arrived.",
        rating: 5,
        publishedAt: "2021-01-06",
      },
      {
        authorName: "Laura G",
        title: "The last shirts I may ever need",
        content:
          "I bought two of those comfy cotton shirts, and let me tell you: they're amazing! I have been wearing them almost every day.",
        rating: 4,
        publishedAt: "2021-01-06",
      },
    ],
  },
  {
    slug: "basic-tee-aspen-white",
    name: "Basic Tee",
    price: "35.00",
    categories: ["tees"],
    images: [
      {
        src: "https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-02.jpg",
        alt: "Front of men's Basic Tee in white.",
        primary: true,
      },
    ],
    variants: [{ color: "aspen-white", sku: "TEE-BASIC-ASPEN-WHITE" }],
  },
  {
    slug: "basic-tee-charcoal",
    name: "Basic Tee",
    price: "35.00",
    categories: ["tees"],
    images: [
      {
        src: "https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-03.jpg",
        alt: "Front of men's Basic Tee in dark gray.",
        primary: true,
      },
    ],
    variants: [{ color: "charcoal", sku: "TEE-BASIC-CHARCOAL" }],
  },
  {
    slug: "artwork-tee-iso-dots",
    name: "Artwork Tee",
    price: "35.00",
    categories: ["tees"],
    images: [
      {
        src: "https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-04.jpg",
        alt: "Front of men's Artwork Tee in peach with white and brown dots forming an isometric cube.",
        primary: true,
      },
    ],
    variants: [{ color: "iso-dots", sku: "TEE-ARTWORK-ISO-DOTS" }],
  },
  {
    slug: "basic-tee-black-related",
    name: "Basic Tee",
    price: "35.00",
    categories: ["tees"],
    images: [
      {
        src: "https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-01.jpg",
        alt: "Front of men's Basic Tee in black.",
        primary: true,
      },
    ],
    variants: [{ color: "black", sku: "TEE-BASIC-BLACK-RELATED" }],
  },
  {
    slug: "basic-tee-sienna-large",
    name: "Basic Tee",
    price: "32.00",
    categories: ["tees"],
    images: [
      {
        src: "https://tailwindcss.com/plus-assets/img/ecommerce-images/shopping-cart-page-01-product-01.jpg",
        alt: "Front of men's Basic Tee in sienna.",
        primary: true,
      },
    ],
    variants: [
      {
        color: "sienna",
        size: "large",
        sku: "TEE-BASIC-SIENNA-LARGE",
        inventoryQuantity: 7,
      },
    ],
  },
  {
    slug: "basic-tee-black-large",
    name: "Basic Tee",
    price: "32.00",
    categories: ["tees"],
    images: [
      {
        src: "https://tailwindcss.com/plus-assets/img/ecommerce-images/shopping-cart-page-01-product-02.jpg",
        alt: "Front of men's Basic Tee in black.",
        primary: true,
      },
    ],
    variants: [
      {
        color: "black",
        size: "large",
        sku: "TEE-BASIC-BLACK-LARGE",
        inventoryQuantity: 0,
        leadTime: "3-4 weeks",
      },
    ],
  },
  {
    slug: "nomad-tumbler",
    name: "Nomad Tumbler",
    description:
      "This durable double-walled insulated tumbler keeps your beverages at the perfect temperature all day long. Hot, cold, or even lukewarm if you're weird like that, this bottle is ready for your next adventure.",
    price: "35.00",
    categories: ["accessories"],
    images: [
      {
        src: "https://tailwindcss.com/plus-assets/img/ecommerce-images/shopping-cart-page-01-product-03.jpg",
        alt: "Insulated bottle with white base and black snap lid.",
        primary: true,
      },
      {
        src: "https://tailwindcss.com/plus-assets/img/ecommerce-images/order-history-page-06-product-01.jpg",
        alt: "Olive drab green insulated bottle with flared screw lid and flat top.",
      },
      {
        src: "https://tailwindcss.com/plus-assets/img/ecommerce-images/confirmation-page-03-product-01.jpg",
        alt: "Insulated bottle with white base and black snap lid.",
      },
    ],
    variants: [
      { color: "white", sku: "NOMAD-TUMBLER-WHITE", inventoryQuantity: 14 },
    ],
  },
  {
    slug: "billfold-wallet",
    name: "Billfold Wallet",
    price: "118.00",
    categories: ["accessories"],
    collections: ["cart-recommendations"],
    images: [
      {
        src: "https://tailwindcss.com/plus-assets/img/ecommerce-images/shopping-cart-page-01-related-product-01.jpg",
        alt: "Front of Billfold Wallet in natural leather.",
        primary: true,
      },
    ],
    variants: [{ color: "natural", sku: "BILLFOLD-WALLET-NATURAL" }],
  },
  {
    slug: "machined-pen-and-pencil-set",
    name: "Machined Pen and Pencil Set",
    price: "70.00",
    categories: ["workspace"],
    collections: ["cart-recommendations"],
    images: [
      {
        src: "https://tailwindcss.com/plus-assets/img/ecommerce-images/shopping-cart-page-01-related-product-02.jpg",
        alt: "Black machined pen and pencil with hexagonal shaft and small white logo.",
        primary: true,
      },
    ],
    variants: [{ color: "black", sku: "MACHINED-PEN-PENCIL-BLACK" }],
  },
  {
    slug: "mini-sketchbook-set",
    name: "Mini Sketchbook Set",
    description:
      "These pocket-sized sketchbooks feature recycled paper covers and screen printed designs from our top-selling poster collection.",
    price: "27.00",
    categories: ["workspace"],
    collections: ["cart-recommendations"],
    images: [
      {
        src: "https://tailwindcss.com/plus-assets/img/ecommerce-images/shopping-cart-page-01-related-product-03.jpg",
        alt: "Three mini sketchbooks with tan and charcoal typography poster covers.",
        primary: true,
      },
      {
        src: "https://tailwindcss.com/plus-assets/img/ecommerce-images/order-history-page-06-product-04.jpg",
        alt: "Set of three light and dark brown mini sketch books.",
      },
    ],
    variants: [
      { color: "tan-and-charcoal", sku: "MINI-SKETCHBOOK-TAN-CHARCOAL" },
    ],
  },
  {
    slug: "organize-set",
    name: "Organize Set",
    price: "149.00",
    categories: ["workspace"],
    collections: ["cart-recommendations"],
    images: [
      {
        src: "https://tailwindcss.com/plus-assets/img/ecommerce-images/shopping-cart-page-01-related-product-04.jpg",
        alt: "Grooved walnut desk organizer base with five modular white plastic organizer trays.",
        primary: true,
      },
    ],
    variants: [{ color: "walnut", sku: "ORGANIZE-SET-WALNUT" }],
  },
  {
    slug: "micro-backpack",
    name: "Micro Backpack",
    price: "70.00",
    categories: ["accessories"],
    collections: ["checkout-order"],
    images: [
      {
        src: "https://tailwindcss.com/plus-assets/img/ecommerce-images/checkout-page-04-product-01.jpg",
        alt: "Moss green canvas compact backpack with double top zipper, zipper front pouch, and matching carry handle and backpack straps.",
        primary: true,
      },
    ],
    variants: [{ color: "moss", size: "5l", sku: "MICRO-BACKPACK-MOSS-5L" }],
  },
  {
    slug: "small-stuff-satchel",
    name: "Small Stuff Satchel",
    price: "180.00",
    categories: ["accessories"],
    collections: ["checkout-order"],
    images: [
      {
        src: "https://tailwindcss.com/plus-assets/img/ecommerce-images/checkout-page-04-product-02.jpg",
        alt: "Front of satchel with tan canvas body, straps, handle, drawstring top, and front zipper pouch.",
        primary: true,
      },
    ],
    variants: [
      { color: "sand", size: "18l", sku: "SMALL-STUFF-SATCHEL-SAND-18L" },
    ],
  },
  {
    slug: "carry-clutch",
    name: "Carry Clutch",
    price: "70.00",
    categories: ["accessories"],
    collections: ["checkout-order"],
    images: [
      {
        src: "https://tailwindcss.com/plus-assets/img/ecommerce-images/checkout-page-04-product-03.jpg",
        alt: "Folding zipper clutch with white fabric body, synthetic black leather accent strip, and black loop zipper pull.",
        primary: true,
      },
    ],
    variants: [
      {
        color: "white-and-black",
        size: "small",
        sku: "CARRY-CLUTCH-WHITE-BLACK-SMALL",
      },
    ],
  },
  {
    slug: "leather-long-wallet",
    name: "Leather Long Wallet",
    description:
      "We're not sure who carries cash anymore, but this leather long wallet will keep those bills nice and fold-free.",
    price: "118.00",
    categories: ["accessories"],
    images: [
      {
        src: "https://tailwindcss.com/plus-assets/img/ecommerce-images/order-history-page-06-product-02.jpg",
        alt: "Leather long wallet held open with hand-stitched card dividers, full-length bill pocket, and simple tab closure.",
        primary: true,
      },
    ],
    variants: [{ color: "natural", sku: "LEATHER-LONG-WALLET-NATURAL" }],
  },
  {
    slug: "minimalist-wristwatch",
    name: "Minimalist Wristwatch",
    description:
      "This contemporary wristwatch has a clean, minimalist look and high quality components. Everyone knows you'll never use it to check the time, but wow, does that wrist look good with this timepiece on it.",
    price: "149.00",
    categories: ["accessories"],
    images: [
      {
        src: "https://tailwindcss.com/plus-assets/img/ecommerce-images/order-history-page-06-product-03.jpg",
        alt: "Wristwatch with black leather band, brass ring-3, white watch face, thin watch hands, and fine time markings.",
        primary: true,
      },
      {
        src: "https://tailwindcss.com/plus-assets/img/ecommerce-images/confirmation-page-03-product-02.jpg",
        alt: "Arm modeling wristwatch with black leather band, white watch face, thin watch hands, and fine time markings.",
      },
    ],
    variants: [{ color: "black", sku: "MINIMALIST-WRISTWATCH-BLACK" }],
  },
];

const recommendationSeeds = [
  "basic-tee-aspen-white",
  "basic-tee-charcoal",
  "artwork-tee-iso-dots",
  "basic-tee-black-related",
].map((recommendedProductSlug, sortOrder) => ({
  productSlug: "basic-tee-detail",
  recommendedProductSlug,
  sortOrder,
}));

const addressSeeds = [
  {
    id: "seed-address-floyd-miles",
    name: "Floyd Miles",
    email: "floyd@example.com",
    phone: "15555555540",
    line1: "7363 Cynthia Pass",
    city: "Toronto",
    region: "ON",
    postalCode: "N3Y 4H8",
    country: "CA",
  },
];

const cartSeeds = [
  {
    id: "seed-cart-shopping-cart",
    userId,
    sessionId: "seed-session-shopping-cart",
    status: CartStatus.ACTIVE,
    items: [
      {
        productSlug: "basic-tee-sienna-large",
        variantSku: "TEE-BASIC-SIENNA-LARGE",
        quantity: 1,
        unitPriceSnapshot: "32.00",
      },
      {
        productSlug: "basic-tee-black-large",
        variantSku: "TEE-BASIC-BLACK-LARGE",
        quantity: 1,
        unitPriceSnapshot: "32.00",
      },
      {
        productSlug: "nomad-tumbler",
        variantSku: "NOMAD-TUMBLER-WHITE",
        quantity: 1,
        unitPriceSnapshot: "35.00",
      },
    ],
  },
];

const discountSeeds = [
  {
    code: "CHEAPSKATE",
    type: DiscountType.FIXED_AMOUNT,
    amount: "24.00",
    isActive: true,
  },
];

const orderSeeds: OrderSeed[] = [
  {
    number: "WU88191111",
    email: "floyd@example.com",
    status: OrderStatus.CONFIRMED,
    paymentStatus: PaymentStatus.PAID,
    fulfillmentStatus: FulfillmentStatus.OUT_FOR_DELIVERY,
    subtotalAmount: "302.00",
    totalAmount: "302.00",
    placedAt: "2021-01-22",
    shippingAddressId: "seed-address-floyd-miles",
    billingAddressId: "seed-address-floyd-miles",
    payment: {
      provider: PaymentProvider.CARD,
      status: PaymentStatus.PAID,
      amount: "302.00",
      brand: "Visa",
      last4: "4242",
      expMonth: 2,
      expYear: 2024,
    },
    invoice: { number: "INV-WU88191111", issuedAt: "2021-01-22" },
    items: [
      {
        productSlug: "nomad-tumbler",
        productName: "Nomad Tumbler",
        unitPrice: "35.00",
        fulfillmentStatus: FulfillmentStatus.OUT_FOR_DELIVERY,
        imageSrc:
          "https://tailwindcss.com/plus-assets/img/ecommerce-images/order-history-page-06-product-01.jpg",
        imageAlt:
          "Olive drab green insulated bottle with flared screw lid and flat top.",
      },
      {
        productSlug: "leather-long-wallet",
        productName: "Leather Long Wallet",
        unitPrice: "118.00",
        fulfillmentStatus: FulfillmentStatus.DELIVERED,
        fulfilledAt: "2021-01-25",
        imageSrc:
          "https://tailwindcss.com/plus-assets/img/ecommerce-images/order-history-page-06-product-02.jpg",
        imageAlt:
          "Leather long wallet held open with hand-stitched card dividers, full-length bill pocket, and simple tab closure.",
      },
      {
        productSlug: "minimalist-wristwatch",
        productName: "Minimalist Wristwatch",
        unitPrice: "149.00",
        fulfillmentStatus: FulfillmentStatus.DELIVERED,
        fulfilledAt: "2021-01-25",
        imageSrc:
          "https://tailwindcss.com/plus-assets/img/ecommerce-images/order-history-page-06-product-03.jpg",
        imageAlt:
          "Wristwatch with black leather band, brass ring-3, white watch face, thin watch hands, and fine time markings.",
      },
    ],
  },
  {
    number: "WU88191009",
    email: "floyd@example.com",
    status: OrderStatus.CANCELLED,
    paymentStatus: PaymentStatus.REFUNDED,
    fulfillmentStatus: FulfillmentStatus.CANCELLED,
    subtotalAmount: "27.00",
    totalAmount: "27.00",
    placedAt: "2021-01-05",
    shippingAddressId: "seed-address-floyd-miles",
    billingAddressId: "seed-address-floyd-miles",
    invoice: { number: "INV-WU88191009", issuedAt: "2021-01-05" },
    items: [
      {
        productSlug: "mini-sketchbook-set",
        productName: "Mini Sketchbook Set",
        unitPrice: "27.00",
        fulfillmentStatus: FulfillmentStatus.CANCELLED,
        imageSrc:
          "https://tailwindcss.com/plus-assets/img/ecommerce-images/order-history-page-06-product-04.jpg",
        imageAlt: "Set of three light and dark brown mini sketch books.",
      },
    ],
  },
  {
    number: "54879",
    email: "floyd@example.com",
    status: OrderStatus.CONFIRMED,
    paymentStatus: PaymentStatus.PAID,
    fulfillmentStatus: FulfillmentStatus.PROCESSING,
    subtotalAmount: "72.00",
    shippingAmount: "5.00",
    taxAmount: "6.16",
    totalAmount: "83.16",
    placedAt: "2021-03-22",
    shippingAddressId: "seed-address-floyd-miles",
    billingAddressId: "seed-address-floyd-miles",
    payment: {
      provider: PaymentProvider.CARD,
      status: PaymentStatus.PAID,
      amount: "83.16",
      brand: "Visa",
      last4: "4242",
      expMonth: 2,
      expYear: 2024,
    },
    invoice: { number: "INV-54879", issuedAt: "2021-03-22" },
    items: [
      {
        productSlug: "nomad-tumbler",
        productName: "Nomad Tumbler",
        unitPrice: "35.00",
        fulfillmentStatus: FulfillmentStatus.PROCESSING,
        imageSrc:
          "https://tailwindcss.com/plus-assets/img/ecommerce-images/confirmation-page-03-product-01.jpg",
        imageAlt: "Insulated bottle with white base and black snap lid.",
      },
      {
        productSlug: "minimalist-wristwatch",
        productName: "Minimalist Wristwatch",
        unitPrice: "149.00",
        fulfillmentStatus: FulfillmentStatus.SHIPPED,
        imageSrc:
          "https://tailwindcss.com/plus-assets/img/ecommerce-images/confirmation-page-03-product-02.jpg",
        imageAlt:
          "Arm modeling wristwatch with black leather band, white watch face, thin watch hands, and fine time markings.",
      },
    ],
  },
  {
    number: "CHECKOUT-STATIC",
    email: "checkout@example.com",
    status: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.PENDING,
    fulfillmentStatus: FulfillmentStatus.NOT_FULFILLED,
    subtotalAmount: money("$210.00"),
    discountAmount: money("$24.00"),
    shippingAmount: money("$22.00"),
    taxAmount: money("$23.68"),
    totalAmount: money("$341.68"),
    discountCode: "CHEAPSKATE",
    placedAt: "2021-03-24",
    items: [
      {
        productSlug: "micro-backpack",
        productName: "Micro Backpack",
        variantName: "Moss / 5L",
        unitPrice: "70.00",
      },
      {
        productSlug: "small-stuff-satchel",
        productName: "Small Stuff Satchel",
        variantName: "Sand / 18L",
        unitPrice: "180.00",
      },
      {
        productSlug: "carry-clutch",
        productName: "Carry Clutch",
        variantName: "White and Black / Small",
        unitPrice: "70.00",
      },
    ],
  },
];

async function seedAdminUser() {
  await prisma.user.upsert({
    where: { id: adminUser.id },
    update: {
      name: adminUser.name,
      email: adminUser.email,
      emailVerified: adminUser.emailVerified,
      role: adminUser.role,
      banned: false,
      banReason: null,
      banExpires: null,
    },
    create: {
      ...adminUser,
      banned: false,
    },
  });
}

async function seedCategories() {
  const categoryIds = new Map<string, string>();

  for (const category of categorySeeds) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
    categoryIds.set(category.slug, record.id);
  }

  return categoryIds;
}

async function seedOptions() {
  const colorIds = new Map<string, string>();
  const sizeIds = new Map<string, string>();

  for (const color of colorSeeds) {
    const record = await prisma.productColor.upsert({
      where: { slug: color.slug },
      update: color,
      create: color,
    });
    colorIds.set(color.slug, record.id);
  }

  for (const size of sizeSeeds) {
    const record = await prisma.productSize.upsert({
      where: { slug: size.slug },
      update: size,
      create: size,
    });
    sizeIds.set(size.slug, record.id);
  }

  return { colorIds, sizeIds };
}

async function seedCollections() {
  const collectionIds = new Map<string, string>();

  for (const collection of collectionSeeds) {
    const record = await prisma.collection.upsert({
      where: { slug: collection.slug },
      update: collection,
      create: collection,
    });
    collectionIds.set(collection.slug, record.id);
  }

  return collectionIds;
}

async function seedProducts({
  categoryIds,
  collectionIds,
  colorIds,
  sizeIds,
}: {
  categoryIds: Map<string, string>;
  collectionIds: Map<string, string>;
  colorIds: Map<string, string>;
  sizeIds: Map<string, string>;
}) {
  const productIds = new Map<string, string>();
  const variantIds = new Map<string, string>();

  for (const product of productSeeds) {
    const record = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        details: product.details ?? [],
        status: ProductStatus.ACTIVE,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        isFeatured: product.isFeatured ?? false,
      },
      create: {
        slug: product.slug,
        name: product.name,
        description: product.description,
        details: product.details ?? [],
        status: ProductStatus.ACTIVE,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        isFeatured: product.isFeatured ?? false,
      },
    });
    productIds.set(product.slug, record.id);

    for (const [sortOrder, image] of product.images.entries()) {
      const id = seedId(product.slug, "image", String(sortOrder));
      await prisma.productImage.upsert({
        where: { id },
        update: {
          productId: record.id,
          imageSrc: image.src,
          imageAlt: image.alt,
          isPrimary: image.primary ?? sortOrder === 0,
          sortOrder,
        },
        create: {
          id,
          productId: record.id,
          imageSrc: image.src,
          imageAlt: image.alt,
          isPrimary: image.primary ?? sortOrder === 0,
          sortOrder,
        },
      });
    }

    for (const categorySlug of product.categories ?? []) {
      const categoryId = categoryIds.get(categorySlug);
      if (!categoryId) continue;

      await prisma.productCategory.upsert({
        where: {
          productId_categoryId: {
            productId: record.id,
            categoryId,
          },
        },
        update: {},
        create: {
          productId: record.id,
          categoryId,
        },
      });
    }

    for (const collectionSlug of product.collections ?? []) {
      const collectionId = collectionIds.get(collectionSlug);
      if (!collectionId) continue;

      await prisma.collectionProduct.upsert({
        where: {
          collectionId_productId: {
            collectionId,
            productId: record.id,
          },
        },
        update: {},
        create: {
          collectionId,
          productId: record.id,
        },
      });
    }

    for (const variant of product.variants ?? []) {
      const sku =
        variant.sku ??
        seedId(
          product.slug,
          variant.color ?? "default",
          variant.size ?? "one-size",
        );
      const variantRecord = await prisma.productVariant.upsert({
        where: { sku },
        update: {
          productId: record.id,
          colorId: variant.color ? colorIds.get(variant.color) : undefined,
          sizeId: variant.size ? sizeIds.get(variant.size) : undefined,
          inventoryQuantity: variant.inventoryQuantity ?? 10,
          leadTime: variant.leadTime,
        },
        create: {
          productId: record.id,
          colorId: variant.color ? colorIds.get(variant.color) : undefined,
          sizeId: variant.size ? sizeIds.get(variant.size) : undefined,
          sku,
          inventoryQuantity: variant.inventoryQuantity ?? 10,
          leadTime: variant.leadTime,
        },
      });
      variantIds.set(sku, variantRecord.id);
    }

    for (const [index, review] of (product.reviews ?? []).entries()) {
      const id = seedId(product.slug, "review", String(index));
      await prisma.productReview.upsert({
        where: { id },
        update: {
          productId: record.id,
          authorName: review.authorName,
          title: review.title,
          content: review.content,
          rating: review.rating,
          publishedAt: new Date(review.publishedAt),
        },
        create: {
          id,
          productId: record.id,
          authorName: review.authorName,
          title: review.title,
          content: review.content,
          rating: review.rating,
          publishedAt: new Date(review.publishedAt),
        },
      });
    }
  }

  for (const [sortOrder, recommendation] of recommendationSeeds.entries()) {
    const productId = productIds.get(recommendation.productSlug);
    const recommendedProductId = productIds.get(
      recommendation.recommendedProductSlug,
    );
    if (!productId || !recommendedProductId) continue;

    await prisma.productRecommendation.upsert({
      where: {
        productId_recommendedProductId: {
          productId,
          recommendedProductId,
        },
      },
      update: { sortOrder },
      create: {
        productId,
        recommendedProductId,
        sortOrder,
      },
    });
  }

  return { productIds, variantIds };
}

async function seedDiscounts() {
  for (const discount of discountSeeds) {
    await prisma.discountCode.upsert({
      where: { code: discount.code },
      update: discount,
      create: discount,
    });
  }
}

async function seedAddresses() {
  for (const address of addressSeeds) {
    await prisma.address.upsert({
      where: { id: address.id },
      update: address,
      create: address,
    });
  }
}

async function seedCarts({
  productIds,
  variantIds,
}: {
  productIds: Map<string, string>;
  variantIds: Map<string, string>;
}) {
  for (const cart of cartSeeds) {
    await prisma.cart.upsert({
      where: { id: cart.id },
      update: {
        userId: cart.userId,
        sessionId: cart.sessionId,
        status: cart.status,
        currency: "USD",
      },
      create: {
        id: cart.id,
        userId: cart.userId,
        sessionId: cart.sessionId,
        status: cart.status,
        currency: "USD",
      },
    });

    for (const [index, item] of cart.items.entries()) {
      const productId = productIds.get(item.productSlug);
      if (!productId) continue;

      const id = seedId(cart.id, "item", String(index));
      await prisma.cartItem.upsert({
        where: { id },
        update: {
          cartId: cart.id,
          productId,
          variantId: item.variantSku
            ? variantIds.get(item.variantSku)
            : undefined,
          quantity: item.quantity,
          unitPriceSnapshot: item.unitPriceSnapshot,
        },
        create: {
          id,
          cartId: cart.id,
          productId,
          variantId: item.variantSku
            ? variantIds.get(item.variantSku)
            : undefined,
          quantity: item.quantity,
          unitPriceSnapshot: item.unitPriceSnapshot,
        },
      });
    }
  }
}

async function seedOrders({ productIds }: { productIds: Map<string, string> }) {
  for (const order of orderSeeds) {
    const discountCode = order.discountCode
      ? await prisma.discountCode.findUnique({
          where: { code: order.discountCode },
        })
      : null;

    const orderRecord = await prisma.order.upsert({
      where: { number: order.number },
      update: {
        email: order.email,
        status: order.status,
        paymentStatus: order.paymentStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        subtotalAmount: order.subtotalAmount,
        discountAmount: order.discountAmount ?? "0.00",
        shippingAmount: order.shippingAmount ?? "0.00",
        taxAmount: order.taxAmount ?? "0.00",
        totalAmount: order.totalAmount,
        discountCodeId: discountCode?.id,
        shippingAddressId: order.shippingAddressId,
        billingAddressId: order.billingAddressId,
        placedAt: new Date(order.placedAt),
      },
      create: {
        number: order.number,
        email: order.email,
        status: order.status,
        paymentStatus: order.paymentStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        subtotalAmount: order.subtotalAmount,
        discountAmount: order.discountAmount ?? "0.00",
        shippingAmount: order.shippingAmount ?? "0.00",
        taxAmount: order.taxAmount ?? "0.00",
        totalAmount: order.totalAmount,
        discountCodeId: discountCode?.id,
        shippingAddressId: order.shippingAddressId,
        billingAddressId: order.billingAddressId,
        placedAt: new Date(order.placedAt),
      },
    });

    for (const [index, item] of order.items.entries()) {
      const productId = productIds.get(item.productSlug);
      const id = seedId(order.number, "item", String(index));

      await prisma.orderItem.upsert({
        where: { id },
        update: {
          orderId: orderRecord.id,
          productId,
          productName: item.productName,
          variantName: item.variantName,
          unitPrice: item.unitPrice,
          quantity: item.quantity ?? 1,
          fulfillmentStatus:
            item.fulfillmentStatus ?? FulfillmentStatus.NOT_FULFILLED,
          fulfilledAt: item.fulfilledAt ? new Date(item.fulfilledAt) : null,
          imageSrc: item.imageSrc,
          imageAlt: item.imageAlt,
        },
        create: {
          id,
          orderId: orderRecord.id,
          productId,
          productName: item.productName,
          variantName: item.variantName,
          unitPrice: item.unitPrice,
          quantity: item.quantity ?? 1,
          fulfillmentStatus:
            item.fulfillmentStatus ?? FulfillmentStatus.NOT_FULFILLED,
          fulfilledAt: item.fulfilledAt ? new Date(item.fulfilledAt) : null,
          imageSrc: item.imageSrc,
          imageAlt: item.imageAlt,
        },
      });
    }

    if (order.payment) {
      await prisma.payment.upsert({
        where: { orderId: orderRecord.id },
        update: {
          provider: order.payment.provider,
          status: order.payment.status,
          amount: order.payment.amount,
          currency: "USD",
          brand: order.payment.brand,
          last4: order.payment.last4,
          expMonth: order.payment.expMonth,
          expYear: order.payment.expYear,
        },
        create: {
          orderId: orderRecord.id,
          provider: order.payment.provider,
          status: order.payment.status,
          amount: order.payment.amount,
          currency: "USD",
          brand: order.payment.brand,
          last4: order.payment.last4,
          expMonth: order.payment.expMonth,
          expYear: order.payment.expYear,
        },
      });
    }

    if (order.invoice) {
      await prisma.invoice.upsert({
        where: { number: order.invoice.number },
        update: {
          orderId: orderRecord.id,
          url: order.invoice.url,
          issuedAt: order.invoice.issuedAt
            ? new Date(order.invoice.issuedAt)
            : null,
        },
        create: {
          orderId: orderRecord.id,
          number: order.invoice.number,
          url: order.invoice.url,
          issuedAt: order.invoice.issuedAt
            ? new Date(order.invoice.issuedAt)
            : null,
        },
      });
    }
  }
}

async function main() {
  await seedAdminUser();
  const categoryIds = await seedCategories();
  const { colorIds, sizeIds } = await seedOptions();
  const collectionIds = await seedCollections();
  const { productIds, variantIds } = await seedProducts({
    categoryIds,
    collectionIds,
    colorIds,
    sizeIds,
  });

  await seedDiscounts();
  await seedAddresses();
  await seedCarts({ productIds, variantIds });
  await seedOrders({ productIds });

  console.info("Seeded store catalog, cart, checkout, and order fixtures.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
