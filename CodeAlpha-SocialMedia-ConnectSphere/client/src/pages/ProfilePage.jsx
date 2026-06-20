import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserById, updateProfile, followUser, unfollowUser, getUserPosts } from '../services/userService';
import MainLayout from '../layouts/MainLayout';
import UserAvatar from '../components/UserAvatar';
import PostCard from '../components/PostCard';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser, updateUserData } = useAuth();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState('');

  // Edit form state
  const [editing, setEditing] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const fileRef = useRef(null);

  // Follow state
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  const isOwnProfile = currentUser?._id?.toString() === id;

  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    setError('');
    try {
      const res = await getUserById(id);
      const userData = res.data;
      setProfileUser(userData);
      setEditUsername(userData.username ?? '');
      setEditBio(userData.bio ?? '');
      const followers = Array.isArray(userData.followers) ? userData.followers : [];
      setFollowerCount(followers.length);
      setFollowing(
        followers.some(
          (f) => (typeof f === 'string' ? f : f?._id?.toString()) === currentUser?._id?.toString()
        )
      );
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to load profile');
    } finally {
      setLoadingProfile(false);
    }
  }, [id, currentUser?._id]);

  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const res = await getUserPosts(id);
      const { posts: userPosts } = res.data;
      setPosts(userPosts || []);
    } catch {
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [fetchProfile, fetchPosts]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return; }
    setEditImageFile(file);
    setEditImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const formData = new FormData();
      if (editUsername.trim()) formData.append('username', editUsername.trim());
      formData.append('bio', editBio.trim());
      if (editImageFile) formData.append('image', editImageFile);

      const res = await updateProfile(formData);
      const updated = res.data;
      setProfileUser(updated);
      updateUserData(updated);
      setEditing(false);
      setEditImageFile(null);
      setEditImagePreview('');
      toast.success('Profile updated! ✅');
    } catch (err) {
      setSaveError(err.response?.data?.message ?? 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      if (following) {
        await unfollowUser(id);
        setFollowing(false);
        setFollowerCount((c) => Math.max(0, c - 1));
        toast.success('Unfollowed');
      } else {
        await followUser(id);
        setFollowing(true);
        setFollowerCount((c) => c + 1);
        toast.success('Following! 🎉');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <MainLayout>
        <div className="loading-center" style={{ paddingTop: 80 }}>
          <div className="spinner spinner-lg" />
          <span>Loading profile…</span>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="loading-center" style={{ paddingTop: 80 }}>
          <div className="empty-state-icon">😕</div>
          <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>{error}</p>
          <button className="btn-secondary" onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </MainLayout>
    );
  }

  const followingCount = Array.isArray(profileUser?.following) ? profileUser.following.length : 0;
  // Use the edited preview while editing, otherwise the saved value
  const displayAvatar = editImagePreview ? { url: editImagePreview } : profileUser?.profilePic;

  return (
    <MainLayout>
      <div className="profile-page-content">
        {/* ── Profile Header Card ──────────────────────────────────────────── */}
        <div className="profile-header-card">
          <div className="profile-cover-area">
            <div className="profile-cover-gradient" />

            <div className="profile-info-row">
              {/* Avatar */}
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <UserAvatar src={displayAvatar} username={profileUser?.username} size="lg" />
                {editing && isOwnProfile && (
                  <>
                    <button
                      className="avatar-upload-btn"
                      onClick={() => fileRef.current?.click()}
                      title="Change photo"
                    >
                      📷
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleImageChange}
                    />
                  </>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <h1 className="profile-username">{profileUser?.username}</h1>
                {profileUser?.bio ? (
                  <p className="profile-bio">{profileUser.bio}</p>
                ) : isOwnProfile ? (
                  <p className="profile-bio" style={{ fontStyle: 'italic', opacity: 0.5 }}>
                    No bio yet — click Edit to add one.
                  </p>
                ) : null}

                <div className="profile-stats">
                  <div className="profile-stat">
                    <span className="profile-stat-value">{posts.length}</span>
                    <span className="profile-stat-label">Posts</span>
                  </div>
                  <div className="profile-stat">
                    <span className="profile-stat-value">{followerCount}</span>
                    <span className="profile-stat-label">Followers</span>
                  </div>
                  <div className="profile-stat">
                    <span className="profile-stat-value">{followingCount}</span>
                    <span className="profile-stat-label">Following</span>
                  </div>
                </div>

                <div className="profile-actions">
                  {isOwnProfile ? (
                    <button
                      className="btn-secondary"
                      onClick={() => { setEditing((v) => !v); setSaveError(''); }}
                    >
                      {editing ? '✕ Cancel' : '✏️ Edit Profile'}
                    </button>
                  ) : (
                    <button
                      className="btn-primary"
                      onClick={handleFollow}
                      disabled={followLoading}
                      style={
                        following
                          ? { background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', boxShadow: 'none' }
                          : {}
                      }
                    >
                      {followLoading ? (
                        <span className="spinner" style={{ width: 14, height: 14 }} />
                      ) : following ? (
                        '✓ Following'
                      ) : (
                        '+ Follow'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── Edit Form ────────────────────────────────────────────────── */}
            {editing && isOwnProfile && (
              <div className="profile-edit-form">
                {saveError && (
                  <div className="alert alert-error">
                    <span>⚠️</span> {saveError}
                  </div>
                )}
                <div>
                  <label htmlFor="edit-username" style={{ display: 'block', marginBottom: 6, fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                    Username
                  </label>
                  <input
                    id="edit-username"
                    type="text"
                    className="input-field"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    placeholder="Your username"
                  />
                </div>
                <div>
                  <label htmlFor="edit-bio" style={{ display: 'block', marginBottom: 6, fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                    Bio
                  </label>
                  <textarea
                    id="edit-bio"
                    className="input-field"
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Tell the world about yourself…"
                    rows={3}
                    maxLength={200}
                  />
                  <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    {editBio.length}/200
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  <button className="btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <><span className="spinner" style={{ width: 14, height: 14 }} /> Saving…</>
                    ) : (
                      '✓ Save Changes'
                    )}
                  </button>
                  <button className="btn-secondary" onClick={() => setEditing(false)} disabled={saving}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Posts Section ────────────────────────────────────────────────── */}
        <div className="profile-posts-section">
          <h2 className="profile-posts-title">
            {isOwnProfile ? 'Your Posts' : `${profileUser?.username}'s Posts`}
          </h2>

          {loadingPosts && (
            <div className="loading-center">
              <div className="spinner" />
              <span>Loading posts…</span>
            </div>
          )}

          {!loadingPosts && posts.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <h3 className="empty-state-title">No posts yet</h3>
              <p className="empty-state-desc">
                {isOwnProfile
                  ? 'Share something from the feed!'
                  : `${profileUser?.username} hasn't posted anything yet.`}
              </p>
              {isOwnProfile && (
                <button
                  className="btn-primary"
                  style={{ marginTop: 'var(--space-md)' }}
                  onClick={() => navigate('/feed')}
                >
                  Go to Feed
                </button>
              )}
            </div>
          )}

          {!loadingPosts &&
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onDelete={(pid) => setPosts((p) => p.filter((x) => x._id !== pid))}
                onLikeToggle={() => {}}
              />
            ))}
        </div>
      </div>
    </MainLayout>
  );
}
