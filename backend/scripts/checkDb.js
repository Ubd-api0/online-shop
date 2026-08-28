/**
 * Diagnose the MongoDB connection.
 *
 *   npm run db:check        (from backend/)
 *
 * Tells you whether the failure is DNS, network, auth, or IP allow-list.
 */
const dns = require('dns');
const { promisify } = require('util');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const resolveSrv = promisify(dns.resolveSrv);
const lookup = promisify(dns.lookup);

const uri = process.env.DB_URL;

(async () => {
  if (!uri) {
    console.error('❌ DB_URL is not set in backend/.env');
    process.exit(1);
  }
  console.log(`DB_URL: ${uri.replace(/\/\/([^:]+):[^@]+@/, '//$1:****@')}\n`);

  const isSrv = uri.startsWith('mongodb+srv://');
  const host = uri.replace(/^mongodb(\+srv)?:\/\/[^@]*@?/, '').split(/[/?]/)[0].split(',')[0].split(':')[0];

  // 1. DNS
  if (isSrv) {
    console.log(`1. Resolving SRV record for _mongodb._tcp.${host} ...`);
    try {
      const records = await resolveSrv(`_mongodb._tcp.${host}`);
      console.log(`   ✅ ${records.length} node(s): ${records.map((r) => r.name).join(', ')}\n`);
    } catch (e) {
      console.log(`   ❌ ${e.code} — the SRV hostname does not resolve.`);
      console.log('   Likely causes:');
      console.log('     • the Atlas cluster was deleted / paused / renamed');
      console.log('     • your network/DNS blocks SRV lookups (corporate wifi, some VPNs)');
      console.log('   Fixes:');
      console.log('     • confirm the cluster exists & is running in the Atlas dashboard,');
      console.log('       then copy a FRESH connection string');
      console.log('     • or use the non-SRV string (Atlas → Connect → Drivers →');
      console.log('       "older driver"): mongodb://host1,host2,host3/db?ssl=true&replicaSet=...&authSource=admin');
      console.log('     • or run a local MongoDB and set DB_URL=mongodb://127.0.0.1:27017/shop_db\n');
    }
  } else {
    console.log(`1. Resolving host ${host} ...`);
    try {
      const { address } = await lookup(host);
      console.log(`   ✅ ${address}\n`);
    } catch (e) {
      console.log(`   ❌ ${e.code} — host does not resolve.\n`);
    }
  }

  // 2. Actual connection
  console.log('2. Connecting with mongoose (10s timeout) ...');
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    const admin = mongoose.connection.db.admin();
    await admin.ping();
    console.log(`   ✅ connected to "${mongoose.connection.name}" on ${mongoose.connection.host}`);
    await mongoose.disconnect();
    console.log('\nAll good. The app should be able to connect.');
  } catch (e) {
    console.log(`   ❌ ${e.message}`);
    if (/authentication failed|bad auth/i.test(e.message)) {
      console.log('   → wrong username/password in DB_URL.');
    } else if (/IP that isn.t whitelisted|not authorized|ECONNREFUSED|timed out/i.test(e.message)) {
      console.log('   → add your IP (or 0.0.0.0/0) under Atlas → Network Access,');
      console.log('     and make sure the cluster is not paused.');
    }
    process.exit(1);
  }
})();
