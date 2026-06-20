import asyncHandler from 'express-async-handler';
import * as userService from '../services/userService.js';
import { sendSuccess } from '../utils/responseHandler.js';
import Post from '../models/Post.js';

// @route  GET /api/users — Public (get all users for suggestions)
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers();
  sendSuccess(res, users);
});

// @route  GET /api/users/:id/posts — Public
export const getUserPosts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    Post.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username profilePic')
      .populate({ path: 'comments', populate: { path: 'user', select: 'username profilePic' } }),
    Post.countDocuments({ user: req.params.id }),
  ]);

  sendSuccess(res, { posts, page, pages: Math.ceil(total / limit) || 1, total });
});

// @route  GET /api/users/search?q= — Private
export const searchUsers = asyncHandler(async (req, res) => {
  const users = await userService.searchUsers(req.query.q);
  sendSuccess(res, users);
});

// @route  GET /api/users/:id — Public
export const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  sendSuccess(res, user);
});

// @route  PUT /api/users/profile — Private
export const updateProfile = asyncHandler(async (req, res) => {
  const updated = await userService.updateUserProfile(req.user._id, req.body, req.file);
  sendSuccess(res, updated);
});

// @route  POST /api/users/:id/follow — Private
export const followUser = asyncHandler(async (req, res) => {
  const result = await userService.followUserById(req.user._id, req.params.id);
  sendSuccess(res, result);
});

// @route  POST /api/users/:id/unfollow — Private
export const unfollowUser = asyncHandler(async (req, res) => {
  const result = await userService.unfollowUserById(req.user._id, req.params.id);
  sendSuccess(res, result);
});
