import api from '../api/axiosInstance';

/** Get paginated feed posts for the authenticated user */
export const getFeedPosts = (page = 1, limit = 10) =>
  api.get(`/posts/feed?page=${page}&limit=${limit}`);

/**
 * Create a new post.
 * Accepts a FormData object (for image upload) or a plain object.
 */
export const createPost = (data) => {
  if (data instanceof FormData) {
    return api.post('/posts', data, { headers: { 'Content-Type': 'multipart/form-data' } });
  }
  return api.post('/posts', data);
};

/** Delete a post by ID */
export const deletePost = (postId) => api.delete(`/posts/${postId}`);

/** Toggle like on a post */
export const likePost = (postId) => api.post(`/posts/${postId}/like`);

/** Add a comment to a post */
export const addComment = (postId, text) =>
  api.post(`/posts/${postId}/comments`, { text });
