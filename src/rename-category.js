require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const connectDB = require('./config/db');
const { getMasterModels } = require('./config/db');

async function rename() {
  await connectDB();
  const { Category } = getMasterModels();

  const old = await Category.findOne({ slug: 'mens-clothing' });
  if (old) {
    old.name = 'Fashion';
    old.slug = 'fashion';
    await old.save();
    console.log(`Renamed to "${old.name}" (slug: ${old.slug})`);
  } else {
    console.log('Category "mens-clothing" not found');
  }

  const womens = await Category.findOne({ slug: 'womens-clothing' });
  if (womens) {
    womens.parent = null;
    womens.order = 3;
    await womens.save();
    console.log('Women\'s Clothing is now a top-level category');
  }

  const shoes = await Category.findOne({ slug: 'shoes' });
  if (shoes) {
    shoes.parent = null;
    shoes.order = 4;
    await shoes.save();
    console.log('Shoes is now a top-level category');
  }

  process.exit(0);
}

rename().catch(e => { console.error(e); process.exit(1); });
