import api from '../api/axiosInstance';

/** Get all users for discovery / suggestions */
export const getAllUsers = () => api.get('/users');

/** Get any user's public profile by ID */
export const getUserById = (userId) => api.get(`/users/${userId}`);

/** Get posts by a specific user ID (paginated) */
export const getUserPosts = (userId, page = 1) =>
  api.get(`/users/${userId}/posts?page=${page}&limit=20`);

/**
 * Update the authenticated user's profile.
 * Accepts a FormData object (for image upload) or a plain object.
 */
export const updateProfile = (data) => {
  if (data instanceof FormData) {
    return api.put('/users/profile', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
  return api.put('/users/profile', data);
};

/** Follow a user by ID */
export const followUser = (userId) => api.post(`/users/${userId}/follow`);

/** Unfollow a user by ID */
export const unfollowUser = (userId) => api.post(`/users/${userId}/unfollow`);

/** Case-insensitive username search */
export const searchUsers = (q) =>
  api.get(`/users/search?q=${encodeURIComponent(q)}`);

