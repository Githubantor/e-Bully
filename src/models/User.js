const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
  dbName: { type: String },
  profile: {
    avatar: String,
    phone: String,
    bio: String,
  },
  addresses: [{
    label: String,
    street: String,
    city: String,
    state: String,
    zip: String,
    country: { type: String, default: 'US' },
    isDefault: { type: Boolean, default: false },
  }],
  paymentMethods: [{
    type: { type: String, enum: ['card', 'paypal'] },
    last4: String,
    brand: String,
    stripePaymentMethodId: String,
    isDefault: { type: Boolean, default: false },
  }],
  stripeAccountId: String,
  isActive: { type: Boolean, default: true },
  refreshToken: String,
}, { timestamps: true });

userSchema.index({ role: 1 });

const bcrypt = require('bcryptjs');
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.refreshToken;
  return obj;
};

module.exports = userSchema;
