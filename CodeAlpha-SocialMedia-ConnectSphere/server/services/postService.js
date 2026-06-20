import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import { uploadImage, deleteImage } from '../utils/cloudinary.js';

const notFoundError = (msg = 'Post not found') => {
  const err = new Error(msg);
  err.statusCode = 404;
  return err;
};

/**
 * Creates a post. If imageFile is provided, uploads to Cloudinary first.
 */
export const createPostService = async ({ userId, content, imageFile }) => {
  let image = { url: '', publicId: '' };
  if (imageFile) {
    image = await uploadImage(imageFile.buffer, 'connectsphere/posts');
  }
  const post = await Post.create({ user: userId, content, image });
  return post.populate('user', 'username profilePic');
};

/**
 * Returns paginated feed posts (self + followed users), newest first.
 *
 * @returns {{ posts: Post[], page: number, pages: number, total: number }}
 */
export const getFeedPostsService = async ({ userId, following, page = 1, limit = 10 }) => {
  const userIds = [...(following || []), userId];
  const skip = (page - 1) * limit;

  // Check if followed users have posted anything
  let total = await Post.countDocuments({ user: { $in: userIds } });
  let query = { user: { $in: userIds } };

  // Fallback to all posts (global feed) if the user follows no one or has an empty feed
  if (total === 0) {
    total = await Post.countDocuments({});
    query = {};
  }

  const posts = await Post.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'username profilePic')
    .populate({
      path: 'comments',
      options: { sort: { createdAt: 1 } },
      populate: { path: 'user', select: 'username profilePic' },
    });

  return {
    posts,
    page,
    pages: Math.ceil(total / limit) || 1,
    total,
  };
};

/**
 * Deletes a post and its associated Cloudinary image + comments.
 * Only the post owner can delete.
 */
export const deletePostService = async (postId, userId) => {
  const post = await Post.findById(postId);
  if (!post) throw notFoundError();

  if (post.user.toString() !== userId.toString()) {
    const err = new Error('Not authorized to delete this post');
    err.statusCode = 403;
    throw err;
  }

  if (post.image?.publicId) {
    await deleteImage(post.image.publicId);
  }

  await Comment.deleteMany({ post: post._id });
  await post.deleteOne();

  return { message: 'Post deleted successfully' };
};

/**
 * Toggles a like on a post.
 *
 * @returns {{ liked: boolean, likesCount: number }}
 */
export const toggleLikeService = async (postId, userId) => {
  const post = await Post.findById(postId);
  if (!post) throw notFoundError();

  const alreadyLiked = post.likes.some((id) => id.toString() === userId.toString());

  if (alreadyLiked) {
    await Post.findByIdAndUpdate(postId, { $pull: { likes: userId } });
  } else {
    await Post.findByIdAndUpdate(postId, { $addToSet: { likes: userId } });
  }

  const updated = await Post.findById(postId);
  return { liked: !alreadyLiked, likesCount: updated.likes.length };
};

/**
 * Creates a comment on a post and pushes its _id into Post.comments.
 */
export const addCommentService = async (postId, userId, text) => {
  const post = await Post.findById(postId);
  if (!post) throw notFoundError();

  const comment = await Comment.create({ user: userId, post: postId, text });
  await Post.findByIdAndUpdate(postId, { $push: { comments: comment._id } });
  return comment.populate('user', 'username profilePic');
};
