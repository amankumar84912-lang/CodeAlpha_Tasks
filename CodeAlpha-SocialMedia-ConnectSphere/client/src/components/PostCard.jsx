import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { likePost, deletePost } from '../services/postService';
import UserAvatar from './UserAvatar';
import CommentSection from './CommentSection';
import { timeAgo, getImageUrl } from '../utils/helpers';
import toast from 'react-hot-toast';

function DeleteModal({ onConfirm, onCancel, loading }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <span className="modal-icon">🗑️</span>
        <h2 className="modal-title">Delete Post?</h2>
        <p className="modal-desc">This action cannot be undone. Your post will be permanently removed.</p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <span className="spinner spinner-xs" /> : null}
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PostCard({ post, onDelete, onLikeToggle }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const postAuthor = post.user ?? {};
  const isOwner =
    user?._id &&
    (postAuthor._id?.toString() === user._id?.toString() ||
      post.userId?.toString() === user._id?.toString());

  const likesArr = Array.isArray(post.likes) ? post.likes : [];
  const initiallyLiked = user?._id
    ? likesArr.some(
        (l) => (typeof l === 'string' ? l : l?._id?.toString()) === user._id?.toString()
      )
    : false;

  const [liked, setLiked] = useState(initiallyLiked);
  const [likeCount, setLikeCount] = useState(likesArr.length);
  const [likeAnim, setLikeAnim] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(Array.isArray(post.comments) ? post.comments : []);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [shared, setShared] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLike = async () => {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 400);

    try {
      const res = await likePost(post._id);
      setLiked(res.data.liked);
      setLikeCount(res.data.likesCount);
      if (onLikeToggle) onLikeToggle(post._id);
    } catch {
      setLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
      toast.error('Failed to update like');
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await deletePost(post._id);
      toast.success('Post deleted');
      setShowDeleteModal(false);
      if (onDelete) onDelete(post._id);
    } catch (err) {
      setDeleting(false);
      toast.error(err.response?.data?.message || 'Failed to delete post');
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/feed`;
    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      toast.success('Link copied!');
      setTimeout(() => setShared(false), 2000);
    } catch {
      toast.error('Could not copy link');
    }
  };

  const imageSrc = getImageUrl(post.image);

  return (
    <>
      <article className="post-card">
        {/* Header */}
        <div className="post-card-header">
          <UserAvatar
            src={postAuthor.profilePic}
            username={postAuthor.username}
            size="md"
            onClick={() => postAuthor._id && navigate(`/profile/${postAuthor._id}`)}
            style={{ cursor: 'pointer' }}
          />
          <div className="post-card-header-info">
            <div
              className="post-card-username"
              onClick={() => postAuthor._id && navigate(`/profile/${postAuthor._id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && postAuthor._id && navigate(`/profile/${postAuthor._id}`)}
            >
              {postAuthor.username ?? 'Unknown'}
            </div>
            <div className="post-card-time">{timeAgo(post.createdAt)}</div>
          </div>

          {isOwner && (
            <div className="post-card-menu" ref={menuRef}>
              <button
                className="post-card-menu-btn"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Post options"
              >
                ⋯
              </button>
              {menuOpen && (
                <div className="post-card-menu-dropdown">
                  <button
                    className="post-card-menu-item"
                    onClick={() => { setMenuOpen(false); setShowDeleteModal(true); }}
                  >
                    🗑️ Delete Post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="post-card-body">
          {post.content && <p className="post-card-content">{post.content}</p>}
          {imageSrc && (
            <img
              src={imageSrc}
              alt="Post attachment"
              className="post-card-image"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="post-card-footer">
          <button
            className={`post-action-btn${liked ? ' liked' : ''}`}
            onClick={handleLike}
            aria-label={liked ? 'Unlike post' : 'Like post'}
          >
            <span className={likeAnim ? 'heart-pop' : ''} style={{ fontSize: '1.1em' }}>
              {liked ? '❤️' : '🤍'}
            </span>
            <span>{likeCount > 0 ? likeCount : ''}{' '}{likeCount === 1 ? 'Like' : 'Likes'}</span>
          </button>

          <button
            className={`post-action-btn${showComments ? ' active' : ''}`}
            onClick={() => setShowComments((v) => !v)}
            aria-label="Toggle comments"
          >
            <span style={{ fontSize: '1.1em' }}>💬</span>
            <span>
              {comments.length > 0 ? `${comments.length} ` : ''}
              {comments.length === 1 ? 'Comment' : 'Comments'}
            </span>
          </button>

          <div className="post-action-spacer" />

          <button
            className={`post-action-btn${shared ? ' active' : ''}`}
            onClick={handleShare}
            aria-label="Share post"
            title="Copy link"
          >
            <span style={{ fontSize: '1em' }}>{shared ? '✅' : '🔗'}</span>
            <span>{shared ? 'Copied!' : 'Share'}</span>
          </button>
        </div>

        {showComments && (
          <CommentSection
            postId={post._id}
            comments={comments}
            onCommentAdded={(c) => setComments((prev) => [...prev, c])}
          />
        )}
      </article>

      {showDeleteModal && (
        <DeleteModal
          onConfirm={handleDeleteConfirm}
          onCancel={() => { setShowDeleteModal(false); setDeleting(false); }}
          loading={deleting}
        />
      )}
    </>
  );
}
