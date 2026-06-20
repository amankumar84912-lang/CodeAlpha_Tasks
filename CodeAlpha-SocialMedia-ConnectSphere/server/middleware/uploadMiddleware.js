import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    const error = new Error('Only image files are allowed (jpeg, png, gif, webp)');
    error.statusCode = 400;
    cb(error, false);
  }
};

/**
 * Multer instance with in-memory storage and 5 MB file size limit.
 *
 * Usage on a route:  upload.single('image')
 * Uploaded file is available at req.file (buffer, mimetype, size, originalname).
 */
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter,
});
