import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { searchUsers, followUser, unfollowUser, getAllUsers } from '../services/userService';
import MainLayout from '../layouts/MainLayout';
import UserAvatar from '../components/UserAvatar';
import { useDebounce } from '../hooks/useDebounce';
import toast from 'react-hot-toast';

function UserCard({ u, currentUserId, isFollowing, onFollow }) {
  const navigate = useNavigate();
  const uid = u._id?.toString();
  const isCurrentUser = uid === currentUserId?.toString();

  return (
    <div className="user-result-card">
      <div
        className="user-result-info"
        onClick={() => navigate(`/profile/${uid}`)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navigate(`/profile/${uid}`)}
      >
        <UserAvatar src={u.profilePic} username={u.username} size="md" />
        <div className="user-result-text">
          <span className="user-result-username">{u.username}</span>
          {u.bio && <span className="user-result-bio">{u.bio}</span>}
          <span className="user-result-meta">{u.followers?.length ?? 0} followers</span>
        </div>
      </div>
      {!isCurrentUser && (
        <button
          className={isFollowing ? 'btn-secondary' : 'btn-primary'}
          onClick={() => onFollow(uid)}
          style={{ minWidth: 90, padding: '6px 14px', flexShrink: 0 }}
        >
          {isFollowing ? '✓ Following' : '+ Follow'}
        </button>
      )}
    </div>
  );
}

export default function SearchPage() {
  const [query,       setQuery]       = useState('');
  const [results,     setResults]     = useState([]);
  const [suggested,   setSuggested]   = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [loadingSug,  setLoadingSug]  = useState(true);
  const [followingIds, setFollowingIds] = useState(new Set());

  const debouncedQuery = useDebounce(query, 400);
  const { user: currentUser } = useAuth();

  // Pre-populate following set from auth context
  useEffect(() => {
    if (currentUser?.following) {
      setFollowingIds(
        new Set(currentUser.following.map((id) => (typeof id === 'string' ? id : id?.toString())))
      );
    }
  }, [currentUser]);

  // Load suggested users on mount
  useEffect(() => {
    setLoadingSug(true);
    getAllUsers()
      .then((res) => {
        const all = Array.isArray(res.data) ? res.data : [];
        // Exclude self
        setSuggested(all.filter(u => u._id?.toString() !== currentUser?._id?.toString()));
      })
      .catch(() => setSuggested([]))
      .finally(() => setLoadingSug(false));
  }, [currentUser?._id]);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    searchUsers(debouncedQuery)
      .then((res) => setResults(Array.isArray(res.data) ? res.data : []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  const handleFollow = async (userId) => {
    const isFollowing = followingIds.has(userId);
    setFollowingIds((prev) => {
      const next = new Set(prev);
      if (isFollowing) next.delete(userId); else next.add(userId);
      return next;
    });
    try {
      if (isFollowing) { await unfollowUser(userId); toast.success('Unfollowed'); }
      else             { await followUser(userId);   toast.success('Following! 🎉'); }
    } catch (err) {
      setFollowingIds((prev) => {
        const next = new Set(prev);
        if (isFollowing) next.add(userId); else next.delete(userId);
        return next;
      });
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const showSearch    = debouncedQuery.trim().length > 0;
  const displayUsers  = showSearch ? results : suggested;

  return (
    <MainLayout>
      <div className="search-page">
        <div className="search-header">
          <h1 className="search-title">Find People</h1>
          <p className="search-subtitle">Discover and connect with people on ConnectSphere</p>
        </div>

        <div className="search-input-wrapper">
          <span className="search-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            id="search-input"
            type="text"
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username…"
            autoFocus
            autoComplete="off"
          />
          {query && (
            <button className="search-clear-btn" onClick={() => setQuery('')} aria-label="Clear search">
              ✕
            </button>
          )}
        </div>

        {/* Loading */}
        {(loading || (loadingSug && !showSearch)) && (
          <div className="search-results">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="user-result-card">
                <div className="user-result-info">
                  <div className="skeleton skeleton-avatar" />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton skeleton-line" style={{ width: '40%', marginBottom: 6 }} />
                    <div className="skeleton skeleton-line" style={{ width: '65%', height: 10 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results after search */}
        {!loading && showSearch && results.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🔎</div>
            <h3 className="empty-state-title">No users found</h3>
            <p className="empty-state-desc">Try a different username.</p>
          </div>
        )}

        {/* Section label */}
        {!loading && !loadingSug && displayUsers.length > 0 && (
          <div className="section-divider">
            {showSearch ? `Results for "${query}"` : 'Suggested People'}
          </div>
        )}

        {/* Results / Suggested */}
        {!loading && !loadingSug && displayUsers.length > 0 && (
          <div className="search-results">
            {displayUsers.map((u) => (
              <UserCard
                key={u._id}
                u={u}
                currentUserId={currentUser?._id}
                isFollowing={followingIds.has(u._id?.toString())}
                onFollow={handleFollow}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
