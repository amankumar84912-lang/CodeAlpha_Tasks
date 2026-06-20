import express from 'express';
import {
  getAllUsers,
  getUserById,
  getUserPosts,
  updateProfile,
  followUser,
  unfollowUser,
  searchUsers,
} from '../controllers/userController.js';
import protect from '../middleware/authMiddleware.js';
import { validateUpdateProfile } from '../validators/userValidator.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// IMPORTANT: /search MUST be declared before /:id to avoid Express treating
// the string "search" as a dynamic :id parameter.
router.get('/search', protect, searchUsers);

// Get all users for discovery (public)
router.get('/', getAllUsers);

router.get('/:id', getUserById);
router.get('/:id/posts', getUserPosts);
router.put('/profile', protect, upload.single('image'), validateUpdateProfile, updateProfile);
router.post('/:id/follow', protect, followUser);
router.post('/:id/unfollow', protect, unfollowUser);

export default router;

