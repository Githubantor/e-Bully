const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { getMasterModels, slugify } = require('../config/db');

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const { User } = getMasterModels();
    if (role === 'admin') {
      return res.status(403).json({ message: 'Cannot create admin account.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered.' });
    }
    const dbName = slugify(name);

    const refreshToken = generateRefreshToken();
    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role: role || 'buyer',
      dbName,
      refreshToken,
    });
    const accessToken = generateAccessToken(user);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({ user, accessToken });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { User } = getMasterModels();
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account has been deactivated.' });
    }
    const refreshToken = generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();
    const accessToken = generateAccessToken(user);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ user, accessToken });
  } catch (error) {
    next(error);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: 'Refresh token not provided.' });
    }
    const { User } = getMasterModels();
    const user = await User.findOne({ refreshToken: token, isActive: true });
    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token.' });
    }
    const newRefreshToken = generateRefreshToken();
    user.refreshToken = newRefreshToken;
    await user.save();
    const accessToken = generateAccessToken(user);
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ user, accessToken });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      const { User } = getMasterModels();
      await User.findOneAndUpdate({ refreshToken: token }, { refreshToken: null });
    }
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, bio, avatar } = req.body;
    const { User } = getMasterModels();
    const updateData = {};
    if (name) updateData.name = name;
    if (phone || bio || avatar) {
      updateData.profile = {};
      if (phone !== undefined) updateData.profile.phone = phone;
      if (bio !== undefined) updateData.profile.bio = bio;
      if (avatar !== undefined) updateData.profile.avatar = avatar;
    }
    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true });
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

exports.addAddress = async (req, res, next) => {
  try {
    const { User } = getMasterModels();
    const user = await User.findById(req.user._id);
    if (req.body.isDefault) {
      user.addresses.forEach(a => (a.isDefault = false));
    }
    user.addresses.push(req.body);
    await user.save();
    res.status(201).json({ addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

exports.updateAddress = async (req, res, next) => {
  try {
    const { User } = getMasterModels();
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);
    if (!address) {
      return res.status(404).json({ message: 'Address not found.' });
    }
    Object.assign(address, req.body);
    if (req.body.isDefault) {
      user.addresses.forEach(a => (a.isDefault = a._id.toString() === req.params.addressId));
    }
    await user.save();
    res.json({ addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

exports.deleteAddress = async (req, res, next) => {
  try {
    const { User } = getMasterModels();
    const user = await User.findById(req.user._id);
    user.addresses.pull(req.params.addressId);
    await user.save();
    res.json({ addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};
