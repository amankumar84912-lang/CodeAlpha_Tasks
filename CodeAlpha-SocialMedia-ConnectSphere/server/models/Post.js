import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Post must belong to a user'],
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      maxlength: [2200, 'Post content cannot exceed 2200 characters'],
    },
    // Stored as object so publicId is available for Cloudinary deletion
    image: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  },
  { timestamps: true }
);

const Post = mongoose.model('Post', postSchema);
export default Post;
