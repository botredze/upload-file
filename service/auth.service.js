const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET);
};

const signin = async (id, password) => {
  try {
    const user = await User.getUserById(id);
    if (!user) {
      throw new Error('Authentication failed. Invalid username or password.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Authentication failed. Invalid username or password.');
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    return { accessToken, refreshToken };
  } catch (error) {
    throw error;
  }
};

const renewToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const accessToken = generateAccessToken(decoded.userId);
    return { accessToken };
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

const signup = async (id, password) => {
  try {
    const existingUser = await User.getUserById(id);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await User.createUser(id, hashedPassword);

    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);

    return { accessToken, refreshToken };
  } catch (error) {
    throw error;
  }
};

const deactivateToken = async (refreshToken) => {
  try {
    await User.deactivateToken({ refreshToken }, { $unset: { refreshToken: 1 } });
  } catch (error) {
    throw new Error('Token deactivation failed');
  }
};

module.exports = {
  signin,
  renewToken,
  signup,
  deactivateToken,
};
