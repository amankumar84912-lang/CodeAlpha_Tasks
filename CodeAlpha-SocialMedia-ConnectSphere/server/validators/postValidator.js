import { body, validationResult } from 'express-validator';

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  next();
};

export const validateCreatePost = [
  body('content')
    .trim()
    .notEmpty().withMessage('Post content is required')
    .isLength({ max: 2200 }).withMessage('Content cannot exceed 2200 characters'),
  handleValidation,
];

export const validateAddComment = [
  body('text')
    .trim()
    .notEmpty().withMessage('Comment text is required')
    .isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters'),
  handleValidation,
];
