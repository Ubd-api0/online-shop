/**
 * One-time / idempotent single-vendor setup.
 *
 *   npm run seed:store        (from backend/)
 *
 * What it does:
 *  1. Normalises user roles to customer / business_owner.
 *  2. Ensures exactly one Shop (store-config) document.
 *  3. Ensures ONE business_owner User — the only admin/owner login.
 *  4. Seeds default categories + storefront content (hero, feature tiles)
 *     if none exist yet.
 *
 * Override via backend/.env (all optional):
 *   STORE_NAME, STORE_EMAIL, STORE_PASSWORD, STORE_PHONE, STORE_ADDRESS, STORE_ZIPCODE
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Shop = require('../model/shop');
const User = require('../model/user');
const Category = require('../model/category');

const {
  STORE_NAME = 'Shop',
  STORE_EMAIL = 'admin@shop.com',
  STORE_PASSWORD = 'Password@123',
  STORE_PHONE = '3000000000',
  STORE_ADDRESS = 'Store address',
  STORE_ZIPCODE = '00000',
} = process.env;

const PLACEHOLDER_AVATAR =
  'https://res.cloudinary.com/demo/image/upload/v1/samples/people/boy-snow-hoodie.jpg';

const DEFAULT_TILES = [
  { title: 'Free Shipping', description: 'From all orders over 100$', icon: 'truck' },
  { title: 'Daily Surprise Offers', description: 'Save up to 25% off', icon: 'gift' },
  { title: 'Affordable Prices', description: 'Get factory direct price', icon: 'tag' },
  { title: 'Secure Payments', description: '100% protected payments', icon: 'shield' },
];

const DEFAULT_CATEGORIES = [
  { name: 'Sofas', subTitle: 'Comfortable Seating', image: 'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg?auto=compress&cs=tinysrgb&w=500' },
  { name: 'Coffee Tables', subTitle: 'Center Pieces', image: 'https://images.pexels.com/photos/894612/pexels-photo-894612.jpeg?auto=compress&cs=tinysrgb&w=500' },
  { name: 'TV Units', subTitle: 'Entertainment Units', image: 'https://images.pexels.com/photos/6969824/pexels-photo-6969824.jpeg?auto=compress&cs=tinysrgb&w=500' },
  { name: 'Recliners', subTitle: 'Relaxation Chairs', image: 'https://images.pexels.com/photos/3757055/pexels-photo-3757055.jpeg?auto=compress&cs=tinysrgb&w=500' },
  { name: 'Bookshelves', subTitle: 'Library Storage', image: 'https://images.pexels.com/photos/2047397/pexels-photo-2047397.jpeg?auto=compress&cs=tinysrgb&w=500' },
  { name: 'Beds', subTitle: 'Sleeping Comfort', image: 'https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg?auto=compress&cs=tinysrgb&w=500' },
  { name: 'Wardrobes', subTitle: 'Closet Storage', image: 'https://images.pexels.com/photos/3935333/pexels-photo-3935333.jpeg?auto=compress&cs=tinysrgb&w=500' },
];

async function run() {
  if (!process.env.DB_URL) throw new Error('DB_URL missing in backend/.env');
  await mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('DB connected');

  // 1. role migration ------------------------------------------------------
  const toCustomer = await User.updateMany(
    { role: { $in: ['user', 'User', 'seller', 'Seller', null] } },
    { $set: { role: 'customer' } }
  );
  console.log(`Roles normalised -> customer: ${toCustomer.modifiedCount ?? toCustomer.nModified ?? 0}`);

  // 2. ensure single shop -------------------------------------------------------
  let shop = await Shop.findOne().sort({ createdAt: 1 });
  if (!shop) {
    shop = await Shop.create({
      name: STORE_NAME,
      email: STORE_EMAIL,
      address: STORE_ADDRESS,
      phoneNumber: Number(String(STORE_PHONE).replace(/\D/g, '')) || 3000000000,
      zipCode: Number(String(STORE_ZIPCODE).replace(/\D/g, '')) || 0,
      avatar: PLACEHOLDER_AVATAR,
      description: 'Welcome to our store.',
    });
    console.log(`Shop created: ${shop.name} (${shop._id})`);
  } else {
    console.log(`Shop exists: ${shop.name} (${shop._id})`);
  }

  const extra = await Shop.deleteMany({ _id: { $ne: shop._id } });
  if ((extra.deletedCount ?? 0) > 0) console.log(`Removed ${extra.deletedCount} extra shop doc(s)`);

  // seed storefront content if empty
  shop.storefront = shop.storefront || {};
  if (!shop.storefront.hero || !shop.storefront.hero.title) {
    shop.storefront.hero = {
      title: 'Best Collection for Home Decoration',
      subtitle: 'Discover modern furniture and decoration items at best prices.',
      ctaText: 'Shop Now',
      ctaLink: '/products',
      image: '',
    };
  }
  if (!shop.storefront.featureTiles || shop.storefront.featureTiles.length === 0) {
    shop.storefront.featureTiles = DEFAULT_TILES;
  }
  shop.markModified('storefront');
  await shop.save();
  console.log('Storefront content ensured');

  // 3. ensure ONE business_owner user --------------------------------------
  await User.updateMany(
    { role: 'Admin' },
    { $set: { role: 'business_owner', shop: shop._id } }
  );

  const email = STORE_EMAIL.toLowerCase();
  let owner = await User.findOne({ email });
  if (!owner) {
    owner = await User.create({
      name: STORE_NAME,
      email,
      password: STORE_PASSWORD,
      phoneNumber: shop.phoneNumber,
      avatar: shop.avatar,
      role: 'business_owner',
      shop: shop._id,
    });
    console.log(`Owner created: ${email} / ${STORE_PASSWORD}`);
  } else {
    owner.role = 'business_owner';
    owner.shop = shop._id;
    await owner.save();
    console.log(`Owner linked: ${email}`);
  }

  // demote any other business_owner
  await User.updateMany(
    { role: 'business_owner', _id: { $ne: owner._id } },
    { $set: { role: 'customer' }, $unset: { shop: '' } }
  );

  // 4. seed categories ----------------------------------------------------------
  const catCount = await Category.countDocuments();
  if (catCount === 0) {
    await Category.insertMany(
      DEFAULT_CATEGORIES.map((c, i) => ({ ...c, order: i }))
    );
    console.log(`Seeded ${DEFAULT_CATEGORIES.length} categories`);
  } else {
    console.log(`Categories exist: ${catCount}`);
  }

  console.log(`\nDone. Sign in at /login as ${email}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
