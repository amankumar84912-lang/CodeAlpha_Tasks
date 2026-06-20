import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

/**
 * Registers a new user.
 * Throws 400 if the email is already taken.
 *
 * @param {{ username: string, email: string, password: string }} data
 * @returns {Promise<Object>} Sanitized user data + JWT token
 */
export const registerUser = async ({ username, email, password }) => {
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    const err = new Error('An account with this email already exists');
    err.statusCode = 400;
    throw err;
  }

  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    const err = new Error('Username is already taken');
    err.statusCode = 400;
    throw err;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({ username, email, password: hashedPassword });
  const token = generateToken(user._id);

  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    profilePic: user.profilePic,
    bio: user.bio,
    role: user.role,
    followers: [],
    following: [],
    token,
  };
};

/**
 * Authenticates a user by email/password.
 * Throws 401 if credentials are invalid.
 *
 * @param {{ email: string, password: string }} data
 * @returns {Promise<Object>} Sanitized user data + JWT token
 */
export const loginUser = async ({ email, password }) => {
  // password is excluded by default (select:false) — must use +password to include it
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await bcrypt.compare(password, user.password))) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken(user._id);

  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    profilePic: user.profilePic,
    bio: user.bio,
    role: user.role,
    followers: user.followers,
    following: user.following,
    token,
  };
};
