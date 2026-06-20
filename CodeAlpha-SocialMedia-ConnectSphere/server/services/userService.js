import User from '../models/User.js';
import { uploadImage, deleteImage } from '../utils/cloudinary.js';

const notFoundError = (msg = 'User not found') => {
  const err = new Error(msg);
  err.statusCode = 404;
  return err;
};

const badRequestError = (msg) => {
  const err = new Error(msg);
  err.statusCode = 400;
  return err;
};

const escapeRegex = (string) => {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

/**
 * Returns all users (limited to 50) for discovery/suggestions.
 */
export const getAllUsers = async (limit = 50) => {
  return User.find({})
    .select('username profilePic bio followers following')
    .limit(limit)
    .sort({ createdAt: -1 });
};


/**
 * Returns a single user by ID (password excluded).
 */
export const getUserById = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) throw notFoundError();
  return user;
};

/**
 * Updates the authenticated user's profile.
 * If an imageFile buffer is provided, uploads to Cloudinary and replaces profilePic.
 */
export const updateUserProfile = async (userId, { username, bio }, imageFile) => {
  const user = await User.findById(userId);
  if (!user) throw notFoundError();

  if (username !== undefined) {
    const trimmedUsername = username.trim();
    if (trimmedUsername !== user.username) {
      const existing = await User.findOne({ username: trimmedUsername });
      if (existing) {
        throw badRequestError('Username is already taken');
      }
      user.username = trimmedUsername;
    }
  }
  if (bio !== undefined) user.bio = bio.trim();

  if (imageFile) {
    if (user.profilePic?.publicId) {
      await deleteImage(user.profilePic.publicId);
    }
    user.profilePic = await uploadImage(imageFile.buffer, 'connectsphere/avatars');
  }

  const updated = await user.save();

  return {
    _id: updated._id,
    username: updated.username,
    email: updated.email,
    bio: updated.bio,
    profilePic: updated.profilePic,
    role: updated.role,
    followers: updated.followers,
    following: updated.following,
  };
};

/**
 * Follows a user. Updates both target.followers and current.following.
 */
export const followUserById = async (currentUserId, targetUserId) => {
  if (currentUserId.toString() === targetUserId) {
    throw badRequestError('You cannot follow yourself');
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) throw notFoundError('Target user not found');

  const alreadyFollowing = targetUser.followers.some(
    (id) => id.toString() === currentUserId.toString()
  );
  if (alreadyFollowing) throw badRequestError('You are already following this user');

  await User.findByIdAndUpdate(targetUserId, { $addToSet: { followers: currentUserId } });
  await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: targetUserId } });

  const refreshed = await User.findById(targetUserId).select('-password');
  return {
    message: 'User followed successfully',
    followersCount: refreshed.followers.length,
  };
};

/**
 * Unfollows a user. Updates both target.followers and current.following.
 */
export const unfollowUserById = async (currentUserId, targetUserId) => {
  if (currentUserId.toString() === targetUserId) {
    throw badRequestError('You cannot unfollow yourself');
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) throw notFoundError('Target user not found');

  await User.findByIdAndUpdate(targetUserId, { $pull: { followers: currentUserId } });
  await User.findByIdAndUpdate(currentUserId, { $pull: { following: targetUserId } });

  const refreshed = await User.findById(targetUserId).select('-password');
  return {
    message: 'User unfollowed successfully',
    followersCount: refreshed.followers.length,
  };
};

/**
 * Case-insensitive username search. Returns up to `limit` results.
 */
export const searchUsers = async (query, limit = 20) => {
  if (!query || !query.trim()) {
    throw badRequestError('Search query is required');
  }
  const escapedQuery = escapeRegex(query.trim());
  return User.find({
    username: { $regex: escapedQuery, $options: 'i' },
  })
    .select('username profilePic bio followers following')
    .limit(limit);
};
