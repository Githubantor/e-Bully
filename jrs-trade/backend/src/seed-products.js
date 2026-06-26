require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const connectDB = require('./config/db');
const { getMasterModels } = require('./config/db');

const productsByCategory = {
  electronics: [
    { title: 'Wireless Bluetooth Headphones', slug: 'wireless-bluetooth-headphones', brand: 'SoundMax', price: 299.99, comparePrice: 349.99, stock: 25, sub: 'headphones', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', featured: true },
    { title: 'Smartphone Galaxy S25', slug: 'smartphone-galaxy-s25', brand: 'TechPro', price: 999.99, stock: 15, sub: 'smartphones', image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800', featured: true },
    { title: 'Ultrabook Laptop 15"', slug: 'ultrabook-laptop-15', brand: 'TechPro', price: 1299.99, comparePrice: 1499.99, stock: 10, sub: 'laptops', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800', featured: true },
    { title: 'USB-C Hub 7-in-1', slug: 'usb-c-hub-7-in-1', brand: 'AccessPlus', price: 49.99, stock: 50, sub: 'headphones', image: 'https://images.unsplash.com/photo-1628258334105-2a0b3d6efee1?w=800' },
    { title: 'Wireless Charging Pad', slug: 'wireless-charging-pad', brand: 'AccessPlus', price: 29.99, stock: 40, sub: 'smartphones', image: 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=800' },
    { title: 'Bluetooth Speaker Portable', slug: 'bluetooth-speaker-portable', brand: 'SoundMax', price: 79.99, comparePrice: 99.99, stock: 30, sub: 'headphones', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800' },
    { title: 'Mechanical Keyboard RGB', slug: 'mechanical-keyboard-rgb', brand: 'TechPro', price: 149.99, stock: 20, sub: 'laptops', image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800' },
    { title: 'Wireless Mouse Ergonomic', slug: 'wireless-mouse-ergonomic', brand: 'AccessPlus', price: 59.99, stock: 35, sub: 'laptops', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800' },
    { title: 'Tablet 10.5" WiFi', slug: 'tablet-10-5-wifi', brand: 'TechPro', price: 449.99, stock: 12, sub: 'laptops', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800' },
    { title: 'Action Camera 4K', slug: 'action-camera-4k', brand: 'DigiCam', price: 349.99, comparePrice: 399.99, stock: 18, sub: 'smartphones', image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800' },
  ],
  clothing: [
    { title: "Men's Classic Fit Polo Shirt", slug: 'mens-classic-polo', brand: 'FashionCo', price: 49.99, stock: 50, sub: 'fashion', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800', featured: true },
    { title: "Women's Summer Dress", slug: 'womens-summer-dress', brand: 'StyleHub', price: 79.99, comparePrice: 99.99, stock: 30, sub: 'womens-clothing', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800', featured: true },
    { title: 'Running Shoes Pro', slug: 'running-shoes-pro', brand: 'SportFlex', price: 129.99, stock: 25, sub: 'shoes', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', featured: true },
    { title: "Men's Denim Jacket", slug: 'mens-denim-jacket', brand: 'FashionCo', price: 89.99, stock: 20, sub: 'fashion', image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800' },
    { title: "Women's Leather Handbag", slug: 'womens-leather-handbag', brand: 'StyleHub', price: 149.99, comparePrice: 199.99, stock: 15, sub: 'womens-clothing', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800' },
    { title: 'Casual Sneakers White', slug: 'casual-sneakers-white', brand: 'SportFlex', price: 89.99, stock: 40, sub: 'shoes', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800' },
    { title: "Men's Formal Shirt", slug: 'mens-formal-shirt', brand: 'FashionCo', price: 59.99, stock: 35, sub: 'fashion', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800' },
    { title: "Women's Yoga Pants", slug: 'womens-yoga-pants', brand: 'StyleHub', price: 44.99, stock: 45, sub: 'womens-clothing', image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800' },
    { title: 'Leather Boots Brown', slug: 'leather-boots-brown', brand: 'SportFlex', price: 179.99, stock: 10, sub: 'shoes', image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800' },
    { title: "Men's Casual Shorts", slug: 'mens-casual-shorts', brand: 'FashionCo', price: 34.99, stock: 60, sub: 'fashion', image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800' },
  ],
  'home-garden': [
    { title: 'Modern Floor Lamp', slug: 'modern-floor-lamp', brand: 'HomeStyle', price: 129.99, stock: 15, sub: 'furniture', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=800', featured: true },
    { title: 'Stainless Steel Cookware Set', slug: 'stainless-steel-cookware-set', brand: 'KitchenPro', price: 249.99, comparePrice: 299.99, stock: 10, sub: 'kitchen', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800' },
    { title: 'Indoor Plant Pot Set', slug: 'indoor-plant-pot-set', brand: 'GreenLeaf', price: 39.99, stock: 25, sub: 'furniture', image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800' },
    { title: 'Non-Stick Frying Pan', slug: 'non-stick-frying-pan', brand: 'KitchenPro', price: 49.99, stock: 30, sub: 'kitchen', image: 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800' },
    { title: 'Throw Blanket Soft', slug: 'throw-blanket-soft', brand: 'HomeStyle', price: 34.99, stock: 40, sub: 'furniture', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800' },
    { title: 'Coffee Maker Drip', slug: 'coffee-maker-drip', brand: 'KitchenPro', price: 69.99, comparePrice: 89.99, stock: 20, sub: 'kitchen', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800' },
    { title: 'Scented Candle Set', slug: 'scented-candle-set', brand: 'GreenLeaf', price: 24.99, stock: 50, sub: 'furniture', image: 'https://images.unsplash.com/photo-1602523961358-f9f03bcc0f9a?w=800' },
    { title: 'Cutting Board Bamboo', slug: 'cutting-board-bamboo', brand: 'KitchenPro', price: 29.99, stock: 35, sub: 'kitchen', image: 'https://images.unsplash.com/photo-1594226801341-41427b4e5c6e?w=800' },
  ],
  'sports-outdoors': [
    { title: 'Yoga Mat Premium', slug: 'yoga-mat-premium', brand: 'FitLife', price: 39.99, stock: 100, sub: 'exercise-equipment', image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800', featured: true },
    { title: 'Camping Tent 4-Person', slug: 'camping-tent-4-person', brand: 'OutdoorX', price: 199.99, comparePrice: 249.99, stock: 8, sub: 'camping-gear', image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800' },
    { title: 'Adjustable Dumbbell Set', slug: 'adjustable-dumbbell-set', brand: 'FitLife', price: 299.99, stock: 5, sub: 'exercise-equipment', image: 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=800' },
    { title: 'Sleeping Bag Warm', slug: 'sleeping-bag-warm', brand: 'OutdoorX', price: 89.99, stock: 15, sub: 'camping-gear', image: 'https://images.unsplash.com/photo-1556521786-7d1a3810c8d2?w=800' },
    { title: 'Resistance Bands Set', slug: 'resistance-bands-set', brand: 'FitLife', price: 24.99, stock: 60, sub: 'exercise-equipment', image: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800' },
    { title: 'Portable Camping Stove', slug: 'portable-camping-stove', brand: 'OutdoorX', price: 59.99, stock: 20, sub: 'camping-gear', image: 'https://images.unsplash.com/photo-1594501432905-2f95ca792d37?w=800' },
    { title: 'Jump Rope Speed', slug: 'jump-rope-speed', brand: 'FitLife', price: 14.99, stock: 80, sub: 'exercise-equipment', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800' },
  ],
  car: [
    { title: 'Sedan Premium 2025', slug: 'sedan-premium-2025', brand: 'AutoWorld', price: 35000, comparePrice: 38000, stock: 3, sub: 'sedans', image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800', featured: true },
    { title: 'Luxury SUV V8', slug: 'luxury-suv-v8', brand: 'AutoWorld', price: 65000, stock: 2, sub: 'suvs', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800', featured: true },
    { title: 'Electric Hatchback Eco', slug: 'electric-hatchback-eco', brand: 'GreenMotors', price: 28999, stock: 5, sub: 'hatchbacks', image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800' },
    { title: 'Convertible Sport 2-Seater', slug: 'convertible-sport-2-seater', brand: 'AutoWorld', price: 45000, stock: 1, sub: 'convertibles', image: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=800' },
    { title: 'Executive Luxury Sedan', slug: 'executive-luxury-sedan', brand: 'PrestigeAuto', price: 85000, stock: 2, sub: 'luxury-cars', image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800' },
    { title: 'Electric SUV Long Range', slug: 'electric-suv-long-range', brand: 'GreenMotors', price: 52000, stock: 3, sub: 'electric-cars', image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800' },
  ],
  truck: [
    { title: 'Pickup Truck 4x4', slug: 'pickup-truck-4x4', brand: 'HeavyDuty', price: 42000, comparePrice: 45000, stock: 3, sub: 'pickup-trucks', image: 'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=800', featured: true },
    { title: 'Cargo Truck 16ft', slug: 'cargo-truck-16ft', brand: 'HeavyDuty', price: 55000, stock: 2, sub: 'heavy-trucks', image: 'https://images.unsplash.com/photo-1580048915913-4f8f5cb8b3a4?w=800' },
    { title: 'Delivery Van', slug: 'delivery-van', brand: 'CityFleet', price: 32000, stock: 4, sub: 'delivery-trucks', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800' },
    { title: 'Dump Truck 10-Wheeler', slug: 'dump-truck-10-wheeler', brand: 'HeavyDuty', price: 78000, stock: 1, sub: 'dump-trucks', image: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=800' },
    { title: 'Flatbed Truck', slug: 'flatbed-truck', brand: 'HeavyDuty', price: 48000, stock: 2, sub: 'heavy-trucks', image: 'https://images.unsplash.com/photo-1600679472489-5c89b6d1dd35?w=800' },
  ],
  bus: [
    { title: 'City Transit Bus', slug: 'city-transit-bus', brand: 'TransitPro', price: 120000, stock: 2, sub: 'city-buses', image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f94?w=800', featured: true },
    { title: 'School Bus 72-Passenger', slug: 'school-bus-72-passenger', brand: 'SafeRide', price: 85000, stock: 3, sub: 'school-buses', image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800' },
    { title: 'Luxury Coach Bus', slug: 'luxury-coach-bus', brand: 'TransitPro', price: 250000, stock: 1, sub: 'coach-buses', image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800' },
    { title: 'Minibus 15-Seater', slug: 'minibus-15-seater', brand: 'SafeRide', price: 45000, stock: 4, sub: 'minibuses', image: 'https://images.unsplash.com/photo-1591287082218-7c7b6b4daad0?w=800' },
  ],
  tractor: [
    { title: 'Farm Tractor 100HP', slug: 'farm-tractor-100hp', brand: 'AgriPower', price: 55000, comparePrice: 60000, stock: 2, sub: 'farm-tractors', image: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=800', featured: true },
    { title: 'Garden Tractor Mower', slug: 'garden-tractor-mower', brand: 'AgriPower', price: 3500, stock: 5, sub: 'garden-tractors', image: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=800' },
    { title: 'Industrial Tractor Loader', slug: 'industrial-tractor-loader', brand: 'BuildMax', price: 85000, stock: 1, sub: 'industrial-tractors', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800' },
    { title: 'Compact Utility Tractor', slug: 'compact-utility-tractor', brand: 'AgriPower', price: 25000, stock: 3, sub: 'farm-tractors', image: 'https://images.unsplash.com/photo-1585515321435-36d7c6d132d2?w=800' },
  ],
  bikes: [
    { title: 'KTM 390 Duke 2025', slug: 'ktm-390-duke', brand: 'KTM', price: 5999, comparePrice: 6999, stock: 10, sub: 'motorcycles', image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800', featured: true },
    { title: 'Electric Scooter City', slug: 'electric-scooter-city', brand: 'EcoRide', price: 2499, stock: 8, sub: 'scooters', image: 'https://images.unsplash.com/photo-1604748759968-77a79d01f6de?w=800' },
    { title: 'Mountain Bike 27-Speed', slug: 'mountain-bike-27-speed', brand: 'CyclePro', price: 899, comparePrice: 1099, stock: 12, sub: 'bicycles', image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94aa4?w=800' },
    { title: 'Sport Motorcycle 600cc', slug: 'sport-motorcycle-600cc', brand: 'SpeedStar', price: 8999, stock: 3, sub: 'motorcycles', image: 'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=800' },
    { title: 'Kids Scooter Foldable', slug: 'kids-scooter-foldable', brand: 'EcoRide', price: 79.99, stock: 25, sub: 'scooters', image: 'https://images.unsplash.com/photo-1608261019987-0b958d1a6a3f?w=800' },
    { title: 'Road Bike Carbon Frame', slug: 'road-bike-carbon-frame', brand: 'CyclePro', price: 2499, stock: 5, sub: 'bicycles', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800' },
    { title: 'Cruiser Motorcycle 800cc', slug: 'cruiser-motorcycle-800cc', brand: 'SpeedStar', price: 7499, stock: 4, sub: 'motorcycles', image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800' },
  ],
  'health-beauty': [
    { title: 'Vitamin C Serum', slug: 'vitamin-c-serum', brand: 'GlowUp', price: 34.99, stock: 40, sub: 'skincare', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800' },
    { title: 'Matte Lipstick Set', slug: 'matte-lipstick-set', brand: 'Glamour', price: 29.99, stock: 35, sub: 'makeup', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800' },
    { title: 'Moisturizer Daily Face', slug: 'moisturizer-daily-face', brand: 'GlowUp', price: 24.99, stock: 50, sub: 'skincare', image: 'https://images.unsplash.com/photo-1570194065650-d99fb4ee8e39?w=800' },
    { title: 'Eyeshadow Palette 12-Color', slug: 'eyeshadow-palette-12-color', brand: 'Glamour', price: 44.99, comparePrice: 54.99, stock: 20, sub: 'makeup', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800' },
    { title: 'Sunscreen SPF 50', slug: 'sunscreen-spf-50', brand: 'GlowUp', price: 19.99, stock: 60, sub: 'skincare', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800' },
  ],
  'books-media': [
    { title: 'The Art of Coding', slug: 'the-art-of-coding', brand: 'ReadWell', price: 29.99, stock: 30, sub: null, image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800', featured: true },
    { title: 'Cookbook: World Recipes', slug: 'cookbook-world-recipes', brand: 'ReadWell', price: 34.99, stock: 20, sub: null, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800' },
    { title: 'Fitness Guide 90-Day', slug: 'fitness-guide-90-day', brand: 'ReadWell', price: 19.99, stock: 40, sub: null, image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800' },
  ],
  'toys-games': [
    { title: 'Building Blocks 500pc', slug: 'building-blocks-500pc', brand: 'KidsPlay', price: 49.99, stock: 20, sub: null, image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800' },
    { title: 'Board Game Strategy', slug: 'board-game-strategy', brand: 'FunTime', price: 39.99, stock: 15, sub: null, image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800' },
    { title: 'Remote Control Car', slug: 'remote-control-car', brand: 'KidsPlay', price: 59.99, comparePrice: 79.99, stock: 12, sub: null, image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=800' },
  ],
  automotive: [
    { title: 'Car Battery 12V', slug: 'car-battery-12v', brand: 'AutoPart', price: 149.99, stock: 10, sub: null, image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800' },
    { title: 'All-Season Tires Set', slug: 'all-season-tires-set', brand: 'AutoPart', price: 599.99, stock: 8, sub: null, image: 'https://images.unsplash.com/photo-1578844251758-2f71da4c2f4e?w=800' },
    { title: 'Car Dash Camera', slug: 'car-dash-camera', brand: 'AutoTech', price: 129.99, stock: 15, sub: null, image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800' },
  ],
  'jewelry-accessories': [
    { title: 'Gold Plated Necklace', slug: 'gold-plated-necklace', brand: 'LuxeGems', price: 199.99, stock: 10, sub: null, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800' },
    { title: 'Stainless Steel Watch', slug: 'stainless-steel-watch', brand: 'TimePiece', price: 249.99, comparePrice: 299.99, stock: 15, sub: null, image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800' },
    { title: 'Silver Earrings Set', slug: 'silver-earrings-set', brand: 'LuxeGems', price: 89.99, stock: 20, sub: null, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800' },
  ],
};

async function seedProducts() {
  try {
    await connectDB();
    const { Category, Product, User } = getMasterModels();

    let seller = await User.findOne({ role: 'seller' });
    if (!seller) {
      seller = await User.create({
        name: 'Default Seller',
        email: 'seller@jrstrader.com',
        passwordHash: 'seller123',
        role: 'seller',
        dbName: 'db_default_seller',
      });
      console.log('Created default seller');
    }

    const existingProducts = await Product.countDocuments();
    if (existingProducts > 0) {
      console.log(`${existingProducts} products already exist. Skipping product seed.`);
      console.log('Run "node src/seed-products.js force" to re-seed.');
      if (process.argv[2] !== 'force') {
        process.exit(0);
      } else {
        console.log('Force mode: deleting existing products...');
        await Product.deleteMany({});
        console.log('Existing products deleted.');
      }
    }

    let totalCreated = 0;
    for (const [catSlug, products] of Object.entries(productsByCategory)) {
      const category = await Category.findOne({ slug: catSlug });
      if (!category) {
        console.log(`  Category "${catSlug}" not found, skipping.`);
        continue;
      }

      const subcategories = await Category.find({ parent: category._id });
      const subMap = {};
      for (const child of subcategories) {
        subMap[child.slug] = child._id;
      }

      for (const prod of products) {
        const existing = await Product.findOne({ slug: prod.slug });
        if (existing) {
          continue;
        }

        let catId = category._id;
        if (prod.sub && subMap[prod.sub]) {
          catId = subMap[prod.sub];
        }

        const images = [{ url: prod.image, alt: prod.title }];
        const variants = [{
          sku: prod.slug.toUpperCase().replace(/-/g, '_'),
          price: prod.price,
          stock: prod.stock,
          isActive: true,
        }];
        if (prod.comparePrice) {
          variants[0].comparePrice = prod.comparePrice;
        }

        await Product.create({
          title: prod.title,
          slug: prod.slug,
          description: `High-quality ${prod.title} by ${prod.brand}. Perfect for your needs.`,
          category: catId,
          brand: prod.brand,
          variants,
          images,
          tags: [catSlug, prod.brand.toLowerCase(), ...(prod.sub ? [prod.sub] : [])],
          seller: seller._id,
          isActive: true,
          isFeatured: prod.featured || false,
        });
        totalCreated++;
      }
    }

    console.log(`\nCreated ${totalCreated} new products across ${Object.keys(productsByCategory).length} categories.`);
    console.log('\nDone! All categories now have products.');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seedProducts();