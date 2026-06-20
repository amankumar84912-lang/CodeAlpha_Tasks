import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';
import CreatePostForm from './CreatePostForm';
import logoImg from '../assets/logo.png';
import toast from 'react-hot-toast';

// SVG icons — clean, professional, consistent
const Icons = {
  Home: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Bell: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Logout: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Menu: () => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  Close: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Chevron: ({ open }) => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
};

const NAV_LINKS = [
  { path: '/feed',   label: 'Feed',   Icon: Icons.Home },
  { path: '/search', label: 'Search', Icon: Icons.Search },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => setDrawerOpen(false), [location.pathname]);

  const handleLogout = () => {
    setDropdownOpen(false);
    setDrawerOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  const isActive = (path) => location.pathname.startsWith(path);
  const navTo    = (path) => { navigate(path); setDrawerOpen(false); };

  return (
    <>
      <nav className="navbar">
        {/* Mobile hamburger */}
        <button className="navbar-mobile-btn" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
          <Icons.Menu />
        </button>

        {/* Logo */}
        <a className="navbar-logo" href="/feed" onClick={(e) => { e.preventDefault(); navigate('/feed'); }}>
          <img src={logoImg} alt="ConnectSphere" className="navbar-logo-img" />
          <span className="navbar-logo-text">ConnectSphere</span>
        </a>

        {/* Desktop nav links */}
        <div className="navbar-nav">
          {NAV_LINKS.map(({ path, label, Icon }) => (
            <a
              key={path}
              className={`navbar-nav-link${isActive(path) ? ' active' : ''}`}
              href={path}
              onClick={(e) => { e.preventDefault(); navigate(path); }}
            >
              <Icon />
              <span>{label}</span>
            </a>
          ))}
          {user?._id && (
            <a
              className={`navbar-nav-link${isActive('/profile') ? ' active' : ''}`}
              href={`/profile/${user._id}`}
              onClick={(e) => { e.preventDefault(); navigate(`/profile/${user._id}`); }}
            >
              <Icons.User />
              <span>Profile</span>
            </a>
          )}
        </div>

        {/* User dropdown */}
        <div className="navbar-right">
          <div className="navbar-user" ref={dropdownRef}>
            <button
              className="navbar-user-btn"
              onClick={() => setDropdownOpen((o) => !o)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              <UserAvatar src={user?.profilePic} username={user?.username} size="sm" />
              <span className="navbar-username">{user?.username ?? 'Account'}</span>
              <Icons.Chevron open={dropdownOpen} />
            </button>

            {dropdownOpen && (
              <div className="navbar-dropdown" role="menu">
                <div className="navbar-dropdown-header">
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>
                    Signed in as
                  </div>
                  <div className="navbar-dropdown-username">{user?.username}</div>
                  <div className="navbar-dropdown-email">{user?.email}</div>
                </div>

                <button
                  className="navbar-dropdown-item"
                  onClick={() => { setDropdownOpen(false); user?._id && navigate(`/profile/${user._id}`); }}
                  role="menuitem"
                >
                  <Icons.User />
                  <span>View Profile</span>
                </button>

                <button
                  className="navbar-dropdown-item"
                  onClick={() => { setDropdownOpen(false); navigate('/search'); }}
                  role="menuitem"
                >
                  <Icons.Search />
                  <span>Search Users</span>
                </button>

                <div className="navbar-dropdown-divider" />

                <button className="navbar-dropdown-item danger" onClick={handleLogout} role="menuitem">
                  <Icons.Logout />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          <div className="mobile-drawer-overlay" onClick={() => setDrawerOpen(false)} />
          <aside className="mobile-drawer" aria-label="Navigation menu">
            <div className="mobile-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src={logoImg} alt="" className="navbar-logo-img" style={{ width: 32, height: 32 }} />
                <span style={{ fontWeight: 800, fontSize: 'var(--text-lg)', background: 'var(--gradient-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  ConnectSphere
                </span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px 8px', display: 'flex' }}
                aria-label="Close menu"
              >
                <Icons.Close />
              </button>
            </div>

            {user && (
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <UserAvatar src={user.profilePic} username={user.username} size="md" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>{user.username}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{user.email}</div>
                </div>
              </div>
            )}

            <nav className="mobile-drawer-nav">
              {NAV_LINKS.map(({ path, label, Icon }) => (
                <button
                  key={path}
                  className={`mobile-nav-link${isActive(path) ? ' active' : ''}`}
                  onClick={() => navTo(path)}
                >
                  <div className="mobile-nav-icon"><Icon /></div>
                  <span>{label}</span>
                </button>
              ))}
              {user?._id && (
                <>
                  <button className="mobile-nav-link" onClick={() => { setDrawerOpen(false); setIsCreateOpen(true); }}>
                    <div className="mobile-nav-icon"><Icons.Plus /></div>
                    <span>Create Post</span>
                  </button>
                  <button className="mobile-nav-link" onClick={() => { setDrawerOpen(false); setIsNotificationsOpen(true); }}>
                    <div className="mobile-nav-icon"><Icons.Bell /></div>
                    <span>Notifications</span>
                  </button>
                  <button
                    className={`mobile-nav-link${isActive('/profile') ? ' active' : ''}`}
                    onClick={() => navTo(`/profile/${user._id}`)}
                  >
                    <div className="mobile-nav-icon"><Icons.User /></div>
                    <span>Profile</span>
                  </button>
                </>
              )}
            </nav>

            <div className="mobile-drawer-footer">
              <button className="btn btn-danger btn-full" onClick={handleLogout}>
                <Icons.Logout /> <span style={{ marginLeft: 6 }}>Logout</span>
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Bottom tab bar */}
      <div className="bottom-tab-bar">
        <button className={`bottom-tab-item${isActive('/feed') ? ' active' : ''}`} onClick={() => navigate('/feed')}>
          <span className="bottom-tab-icon"><Icons.Home /></span>
          <span>Feed</span>
        </button>
        <button className={`bottom-tab-item${isActive('/search') ? ' active' : ''}`} onClick={() => navigate('/search')}>
          <span className="bottom-tab-icon"><Icons.Search /></span>
          <span>Search</span>
        </button>
        {user?._id && (
          <>
            <button className="bottom-tab-item" onClick={() => setIsCreateOpen(true)}>
              <span className="bottom-tab-icon"><Icons.Plus /></span>
              <span>Create</span>
            </button>
            <button className="bottom-tab-item" onClick={() => setIsNotificationsOpen(true)}>
              <span className="bottom-tab-icon"><Icons.Bell /></span>
              <span>Alerts</span>
            </button>
            <button className={`bottom-tab-item${isActive('/profile') ? ' active' : ''}`} onClick={() => navigate(`/profile/${user._id}`)}>
              <span className="bottom-tab-icon"><Icons.User /></span>
              <span>Profile</span>
            </button>
          </>
        )}
      </div>

      {/* Create Post Modal */}
      {isCreateOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', padding: '20px', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="modal-title" style={{ margin: 0, fontSize: 'var(--text-lg)', textAlign: 'left' }}>Create New Post</h3>
              <button onClick={() => setIsCreateOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>
            <CreatePostForm onPostCreated={(newPost) => {
              setIsCreateOpen(false);
              const event = new CustomEvent('post-created', { detail: newPost });
              window.dispatchEvent(event);
              navigate('/feed');
            }} />
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {isNotificationsOpen && (
        <div className="modal-overlay" onClick={() => setIsNotificationsOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', padding: '24px', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="modal-title" style={{ margin: 0, fontSize: 'var(--text-lg)', textAlign: 'left' }}>Notifications</h3>
              <button onClick={() => setIsNotificationsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '350px', overflowY: 'auto' }}>
              {[
                { username: 'alex_mercer', action: 'started following you', time: '5m ago', icon: '👤' },
                { username: 'sarah_designer', action: 'liked your recent post', time: '15m ago', icon: '❤️' },
                { username: 'david_chen', action: 'commented: "Great project setup! 🚀"', time: '1h ago', icon: '💬' },
                { username: 'elena_rostova', action: 'liked your comment', time: '3h ago', icon: '👍' },
                { username: 'alex_mercer', action: 'published a new post', time: '5h ago', icon: '📝' },
              ].map((notif, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '20px' }}>{notif.icon}</div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>{notif.username}</span>{' '}
                    <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>{notif.action}</span>
                    <div style={{ fontSize: '10px', color: 'var(--text-disabled)', marginTop: '2px' }}>{notif.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
