// One-time, idempotent store setup for a fresh database (safe to re-run).
//
//   npm run seed:store
//
//  1. Normalises user roles to customer / business_owner.
//  2. Ensures exactly one Shop (store-config) document, with default
//     storefront content (hero, feature tiles) if it has none.
//  3. Ensures ONE business_owner user — the only admin login.
//  4. Seeds default categories if there are none.
//
// Reads frontend-next/.env.local (or the real environment):
//   required  DB_URL, STORE_EMAIL, STORE_PASSWORD
//   optional  STORE_NAME, STORE_PHONE, STORE_ADDRESS, STORE_ZIPCODE
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const envFile = path.join(root, ".env.local");
const fileEnv = fs.existsSync(envFile)
  ? Object.fromEntries(
      fs
        .readFileSync(envFile, "utf8")
        .split(/\r?\n/)
        .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
        .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "")])
    )
  : {};
const env = (name) => process.env[name] || fileEnv[name] || "";
const required = (name) => {
  const v = env(name);
  if (!v) throw new Error(`Missing ${name} — set it in frontend-next/.env.local (see .env.example).`);
  return v;
};

const DB_URL = required("DB_URL");
const STORE_EMAIL = required("STORE_EMAIL").toLowerCase();
const STORE_PASSWORD = required("STORE_PASSWORD");
const STORE_NAME = env("STORE_NAME") || "Shop";
const STORE_PHONE = env("STORE_PHONE").replace(/\D/g, "");
const STORE_ADDRESS = env("STORE_ADDRESS");
const STORE_ZIPCODE = env("STORE_ZIPCODE").replace(/\D/g, "");

if (STORE_PASSWORD.length < 6) throw new Error("STORE_PASSWORD must be at least 6 characters.");

const img = (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=500`;

const DEFAULT_TILES = [
  { title: "Free Shipping", description: "On orders over Rs. 5,000", icon: "truck" },
  { title: "Daily Surprise Offers", description: "Save up to 25% off", icon: "gift" },
  { title: "Affordable Prices", description: "Get factory direct price", icon: "tag" },
  { title: "Secure Payments", description: "100% protected payments", icon: "shield" },
];

const DEFAULT_CATEGORIES = [
  { name: "Sofas", subTitle: "Comfortable Seating", image: img(1866149) },
  { name: "Coffee Tables", subTitle: "Center Pieces", image: img(2995012) },
  { name: "TV Units", subTitle: "Entertainment Units", image: img(6316065) },
  { name: "Recliners", subTitle: "Relaxation Chairs", image: img(3965534) },
  { name: "Bookshelves", subTitle: "Library Storage", image: img(1125130) },
  { name: "Beds", subTitle: "Sleeping Comfort", image: img(279746) },
  { name: "Wardrobes", subTitle: "Closet Storage", image: img(3932930) },
];

await mongoose.connect(DB_URL);
const db = mongoose.connection.db;
const users = db.collection("users");
const shops = db.collection("shops");
const categories = db.collection("categories");
console.log("DB connected");

// 1. roles ------------------------------------------------------------------
const toCustomer = await users.updateMany(
  { role: { $in: ["user", "User", "seller", "Seller", null] } },
  { $set: { role: "customer" } }
);
console.log(`Roles normalised -> customer: ${toCustomer.modifiedCount}`);

// 2. single shop + storefront ---------------------------------------------------
let shop = await shops.find().sort({ createdAt: 1 }).limit(1).next();
if (!shop) {
  const doc = {
    name: STORE_NAME,
    email: STORE_EMAIL,
    address: STORE_ADDRESS,
    phoneNumber: STORE_PHONE,
    zipCode: STORE_ZIPCODE,
    avatar: "",
    description: "Welcome to our store.",
    createdAt: new Date(),
  };
  const { insertedId } = await shops.insertOne(doc);
  shop = { ...doc, _id: insertedId };
  console.log(`Shop created: ${shop.name} (${shop._id})`);
} else {
  console.log(`Shop exists: ${shop.name} (${shop._id})`);
}

const extra = await shops.deleteMany({ _id: { $ne: shop._id } });
if (extra.deletedCount > 0) console.log(`Removed ${extra.deletedCount} extra shop doc(s)`);

const storefront = shop.storefront || {};
const setStorefront = {};
if (!storefront.hero?.title) {
  setStorefront["storefront.hero"] = {
    title: "Best Collection for Home Decoration",
    subtitle: "Discover modern furniture and decoration items at best prices.",
    ctaText: "Shop Now",
    ctaLink: "/products",
    image: "",
  };
}
if (!storefront.featureTiles?.length) setStorefront["storefront.featureTiles"] = DEFAULT_TILES;
if (Object.keys(setStorefront).length) await shops.updateOne({ _id: shop._id }, { $set: setStorefront });
console.log("Storefront content ensured");

// 3. one business_owner -----------------------------------------------------------
await users.updateMany({ role: "Admin" }, { $set: { role: "business_owner", shop: shop._id } });

let owner = await users.findOne({ email: STORE_EMAIL });
if (!owner) {
  const { insertedId } = await users.insertOne({
    name: STORE_NAME,
    email: STORE_EMAIL,
    password: await bcrypt.hash(STORE_PASSWORD, 10),
    passwordSet: true,
    isVerified: true,
    phoneNumber: STORE_PHONE,
    avatar: "",
    role: "business_owner",
    shop: shop._id,
    addresses: [],
    createdAt: new Date(),
  });
  owner = { _id: insertedId };
  console.log(`Owner created: ${STORE_EMAIL}`);
} else {
  await users.updateOne({ _id: owner._id }, { $set: { role: "business_owner", shop: shop._id } });
  console.log(`Owner linked: ${STORE_EMAIL} (password unchanged)`);
}

await users.updateMany(
  { role: "business_owner", _id: { $ne: owner._id } },
  { $set: { role: "customer" }, $unset: { shop: "" } }
);

// 4. categories ---------------------------------------------------------------------
const catCount = await categories.countDocuments();
if (catCount === 0) {
  await categories.insertMany(DEFAULT_CATEGORIES.map((c, i) => ({ ...c, order: i, createdAt: new Date() })));
  console.log(`Seeded ${DEFAULT_CATEGORIES.length} categories`);
} else {
  console.log(`Categories exist: ${catCount}`);
}

console.log(`\nDone. Sign in at /login as ${STORE_EMAIL}`);
await mongoose.disconnect();
