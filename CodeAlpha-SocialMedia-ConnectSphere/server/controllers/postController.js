import asyncHandler from 'express-async-handler';
import * as postService from '../services/postService.js';
import { sendSuccess } from '../utils/responseHandler.js';

// @route  GET /api/posts/feed?page=1&limit=10 — Private
export const getFeedPosts = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));

  const data = await postService.getFeedPostsService({
    userId: req.user._id,
    following: req.user.following,
    page,
    limit,
  });
  sendSuccess(res, data);
});

// @route  POST /api/posts — Private
export const createPost = asyncHandler(async (req, res) => {
  const post = await postService.createPostService({
    userId: req.user._id,
    content: req.body.content,
    imageFile: req.file,
  });
  sendSuccess(res, post, 201);
});

// @route  DELETE /api/posts/:id — Private
export const deletePost = asyncHandler(async (req, res) => {
  const result = await postService.deletePostService(req.params.id, req.user._id);
  sendSuccess(res, result);
});

// @route  POST /api/posts/:id/like — Private
export const likePost = asyncHandler(async (req, res) => {
  const result = await postService.toggleLikeService(req.params.id, req.user._id);
  sendSuccess(res, result);
});

// @route  POST /api/posts/:id/comments — Private
export const addComment = asyncHandler(async (req, res) => {
  const comment = await postService.addCommentService(
    req.params.id,
    req.user._id,
    req.body.text
  );
  sendSuccess(res, comment, 201);
});
