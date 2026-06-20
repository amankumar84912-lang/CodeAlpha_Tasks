import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { addComment } from '../services/postService';
import UserAvatar from './UserAvatar';
import { useAuth } from '../context/AuthContext';
import { timeAgo } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function CommentSection({ postId, comments, onCommentAdded }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      const res = await addComment(postId, trimmed);
      const newComment = res.data?.comment ?? res.data;
      onCommentAdded(newComment);
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="comments-section">
      {/* Comments list */}
      {comments.length > 0 ? (
        <div className="comments-list">
          {comments.map((comment, i) => {
            const author = comment.user ?? comment.userId ?? {};
            const authorId = author._id ?? author;
            const authorUsername = author.username ?? 'Unknown';
            const authorPic = author.profilePic;

            return (
              <div key={comment._id ?? i} className="comment-item">
                <UserAvatar
                  src={authorPic}
                  username={authorUsername}
                  size="sm"
                  onClick={() => authorId && navigate(`/profile/${authorId}`)}
                  style={{ cursor: 'pointer', flexShrink: 0 }}
                />
                <div className="comment-bubble">
                  <div className="comment-header">
                    <span
                      className="comment-username"
                      onClick={() => authorId && navigate(`/profile/${authorId}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && authorId && navigate(`/profile/${authorId}`)}
                    >
                      {authorUsername}
                    </span>
                    <span className="comment-time">{timeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="comment-text">{comment.text ?? comment.content ?? ''}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="comments-empty">No comments yet. Be the first! 💬</p>
      )}

      {/* Comment input */}
      <form onSubmit={handleSubmit} className="comment-input-row">
        <UserAvatar src={user?.profilePic} username={user?.username} size="sm" style={{ flexShrink: 0 }} />
        <textarea
          ref={textareaRef}
          className="input-field"
          placeholder="Write a comment…"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
          }}
          onKeyDown={handleKeyDown}
          rows={1}
          maxLength={500}
          aria-label="Write a comment"
        />
        <button
          type="submit"
          className="comment-submit-btn"
          disabled={submitting || !text.trim()}
        >
          {submitting ? <span className="spinner spinner-xs" /> : '↑'}
        </button>
      </form>
    </div>
  );
}
