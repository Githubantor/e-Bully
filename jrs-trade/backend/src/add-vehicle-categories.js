require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const connectDB = require('./config/db');
const { getMasterModels } = require('./config/db');

async function addVehicleCategories() {
  try {
    await connectDB();
    const { Category } = getMasterModels();
    console.log('Connected to MongoDB');

    const vehicles = [
      {
        name: 'Car',
        slug: 'car',
        description: 'Sedans, SUVs, hatchbacks, luxury cars, and electric vehicles',
        order: 12,
        subs: [
          { name: 'Sedans', slug: 'sedans', order: 1 },
          { name: 'SUVs', slug: 'suvs', order: 2 },
          { name: 'Hatchbacks', slug: 'hatchbacks', order: 3 },
          { name: 'Convertibles', slug: 'convertibles', order: 4 },
          { name: 'Luxury Cars', slug: 'luxury-cars', order: 5 },
          { name: 'Electric Cars', slug: 'electric-cars', order: 6 },
        ],
      },
      {
        name: 'Truck',
        slug: 'truck',
        description: 'Pickup trucks, heavy trucks, delivery trucks, and commercial vehicles',
        order: 13,
        subs: [
          { name: 'Pickup Trucks', slug: 'pickup-trucks', order: 1 },
          { name: 'Heavy Trucks', slug: 'heavy-trucks', order: 2 },
          { name: 'Delivery Trucks', slug: 'delivery-trucks', order: 3 },
          { name: 'Dump Trucks', slug: 'dump-trucks', order: 4 },
        ],
      },
      {
        name: 'Bus',
        slug: 'bus',
        description: 'City buses, school buses, coach buses, and minibuses',
        order: 14,
        subs: [
          { name: 'City Buses', slug: 'city-buses', order: 1 },
          { name: 'School Buses', slug: 'school-buses', order: 2 },
          { name: 'Coach Buses', slug: 'coach-buses', order: 3 },
          { name: 'Minibuses', slug: 'minibuses', order: 4 },
        ],
      },
      {
        name: 'Tractor',
        slug: 'tractor',
        description: 'Farm tractors, garden tractors, and industrial tractors',
        order: 15,
        subs: [
          { name: 'Farm Tractors', slug: 'farm-tractors', order: 1 },
          { name: 'Garden Tractors', slug: 'garden-tractors', order: 2 },
          { name: 'Industrial Tractors', slug: 'industrial-tractors', order: 3 },
        ],
      },
    ];

    for (const vehicle of vehicles) {
      const existing = await Category.findOne({ slug: vehicle.slug });
      if (existing) {
        console.log(`${vehicle.name} category already exists, skipping.`);
      } else {
        const parent = await Category.create({
          name: vehicle.name,
          slug: vehicle.slug,
          description: vehicle.description,
          order: vehicle.order,
        });
        console.log(`Created main category: ${vehicle.name}`);

        const subs = vehicle.subs.map(sub => ({
          ...sub,
          parent: parent._id,
        }));
        const createdSubs = await Category.insertMany(subs);
        console.log(`  Created ${createdSubs.length} subcategories`);
      }
    }

    console.log('\nDone! Added Truck, Bus, Car, and Tractor categories.');
    process.exit(0);
  } catch (error) {
    console.error('Failed:', error);
    process.exit(1);
  }
}

addVehicleCategories();
