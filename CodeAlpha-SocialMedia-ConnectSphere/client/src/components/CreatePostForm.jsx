import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createPost } from '../services/postService';
import UserAvatar from './UserAvatar';
import toast from 'react-hot-toast';

const MAX_CHARS = 500;

export default function CreatePostForm({ onPostCreated }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showDropzone, setShowDropzone] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const charCount = content.length;
  const charOver = charCount > MAX_CHARS;
  const charWarn = charCount > MAX_CHARS * 0.85;

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Image must be smaller than 8 MB');
      return;
    }
    setImageFile(file);
    setShowDropzone(false);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !imageFile) {
      toast.error('Write something or add an image');
      return;
    }
    if (charOver) {
      toast.error(`Post is too long (max ${MAX_CHARS} characters)`);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      if (content.trim()) formData.append('content', content.trim());
      if (imageFile) formData.append('image', imageFile);

      const res = await createPost(formData);
      setContent('');
      removeImage();
      setShowDropzone(false);
      toast.success('Post published! 🎉');
      if (onPostCreated) onPostCreated(res.data?.post ?? res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-card">
      <form onSubmit={handleSubmit}>
        <div className="create-post-top">
          <UserAvatar
            src={user?.profilePic}
            username={user?.username}
            size="md"
            onClick={() => user?._id && navigate(`/profile/${user._id}`)}
            style={{ cursor: 'pointer' }}
          />
          <div className="create-post-form">
            <textarea
              className="create-post-textarea"
              placeholder={`What's on your mind, ${user?.username?.split(' ')[0] ?? 'there'}?`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={1}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 240)}px`;
              }}
            />
          </div>
        </div>

        {/* Image preview */}
        {imagePreview && (
          <div className="create-post-image-preview">
            <img src={imagePreview} alt="Preview" />
            <button
              type="button"
              className="create-post-img-remove"
              onClick={removeImage}
              aria-label="Remove image"
            >
              ✕
            </button>
          </div>
        )}

        {/* Drag & drop zone */}
        {showDropzone && !imagePreview && (
          <div
            className={`create-post-dropzone${dragOver ? ' drag-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <span className="create-post-dropzone-icon">🖼️</span>
            <p className="create-post-dropzone-text">
              <strong>Drop an image here</strong> or click to browse
              <br />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-disabled)' }}>
                PNG, JPG, WEBP up to 8 MB
              </span>
            </p>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {/* Footer */}
        <div className="create-post-footer">
          <div className="create-post-actions">
            <button
              type="button"
              className={`create-post-icon-btn${showDropzone ? ' active' : ''}`}
              onClick={() => setShowDropzone((v) => !v)}
              aria-label="Add image"
              title="Add image"
            >
              📷
            </button>
          </div>

          <div className="create-post-right">
            {charCount > 0 && (
              <span className={`char-counter${charOver ? ' danger' : charWarn ? ' warn' : ''}`}>
                {MAX_CHARS - charCount}
              </span>
            )}
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={loading || (!content.trim() && !imageFile) || charOver}
            >
              {loading ? (
                <>
                  <span className="spinner spinner-xs" />
                  Posting…
                </>
              ) : (
                <>✦ Post</>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
