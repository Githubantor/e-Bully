const mongoose = require('mongoose');
const userSchema = require('../models/User');
const categorySchema = require('../models/Category');
const productSchema = require('../models/Product');
const orderSchema = require('../models/Order');
const reviewSchema = require('../models/Review');
const cartSchema = require('../models/Cart');

let mongoServer;

let MasterUser;
let MasterCategory;
let MasterProduct;
let MasterOrder;
let MasterReview;
let MasterCart;

const connectDB = async () => {
  const atlasUri = process.env.MONGODB_URI;
  if (atlasUri && atlasUri !== 'your_mongodb_atlas_uri') {
    try {
      await mongoose.connect(atlasUri, { serverSelectionTimeoutMS: 8000 });
      console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    } catch (error) {
      console.warn(`Atlas connection failed: ${error.message}. Falling back to MongoDB Memory Server...`);
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      await mongoose.connect(uri);
      console.log(`MongoDB Memory Server connected: ${uri}`);
    }
  } else {
    console.log('Starting local MongoDB Memory Server...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log(`MongoDB Memory Server connected: ${uri}`);
  }

  MasterUser = mongoose.model('User', userSchema);
  MasterCategory = mongoose.model('Category', categorySchema);
  MasterProduct = mongoose.model('Product', productSchema);
  MasterOrder = mongoose.model('Order', orderSchema);
  MasterReview = mongoose.model('Review', reviewSchema);
  MasterCart = mongoose.model('Cart', cartSchema);

  console.log('DB models registered (User, Category, Product, Order, Review, Cart)');
};

function getMasterModels() {
  return { User: MasterUser, Category: MasterCategory, Product: MasterProduct, Order: MasterOrder, Review: MasterReview, Cart: MasterCart };
}

function slugify(name) {
  return 'db_' + name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
};

module.exports = connectDB;
module.exports.getMasterModels = getMasterModels;
module.exports.slugify = slugify;
module.exports.disconnectDB = disconnectDB;
