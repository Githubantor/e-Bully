require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const connectDB = require('./config/db');
const { getMasterModels, slugify } = require('./config/db');

const categories = [
  { name: 'Electronics', slug: 'electronics', description: 'Gadgets, devices, and tech accessories', order: 1 },
  { name: 'Clothing', slug: 'clothing', description: 'Apparel, fashion, and wearables', order: 2 },
  { name: 'Home & Garden', slug: 'home-garden', description: 'Furniture, decor, and outdoor', order: 3 },
  { name: 'Sports & Outdoors', slug: 'sports-outdoors', description: 'Sports equipment and outdoor gear', order: 4 },
  { name: 'Books & Media', slug: 'books-media', description: 'Books, music, and movies', order: 5 },
  { name: 'Health & Beauty', slug: 'health-beauty', description: 'Skincare, makeup, and wellness', order: 6 },
  { name: 'Toys & Games', slug: 'toys-games', description: 'Toys, board games, and puzzles', order: 7 },
  { name: 'Automotive', slug: 'automotive', description: 'Car parts, accessories, and tools', order: 8 },
  { name: 'Food & Groceries', slug: 'food-groceries', description: 'Groceries, snacks, and beverages', order: 9 },
  { name: 'Jewelry & Accessories', slug: 'jewelry-accessories', description: 'Watches, jewelry, and fashion accessories', order: 10 },
  { name: 'Car', slug: 'car', description: 'Sedans, SUVs, hatchbacks, luxury cars, and electric vehicles', order: 11 },
  { name: 'Truck', slug: 'truck', description: 'Pickup trucks, heavy trucks, delivery trucks, and commercial vehicles', order: 12 },
  { name: 'Bus', slug: 'bus', description: 'City buses, school buses, coach buses, and minibuses', order: 13 },
  { name: 'Tractor', slug: 'tractor', description: 'Farm tractors, garden tractors, and industrial tractors', order: 14 },
];

const subcategories = [
  { name: 'Smartphones', slug: 'smartphones', parentSlug: 'electronics', order: 1 },
  { name: 'Laptops', slug: 'laptops', parentSlug: 'electronics', order: 2 },
  { name: 'Headphones', slug: 'headphones', parentSlug: 'electronics', order: 3 },
  { name: 'Fashion', slug: 'fashion', parentSlug: 'clothing', order: 1 },
  { name: "Women's Clothing", slug: 'womens-clothing', parentSlug: null, order: 3 },
  { name: 'Shoes', slug: 'shoes', parentSlug: null, order: 4 },
  { name: 'Furniture', slug: 'furniture', parentSlug: 'home-garden', order: 1 },
  { name: 'Kitchen', slug: 'kitchen', parentSlug: 'home-garden', order: 2 },
  { name: 'Exercise Equipment', slug: 'exercise-equipment', parentSlug: 'sports-outdoors', order: 1 },
  { name: 'Camping Gear', slug: 'camping-gear', parentSlug: 'sports-outdoors', order: 2 },
  { name: 'Skincare', slug: 'skincare', parentSlug: 'health-beauty', order: 1 },
  { name: 'Makeup', slug: 'makeup', parentSlug: 'health-beauty', order: 2 },
  { name: 'Sedans', slug: 'sedans', parentSlug: 'car', order: 1 },
  { name: 'SUVs', slug: 'suvs', parentSlug: 'car', order: 2 },
  { name: 'Hatchbacks', slug: 'hatchbacks', parentSlug: 'car', order: 3 },
  { name: 'Convertibles', slug: 'convertibles', parentSlug: 'car', order: 4 },
  { name: 'Luxury Cars', slug: 'luxury-cars', parentSlug: 'car', order: 5 },
  { name: 'Electric Cars', slug: 'electric-cars', parentSlug: 'car', order: 6 },
  { name: 'Pickup Trucks', slug: 'pickup-trucks', parentSlug: 'truck', order: 1 },
  { name: 'Heavy Trucks', slug: 'heavy-trucks', parentSlug: 'truck', order: 2 },
  { name: 'Delivery Trucks', slug: 'delivery-trucks', parentSlug: 'truck', order: 3 },
  { name: 'Dump Trucks', slug: 'dump-trucks', parentSlug: 'truck', order: 4 },
  { name: 'City Buses', slug: 'city-buses', parentSlug: 'bus', order: 1 },
  { name: 'School Buses', slug: 'school-buses', parentSlug: 'bus', order: 2 },
  { name: 'Coach Buses', slug: 'coach-buses', parentSlug: 'bus', order: 3 },
  { name: 'Minibuses', slug: 'minibuses', parentSlug: 'bus', order: 4 },
  { name: 'Farm Tractors', slug: 'farm-tractors', parentSlug: 'tractor', order: 1 },
  { name: 'Garden Tractors', slug: 'garden-tractors', parentSlug: 'tractor', order: 2 },
  { name: 'Industrial Tractors', slug: 'industrial-tractors', parentSlug: 'tractor', order: 3 },
];

async function seed() {
  try {
    await connectDB();
    const { Category, User } = getMasterModels();
    console.log('Connected to MongoDB');

    const existingCount = await Category.countDocuments();
    if (existingCount > 0) {
      console.log(`Categories already exist (${existingCount}), skipping category seed.`);
    } else {
      const createdCategories = await Category.insertMany(categories);
      console.log(`Created ${createdCategories.length} main categories`);

      const catMap = {};
      for (const cat of createdCategories) {
        catMap[cat.slug] = cat._id;
      }

      const subDocs = subcategories.map(sub => ({
        ...sub,
        parent: catMap[sub.parentSlug],
      })).map(({ parentSlug, ...rest }) => rest);

      const createdSubs = await Category.insertMany(subDocs);
      console.log(`Created ${createdSubs.length} subcategories`);
    }

    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const adminName = 'Admin';
      await User.create({
        name: adminName,
        email: 'admin@jrstrader.com',
        passwordHash: 'admin123',
        role: 'admin',
        dbName: slugify(adminName),
      });
      console.log('Created admin user (admin@jrstrader.com / admin123)');
    } else {
      console.log('Admin user already exists, skipping.');
    }

    const sellerExists = await User.findOne({ role: 'seller' });
    if (!sellerExists) {
      const sellerName = 'Test Seller';
      await User.create({
        name: sellerName,
        email: 'seller@jrstrader.com',
        passwordHash: 'seller123',
        role: 'seller',
        dbName: slugify(sellerName),
      });
      console.log('Created seller user (seller@jrstrader.com / seller123)');
    } else {
      console.log('Seller user already exists, skipping.');
    }

    console.log('\nSeed complete!');
    console.log('\nTest accounts:');
    console.log('  Admin: admin@jrstrader.com / admin123');
    console.log('  Seller: seller@jrstrader.com / seller123');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
