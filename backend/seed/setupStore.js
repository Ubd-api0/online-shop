/**
 * One-time / idempotent single-vendor setup.
 *
 *   node seed/setupStore.js
 *
 * What it does:
 *  1. Migrates existing user roles to the new scheme (customer / business_owner).
 *  2. Ensures exactly one Shop document exists (creates it from env vars if missing).
 *  3. Ensures a linked business_owner User exists for that Shop.
 *
 * Configure via backend/.env (all optional — sensible defaults are used):
 *   STORE_NAME, STORE_EMAIL, STORE_PASSWORD, STORE_PHONE, STORE_ADDRESS, STORE_ZIPCODE
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Shop = require('../model/shop');
const User = require('../model/user');

const {
  STORE_NAME = 'My Store',
  STORE_EMAIL = 'owner@store.test',
  STORE_PASSWORD = 'owner1234',
  STORE_PHONE = '3000000000',
  STORE_ADDRESS = 'Store address',
  STORE_ZIPCODE = '00000',
} = process.env;

const PLACEHOLDER_AVATAR =
  'https://res.cloudinary.com/demo/image/upload/v1/samples/people/boy-snow-hoodie.jpg';

async function run() {
  if (!process.env.DB_URL) throw new Error('DB_URL missing in backend/.env');
  await mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('DB connected');

  // 1. role migration -------------------------------------------------------
  const toCustomer = await User.updateMany(
    { role: { $in: ['user', 'User', null, undefined] } },
    { $set: { role: 'customer' } }
  );
  console.log(`Customers normalised: ${toCustomer.modifiedCount ?? toCustomer.nModified ?? 0}`);

  // 2. ensure single shop -------------------------------------------------------
  let shop = await Shop.findOne().sort({ createdAt: 1 });
  if (!shop) {
    shop = await Shop.create({
      name: STORE_NAME,
      email: STORE_EMAIL,
      password: STORE_PASSWORD,
      address: STORE_ADDRESS,
      phoneNumber: Number(String(STORE_PHONE).replace(/\D/g, '')) || 3000000000,
      zipCode: Number(String(STORE_ZIPCODE).replace(/\D/g, '')) || 0,
      avatar: PLACEHOLDER_AVATAR,
      description: 'Welcome to our store.',
    });
    console.log(`Shop created: ${shop.name} (${shop._id})`);
  } else {
    console.log(`Shop already exists: ${shop.name} (${shop._id})`);
  }

  // drop any extra shops (single-vendor invariant)
  const extra = await Shop.deleteMany({ _id: { $ne: shop._id } });
  if ((extra.deletedCount ?? 0) > 0) {
    console.log(`Removed ${extra.deletedCount} extra shop document(s)`);
  }

  // 3. ensure linked business_owner user -------------------------------------
  // Promote any legacy Admin accounts, then guarantee the store-email owner.
  await User.updateMany(
    { role: 'Admin' },
    { $set: { role: 'business_owner', shop: shop._id } }
  );

  let owner = await User.findOne({ email: shop.email });
  if (!owner) {
    owner = await User.create({
      name: shop.name,
      email: shop.email,
      password: STORE_PASSWORD,
      phoneNumber: shop.phoneNumber,
      avatar: shop.avatar,
      role: 'business_owner',
      shop: shop._id,
    });
    console.log(`Owner user created: ${owner.email} (password: ${STORE_PASSWORD})`);
  } else {
    owner.role = 'business_owner';
    owner.shop = shop._id;
    await owner.save();
    console.log(`Owner user linked: ${owner.email}`);
  }

  // any other business_owner not pointing at this shop -> fix the link
  await User.updateMany(
    { role: 'business_owner', _id: { $ne: owner._id } },
    { $set: { role: 'customer' }, $unset: { shop: '' } }
  );

  console.log('\nDone. Sign in at /login with the owner email above.');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
