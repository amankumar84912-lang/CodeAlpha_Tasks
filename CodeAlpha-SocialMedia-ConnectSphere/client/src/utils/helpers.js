/**
 * Returns a human-readable relative time string.
 * @param {string|Date} dateStr
 */
export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Formats a number with K/M suffixes for display.
 * @param {number} n
 */
export function formatCount(n) {
  if (!n || n < 1000) return String(n ?? 0);
  if (n < 1_000_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
}

/**
 * Extracts a URL string from a profilePic value that may be a string or
 * the v2 object shape { url, publicId }.
 * @param {string|{url:string}|null} profilePic
 */
export function getAvatarUrl(profilePic) {
  if (!profilePic) return '';
  if (typeof profilePic === 'string') return profilePic;
  return profilePic.url || '';
}

/**
 * Extracts a URL string from a post image value that may be a string or
 * the v2 object shape { url, publicId }.
 * @param {string|{url:string}|null} image
 */
export function getImageUrl(image) {
  if (!image) return '';
  if (typeof image === 'string') return image;
  return image.url || '';
}
