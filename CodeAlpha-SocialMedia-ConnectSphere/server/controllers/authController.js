import asyncHandler from 'express-async-handler';
import * as authService from '../services/authService.js';
import { sendSuccess } from '../utils/responseHandler.js';

// @route  POST /api/auth/register — Public
export const register = asyncHandler(async (req, res) => {
  const data = await authService.registerUser(req.body);
  sendSuccess(res, data, 201);
});

// @route  POST /api/auth/login — Public
export const login = asyncHandler(async (req, res) => {
  const data = await authService.loginUser(req.body);
  sendSuccess(res, data);
});

// @route  GET /api/auth/profile — Private
export const getProfile = asyncHandler(async (req, res) => {
  sendSuccess(res, req.user);
});
