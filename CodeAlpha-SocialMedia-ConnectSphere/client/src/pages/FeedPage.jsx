import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import CreatePostForm from '../components/CreatePostForm';
import PostCard from '../components/PostCard';
import UserAvatar from '../components/UserAvatar';
import { getFeedPosts } from '../services/postService';
import { getAllUsers, followUser, unfollowUser } from '../services/userService';
import toast from 'react-hot-toast';

function SkeletonCard() {
  return (
    <div className="post-card" style={{ padding: 'var(--space-md)' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div className="skeleton skeleton-avatar" />
        <div style={{ flex: 1 }}>
          <div className="skeleton skeleton-line" style={{ width: '40%', marginBottom: 6 }} />
          <div className="skeleton skeleton-line" style={{ width: '25%', height: 10 }} />
        </div>
      </div>
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-line skeleton-line-short" />
    </div>
  );
}

function SuggestedUsers({ currentUser }) {
  const navigate = useNavigate();
  const [users, setUsers]           = useState([]);
  const [followingIds, setFollowingIds] = useState(new Set());
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    if (currentUser?.following) {
      setFollowingIds(new Set(
        currentUser.following.map(id => typeof id === 'string' ? id : id?.toString())
      ));
    }
  }, [currentUser]);

  useEffect(() => {
    getAllUsers()
      .then(res => {
        const all = Array.isArray(res.data) ? res.data : [];
        setUsers(all.filter(u => u._id?.toString() !== currentUser?._id?.toString()).slice(0, 5));
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [currentUser?._id]);

  const handleFollow = async (userId) => {
    const isFollowing = followingIds.has(userId);
    setFollowingIds(prev => {
      const next = new Set(prev);
      if (isFollowing) next.delete(userId); else next.add(userId);
      return next;
    });
    try {
      if (isFollowing) { await unfollowUser(userId); toast.success('Unfollowed'); }
      else             { await followUser(userId);   toast.success('Following! 🎉'); }
    } catch (err) {
      setFollowingIds(prev => {
        const next = new Set(prev);
        if (isFollowing) next.add(userId); else next.delete(userId);
        return next;
      });
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  if (loading) {
    return (
      <div className="sidebar-card">
        <div className="sidebar-card-title">People to Follow</div>
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0' }}>
            <div className="skeleton skeleton-avatar" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton skeleton-line" style={{ width: '60%', marginBottom: 4 }} />
              <div className="skeleton skeleton-line" style={{ width: '40%', height: 10 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) return null;

  return (
    <div className="sidebar-card">
      <div className="sidebar-card-title">People to Follow</div>
      {users.map(u => {
        const uid = u._id?.toString();
        const isFollowing = followingIds.has(uid);
        return (
          <div key={uid} className="sidebar-user-row">
            <div
              className="sidebar-user-info"
              onClick={() => navigate(`/profile/${uid}`)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && navigate(`/profile/${uid}`)}
            >
              <UserAvatar src={u.profilePic} username={u.username} size="sm" />
              <div className="sidebar-user-text">
                <span className="sidebar-user-name">{u.username}</span>
                <span className="sidebar-user-meta">{u.followers?.length ?? 0} followers</span>
              </div>
            </div>
            <button
              className={`sidebar-follow-btn${isFollowing ? ' following' : ''}`}
              onClick={() => handleFollow(uid)}
            >
              {isFollowing ? '✓' : '+'}
            </button>
          </div>
        );
      })}
      <button
        className="sidebar-see-more"
        onClick={() => navigate('/search')}
      >
        See more people →
      </button>
    </div>
  );
}

function ProfileCard({ user }) {
  const navigate = useNavigate();
  if (!user) return null;
  const followersCount = user.followers?.length ?? 0;
  const followingCount = user.following?.length ?? 0;

  return (
    <div className="sidebar-card sidebar-profile-card" onClick={() => navigate(`/profile/${user._id}`)} style={{ cursor: 'pointer' }}>
      <div className="sidebar-profile-cover" />
      <div className="sidebar-profile-inner">
        <UserAvatar src={user.profilePic} username={user.username} size="md" />
        <div className="sidebar-profile-name">{user.username}</div>
        {user.bio && <div className="sidebar-profile-bio">{user.bio}</div>}
        <div className="sidebar-profile-stats">
          <div className="sidebar-stat">
            <span className="sidebar-stat-val">{followersCount}</span>
            <span className="sidebar-stat-lbl">Followers</span>
          </div>
          <div className="sidebar-stat-divider" />
          <div className="sidebar-stat">
            <span className="sidebar-stat-val">{followingCount}</span>
            <span className="sidebar-stat-lbl">Following</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeedPage() {
  const { user } = useAuth();
  const [posts,       setPosts]      = useState([]);
  const [loading,     setLoading]    = useState(true);
  const [loadingMore, setLoadingMore]= useState(false);
  const [error,       setError]      = useState('');
  const [page,        setPage]       = useState(1);
  const [totalPages,  setTotalPages] = useState(1);

  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);
    setError('');
    try {
      const res = await getFeedPosts(pageNum);
      const { posts: newPosts, pages } = res.data;
      setTotalPages(pages || 1);
      setPage(pageNum);
      if (append) setPosts(prev => [...prev, ...newPosts]);
      else        setPosts(newPosts);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load posts';
      setError(msg);
      if (!append) toast.error(msg);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { fetchPosts(1); }, [fetchPosts]);

  useEffect(() => {
    const handleCustomPost = (e) => {
      if (e.detail) {
        setPosts(prev => {
          // Avoid duplicates if already added
          if (prev.some(p => p._id === e.detail._id)) return prev;
          return [e.detail, ...prev];
        });
      }
    };
    window.addEventListener('post-created', handleCustomPost);
    return () => window.removeEventListener('post-created', handleCustomPost);
  }, []);

  const handlePostCreated = (newPost) => { if (newPost) setPosts(prev => [newPost, ...prev]); };
  const handleDelete      = (postId)  => setPosts(prev => prev.filter(p => p._id !== postId));
  const handleLoadMore    = ()        => { if (!loadingMore && page < totalPages) fetchPosts(page + 1, true); };

  return (
    <MainLayout>
      <div className="feed-dashboard">
        {/* ── Main Feed Column ─────────────────────────── */}
        <div className="feed-main">
          <CreatePostForm onPostCreated={handlePostCreated} />

          <div className="section-divider">Recent Posts</div>

          {error && (
            <div className="alert alert-error">
              <span>⚠️</span>
              <span>{error}</span>
              <button className="btn-ghost" onClick={() => fetchPosts(1)} style={{ marginLeft: 'auto', padding: '2px 12px' }}>
                Retry
              </button>
            </div>
          )}

          {loading && (
            <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
          )}

          {!loading && !error && posts.length > 0 &&
            posts.map(post => (
              <PostCard key={post._id} post={post} onDelete={handleDelete} onLikeToggle={() => {}} />
            ))
          }

          {!loading && !error && posts.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">🌐</div>
              <h3 className="empty-state-title">Your feed is empty</h3>
              <p className="empty-state-desc">
                Follow people or create your first post to see content here!
              </p>
            </div>
          )}

          {!loading && page < totalPages && (
            <div className="load-more-container">
              <button className="btn-secondary load-more-btn" onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? <><span className="spinner" style={{ width: 14, height: 14 }} />Loading…</> : 'Load More Posts'}
              </button>
            </div>
          )}
        </div>

        {/* ── Right Sidebar ─────────────────────────────── */}
        <aside className="feed-sidebar">
          <ProfileCard user={user} />
          <SuggestedUsers currentUser={user} />

          {/* App tag */}
          <div className="sidebar-footer-text">
            ConnectSphere © {new Date().getFullYear()}
            <br />
            <span style={{ fontSize: 11 }}>Built with ❤️ by CodeAlpha</span>
          </div>
        </aside>
      </div>
    </MainLayout>
  );
}
