// Demo catalogue for testing: 56 products + 22 events across the store's
// categories, with real furniture photos, PKR prices, discounts, weights,
// stock levels (incl. low / out of stock), made-to-order items and ratings.
//
//   npm run seed:demo           insert (replaces any previous demo data)
//   npm run seed:demo -- --clean   remove all demo data
//
// Everything it creates is tagged "demo-seed" so it never touches real items.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(root, ".env.local"), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "")])
);
const DB_URL = process.env.DB_URL || env.DB_URL;
if (!DB_URL) throw new Error("DB_URL missing (frontend-next/.env.local)");

const TAG = "demo-seed";
const img = (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800`;

// Photos checked by eye and grouped by what they actually show.
const PHOTOS = {
  // ordered to match CATALOGUE items (item i uses photo i as its main image)
  Sofas: [1866149, 276583, 3757055, 4352247, 4846097, 1571460, 1918291, 6969824, 1457842, 275484],
  "Coffee Tables": [2995012, 1571468, 1643383, 1743227, 5998138, 1571459],
  "TV Units": [6316065, 1648771, 1669799, 2440471, 1648776],
  Recliners: [3965534, 2079249, 1350789, 3705539, 2762247],
  Bookshelves: [1125130, 3932930],
  Beds: [279746, 2029694, 2062431, 2082087, 6489083, 1034584, 271743],
  Wardrobes: [3932930, 6489083, 1125130, 2029694],
};

// Better default category images (the original seed pointed some categories
// at a shop front, a house and a coffee cup).
const CATEGORY_IMAGES = {
  Sofas: 1866149,
  "Coffee Tables": 2995012,
  "TV Units": 6316065,
  Recliners: 3965534,
  Bookshelves: 1125130,
  Beds: 279746,
  Wardrobes: 3932930,
};

const CATALOGUE = {
  Sofas: [
    ["Milano 3-Seater Velvet Sofa", 89999, 0.18, 45, "Deep-seated velvet sofa with solid sheesham frame and high-resilience foam."],
    ["Oslo L-Shaped Sectional", 159999, 0.15, 70, "Reversible chaise sectional in stain-resistant fabric, seats five."],
    ["Chesterfield Tufted Sofa", 124999, 0, 55, "Classic button-tufted sofa with rolled arms and turned wooden legs."],
    ["Nordic 2-Seater Loveseat", 54999, 0.1, 32, "Compact loveseat with tapered oak legs — perfect for apartments."],
    ["Emerald Lounge Sofa", 98999, 0.2, 48, "Statement green velvet with gold-tipped legs and plush back cushions."],
    ["Cloud Modular Sofa", 189999, 0.12, 85, "Build-your-own modular pieces with feather-blend cushions."],
    ["Leatherette Recliner Sofa", 139999, 0.08, 75, "Three-seater with two manual recliners and cup holders."],
    ["Sofa Cum Bed — Fold Out", 64999, 0.15, 42, "Converts to a double bed in seconds; storage under the seat."],
  ],
  "Coffee Tables": [
    ["Marble Top Round Coffee Table", 34999, 0.1, 22, "Genuine marble top on a powder-coated steel base."],
    ["Walnut Lift-Top Coffee Table", 27999, 0, 24, "Top lifts to working height and hides storage inside."],
    ["Glass Nesting Tables (Set of 2)", 18999, 0.15, 12, "Tempered glass and brass-finish frames that tuck together."],
    ["Industrial Pallet Coffee Table", 15999, 0.05, 18, "Reclaimed-look wood with lower shelf and caster wheels."],
    ["Oval Sheesham Coffee Table", 22999, 0.12, 20, "Hand-finished solid sheesham with a natural oil polish."],
    ["Minimal Square Side Table", 7999, 0, 6, "Slim side table in matte black — fits beside any sofa."],
    ["Rattan Drum Coffee Table", 19999, 0.1, 9, "Handwoven rattan with a glass top insert."],
    ["Stone Effect Plinth Table", 29999, 0.2, 35, "Sculptural plinth in lightweight stone-effect composite."],
  ],
  "TV Units": [
    ["Floating Wall TV Console 72\"", 32999, 0.1, 28, "Wall-mounted unit with push-open drawers and cable management."],
    ["Fireplace Media Wall", 149999, 0.1, 120, "Complete media wall with built-in electric fireplace and shelving."],
    ["Scandi TV Cabinet with Legs", 24999, 0.15, 30, "Fluted sliding doors and solid wood legs."],
    ["Corner TV Stand", 15999, 0, 18, "Space-saving corner unit for screens up to 55\"."],
    ["Industrial TV Bench", 21999, 0.05, 26, "Metal frame with open shelves for consoles and speakers."],
    ["High-Gloss White TV Unit", 27999, 0.12, 32, "High-gloss finish with LED strip lighting."],
    ["Rustic Barn-Door TV Console", 36999, 0.1, 40, "Sliding barn doors and solid pine construction."],
    ["Compact TV Table", 9999, 0, 10, "Two-tier table for bedrooms and small lounges."],
  ],
  Recliners: [
    ["Power Recliner with USB", 79999, 0.1, 42, "One-touch power recline, USB charging port and lumbar support."],
    ["Swivel Rocker Recliner", 59999, 0.15, 38, "360° swivel and gentle rocking in soft-touch fabric."],
    ["Wingback Accent Chair", 34999, 0.05, 20, "Classic wingback silhouette in boucle fabric."],
    ["Rattan Peacock Chair", 29999, 0, 14, "Statement handwoven chair with seat cushion."],
    ["Lounge Chair & Ottoman", 89999, 0.2, 30, "Mid-century inspired lounger in bonded leather."],
    ["Massage Recliner Pro", 249999, 0.1, 75, "Full-body massage, heat therapy and zero-gravity mode."],
    ["Kids Mini Recliner", 14999, 0.1, 9, "Pint-sized recliner with cup holder for little ones."],
    ["Glider Nursery Chair", 39999, 0.12, 25, "Smooth glide motion with padded arms."],
  ],
  Bookshelves: [
    ["Ladder Bookshelf 5-Tier", 17999, 0.1, 16, "Leaning ladder design in walnut finish."],
    ["Cube Storage Organizer 9", 14999, 0.05, 18, "Nine cubes for books, baskets and display."],
    ["Industrial Pipe Bookcase", 24999, 0.15, 30, "Black pipe frame with thick wooden shelves."],
    ["Corner Bookshelf", 12999, 0, 12, "Five tiers that fit neatly into any corner."],
    ["Glass Door Library Cabinet", 54999, 0.1, 55, "Solid wood cabinet with glass doors and adjustable shelves."],
    ["Floating Wall Shelves (Set of 3)", 5999, 0.2, 4, "Invisible-bracket shelves in three lengths."],
    ["Kids Book Display Rack", 8999, 0, 7, "Front-facing slings so covers are easy to see."],
    ["Bookshelf with Study Desk", 34999, 0.1, 38, "Combined bookcase and fold-down desk."],
  ],
  Beds: [
    ["King Size Upholstered Bed", 119999, 0.12, 80, "Tall padded headboard with hydraulic storage underneath."],
    ["Sheesham Queen Bed", 94999, 0.1, 75, "Solid sheesham wood with carved headboard."],
    ["Platform Bed with Drawers", 79999, 0.15, 70, "Low platform with four deep drawers."],
    ["Metal Single Bed", 24999, 0, 25, "Sturdy powder-coated frame — great for guest rooms."],
    ["Bunk Bed with Stairs", 69999, 0.1, 65, "Storage staircase and safety rails for kids' rooms."],
    ["Japanese Floor Bed", 54999, 0.2, 45, "Minimal low-profile frame in natural oak."],
    ["Canopy Bed Frame", 89999, 0.05, 60, "Four-poster canopy frame in matte black steel."],
    ["Orthopedic Mattress 6\"", 39999, 0.18, 22, "Medium-firm orthopedic support with breathable cover."],
  ],
  Wardrobes: [
    ["3-Door Sliding Wardrobe", 89999, 0.1, 95, "Mirror panel, hanging rail and six shelves."],
    ["2-Door Wardrobe with Mirror", 54999, 0.15, 70, "Full-length mirror and two internal drawers."],
    ["Walk-In Closet System", 179999, 0.08, 120, "Modular open closet system — build it to your room."],
    ["Kids Wardrobe Pastel", 34999, 0, 45, "Rounded edges and soft-close doors in pastel tones."],
    ["Open Clothes Rack", 9999, 0.1, 9, "Industrial rail with bottom shoe shelf."],
    ["Corner Wardrobe", 64999, 0.05, 80, "Clever L-shape to use every inch of the room."],
    ["Shoe Cabinet 4-Tier", 16999, 0.2, 18, "Flip-down compartments for up to 24 pairs."],
    ["Chest of Drawers 6", 32999, 0.1, 40, "Six deep drawers with metal runners."],
  ],
};

// [category, index of the catalogue item it promotes, event title, discount]
const EVENT_LINES = [
  ["Sofas", 0, "Mega Sofa Week — Milano Velvet", 0.35],
  ["Sofas", 3, "Flash Deal: Nordic Loveseat", 0.3],
  ["Sofas", 4, "Weekend Sale: Emerald Lounge", 0.4],
  ["Sofas", 7, "Clearance: Sofa Cum Bed", 0.45],
  ["Sofas", 5, "11.11 Home Festival — Cloud Modular", 0.3],
  ["Coffee Tables", 0, "Marble Madness Sale", 0.3],
  ["Coffee Tables", 2, "Nesting Tables Bundle Deal", 0.35],
  ["Coffee Tables", 6, "Rattan Collection Launch Offer", 0.25],
  ["TV Units", 1, "Big Screen Season: Media Wall", 0.3],
  ["TV Units", 2, "Scandi TV Cabinet Flash Sale", 0.35],
  ["TV Units", 4, "Gaming Setup Week: Industrial Bench", 0.25],
  ["Recliners", 0, "Relax Week: Power Recliner", 0.3],
  ["Recliners", 5, "Massage Recliner Pro — Launch Price", 0.2],
  ["Recliners", 2, "Accent Chair Festival: Wingback", 0.4],
  ["Bookshelves", 0, "Back to Books: Ladder Shelf", 0.3],
  ["Bookshelves", 7, "Study Corner Combo", 0.35],
  ["Beds", 0, "Sleep Better Sale: King Bed", 0.25],
  ["Beds", 7, "Mattress Mega Deal", 0.4],
  ["Beds", 4, "Kids Room Bunk Bed Offer", 0.3],
  ["Wardrobes", 0, "Wardrobe Makeover Week", 0.3],
  ["Wardrobes", 6, "Shoe Cabinet Flash Sale", 0.45],
  ["Wardrobes", 2, "Walk-In Closet Launch Deal", 0.2],
];

const round = (n) => Math.round(n / 50) * 50;
const pick = (arr, i) => arr[i % arr.length];
const daysFromNow = (d) => new Date(Date.now() + d * 86400000);

async function main() {
  await mongoose.connect(DB_URL);
  const db = mongoose.connection;
  const Products = db.collection("products");
  const Events = db.collection("events");
  const Shops = db.collection("shops");
  const Categories = db.collection("categories");

  const removed = await Promise.all([Products.deleteMany({ tags: TAG }), Events.deleteMany({ tags: TAG })]);
  console.log(`Removed previous demo data: ${removed[0].deletedCount} products, ${removed[1].deletedCount} events`);

  if (process.argv.includes("--clean")) {
    await mongoose.disconnect();
    return;
  }

  const shop = await Shops.findOne({});
  if (!shop) throw new Error("No store found — run the store seed first (backend: npm run seed:store)");
  const shopId = String(shop._id);

  // Ensure every category used exists (keeps the storefront filters working).
  const existing = new Set((await Categories.find({}).toArray()).map((c) => c.name));
  let order = existing.size;
  for (const name of Object.keys(CATALOGUE)) {
    if (!existing.has(name)) {
      await Categories.insertOne({ name, subTitle: "", image: img(CATEGORY_IMAGES[name] || pick(PHOTOS[name], 0)), order: order++, createdAt: new Date() });
      console.log(`Added category ${name}`);
    }
  }
  // Fix category images that still point at the old mismatched seed photos.
  const BAD = { "Coffee Tables": "894612", Bookshelves: "2047397", Wardrobes: "3935333", "TV Units": "6969824" };
  for (const [name, badId] of Object.entries(BAD)) {
    const r = await Categories.updateOne(
      { name, image: { $regex: `/photos/${badId}/` } },
      { $set: { image: img(CATEGORY_IMAGES[name]) } }
    );
    if (r.modifiedCount) console.log(`Fixed image for category ${name}`);
  }

  const products = [];
  let n = 0;
  for (const [category, items] of Object.entries(CATALOGUE)) {
    items.forEach(([name, price, off, weightKg, description], i) => {
      n++;
      const photos = PHOTOS[category];
      const madeToOrder = n % 9 === 0;
      // a realistic spread of stock: mostly healthy, some low, a couple sold out
      const stock = madeToOrder ? 0 : n % 13 === 0 ? 0 : n % 5 === 0 ? 3 : 8 + ((n * 7) % 40);
      const discountPrice = round(price * (1 - off));
      products.push({
        name,
        description: `${description}\n\nCategory: ${category}. Delivered across Pakistan with tracking. ${
          madeToOrder ? "Made to order — crafted after you order." : "Ships from stock."
        }`,
        category,
        tags: TAG,
        originalPrice: off > 0 ? price : undefined,
        discountPrice,
        stock,
        fulfillment: madeToOrder ? "made_to_order" : "in_stock",
        leadTimeDays: madeToOrder ? 7 + (n % 3) * 3 : 0,
        weightKg,
        images: [img(pick(photos, i)), img(pick(photos, i + 1))],
        reviews: [],
        ratings: n % 4 === 0 ? 0 : Number((3.6 + ((n * 37) % 14) / 10).toFixed(1)),
        shopId,
        shop,
        sold_out: (n * 17) % 120,
        paymentOverride: { enabled: false },
        createdAt: new Date(Date.now() - n * 3600000),
        __v: 0,
      });
    });
  }
  await Products.insertMany(products);
  console.log(`Inserted ${products.length} demo products`);

  const events = EVENT_LINES.map(([category, item, name, off], i) => {
    const base = CATALOGUE[category][item];
    const price = base[1];
    const photos = PHOTOS[category];
    return {
      name,
      description: `${base[4]}\n\nLimited-time event price — ends when the timer runs out or stock is gone.`,
      category,
      start_Date: daysFromNow(-(i % 5) - 1),
      Finish_Date: daysFromNow(2 + ((i * 3) % 28)), // ending between 2 and 29 days from now
      status: "Running",
      tags: TAG,
      originalPrice: price,
      discountPrice: round(price * (1 - off)),
      stock: 5 + ((i * 11) % 30),
      // same photos as the product it promotes
      images: [img(pick(photos, item)), img(pick(photos, item + 1))],
      reviews: [],
      ratings: 0,
      shopId,
      shop,
      sold_out: (i * 9) % 50,
      createdAt: new Date(Date.now() - i * 1800000),
      __v: 0,
    };
  });
  await Events.insertMany(events);
  console.log(`Inserted ${events.length} demo events`);

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
