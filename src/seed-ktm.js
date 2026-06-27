require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const connectDB = require('./config/db');
const { getMasterModels } = require('./config/db');

async function seedKTM() {
  try {
    await connectDB();
    const { Category, User, Product } = getMasterModels();

    let bikesCat = await Category.findOne({ slug: 'bikes' });
    if (!bikesCat) {
      bikesCat = await Category.create({
        name: 'Bikes',
        slug: 'bikes',
        description: 'Motorcycles, scooters, bicycles, and related gear',
        order: 11,
      });
      console.log('Created Bikes category');

      const subs = [
        { name: 'Motorcycles', slug: 'motorcycles', parent: bikesCat._id, order: 1 },
        { name: 'Scooters', slug: 'scooters', parent: bikesCat._id, order: 2 },
        { name: 'Bicycles', slug: 'bicycles', parent: bikesCat._id, order: 3 },
      ];
      await Category.insertMany(subs);
      console.log('Created Motorcycles, Scooters, Bicycles subcategories');
    }

    const motorcyclesCat = await Category.findOne({ slug: 'motorcycles' });

    let seller = await User.findOne({ email: 'seller@jrstrader.com' });
    if (!seller) {
      seller = await User.create({
        name: 'Test Seller',
        email: 'seller@jrstrader.com',
        passwordHash: 'seller123',
        role: 'seller',
        dbName: 'db_test_seller',
      });
      console.log('Created seller user');
    }

    const existing = await Product.findOne({ slug: 'ktm-390-duke' });
    if (existing) {
      console.log('KTM 390 Duke already exists, skipping.');
    } else {
      const product = await Product.create({
        title: 'KTM 390 Duke 2025',
        slug: 'ktm-390-duke',
        description: 'The KTM 390 Duke is a powerful and agile naked street motorcycle, featuring a 373cc single-cylinder engine producing 44 HP, a lightweight trellis frame, WP suspension, and advanced electronics. Perfect for city commuting and weekend canyon carving.',
        category: motorcyclesCat._id,
        brand: 'KTM',
        variants: [
          {
            sku: 'KTM-390-DUKE-BASE',
            price: 5999,
            comparePrice: 6999,
            stock: 10,
            isActive: true,
            attributes: { color: 'Orange', model: '390 Duke' },
          },
          {
            sku: 'KTM-390-DUKE-PREMIUM',
            price: 6999,
            comparePrice: 7999,
            stock: 5,
            isActive: true,
            attributes: { color: 'White', model: '390 Duke', extras: 'Quick Shifter+' },
          },
        ],
        images: [
          { url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800', alt: 'KTM 390 Duke - Front View' },
          { url: 'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=800', alt: 'KTM 390 Duke - Side View' },
        ],
        tags: ['motorcycle', 'ktm', '390-duke', 'naked-bike'],
        seller: seller._id,
        isActive: true,
        isFeatured: true,
      });
      console.log(`Created product: ${product.title}`);
    }

    console.log('\nDone! KTM 390 Duke is now in the product catalog.');
    process.exit(0);
  } catch (error) {
    console.error('Failed:', error);
    process.exit(1);
  }
}

seedKTM();
