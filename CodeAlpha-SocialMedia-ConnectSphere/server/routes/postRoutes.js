import express from 'express';
import {
  getFeedPosts,
  createPost,
  deletePost,
  likePost,
  addComment,
} from '../controllers/postController.js';
import protect from '../middleware/authMiddleware.js';
import { validateCreatePost, validateAddComment } from '../validators/postValidator.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/feed', protect, getFeedPosts);
// multer runs before validator so req.body is populated from multipart form
router.post('/', protect, upload.single('image'), validateCreatePost, createPost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, likePost);
router.post('/:id/comments', protect, validateAddComment, addComment);

export default router;
