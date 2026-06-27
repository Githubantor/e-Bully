require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const connectDB = require('./config/db');
const { getMasterModels } = require('./config/db');

async function addBikeCategory() {
  try {
    await connectDB();
    const { Category } = getMasterModels();
    console.log('Connected to MongoDB');

    const existing = await Category.findOne({ slug: 'bikes' });
    if (existing) {
      console.log('Bikes category already exists, skipping.');
    } else {
      const bikeCat = await Category.create({
        name: 'Bikes',
        slug: 'bikes',
        description: 'Motorcycles, scooters, bicycles, and related gear',
        order: 11,
      });
      console.log('Created main category: Bikes');

      const subs = [
        { name: 'Motorcycles', slug: 'motorcycles', parent: bikeCat._id, order: 1 },
        { name: 'Scooters', slug: 'scooters', parent: bikeCat._id, order: 2 },
        { name: 'Bicycles', slug: 'bicycles', parent: bikeCat._id, order: 3 },
      ];
      const createdSubs = await Category.insertMany(subs);
      console.log(`Created ${createdSubs.length} subcategories under Bikes`);
    }

    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Failed:', error);
    process.exit(1);
  }
}

addBikeCategory();
