import { getAvatarUrl } from '../utils/helpers';

const SIZES = { sm: 32, md: 44, lg: 80 };

// Deterministic gradient per username initial for consistent colours
function getGradient(username) {
  const palettes = [
    ['#9d6fff', '#6f9dff'],
    ['#ff6fb4', '#ff9d6f'],
    ['#6fffb4', '#6f9dff'],
    ['#ffb46f', '#ff6f9d'],
    ['#6fb4ff', '#b46fff'],
    ['#6fffd4', '#6fb4ff'],
  ];
  let hash = 0;
  for (let i = 0; i < (username || '').length; i++) {
    hash = (hash + username.charCodeAt(i)) % palettes.length;
  }
  return palettes[hash];
}

/**
 * Renders a circular avatar.
 * - If src resolves to a URL (string or {url,publicId}), shows the image.
 * - Otherwise shows gradient initials fallback.
 *
 * @param {{ src?: string|{url:string}, username?: string, size?: 'sm'|'md'|'lg', style?: object }} props
 */
export default function UserAvatar({ src, username = '', size = 'md', style = {} }) {
  const px = SIZES[size] || SIZES.md;
  const avatarUrl = getAvatarUrl(src);
  const initials = (username || '?').charAt(0).toUpperCase();
  const [color1, color2] = getGradient(username);

  const base = {
    width: px,
    height: px,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'block',
    ...style,
  };

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`${username}'s avatar`}
        style={{ ...base, objectFit: 'cover' }}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  return (
    <div
      style={{
        ...base,
        background: `linear-gradient(135deg, ${color1}, ${color2})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 700,
        fontSize: px * 0.38,
        userSelect: 'none',
      }}
      aria-label={`${username}'s avatar`}
    >
      {initials}
    </div>
  );
}
