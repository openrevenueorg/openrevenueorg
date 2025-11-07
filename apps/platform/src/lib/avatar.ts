/**
 * Avatar Utilities
 *
 * Uses unavatar.io for fetching avatars from various sources
 * with fallback to boringavatars.com for unique generated avatars
 */

export interface AvatarOptions {
  size?: number;
  fallbackSeed?: string;
}

const BORING_AVATAR_COLORS = '264653,2a9d8f,e9c46a,f4a261,e76f51';

/**
 * Generate a boring avatars URL as fallback
 */
function getBoringAvatarUrl(seed: string, size: number = 120): string {
  return `https://source.boringavatars.com/marble/${size}/${encodeURIComponent(seed)}?colors=${BORING_AVATAR_COLORS}`;
}

/**
 * Get avatar URL from GitHub username
 */
export function getGitHubAvatar(username: string, options: AvatarOptions = {}): string {
  const { size = 120, fallbackSeed = username } = options;
  const fallback = encodeURIComponent(getBoringAvatarUrl(fallbackSeed, size));
  return `https://unavatar.io/github/${username}?fallback=${fallback}`;
}

/**
 * Get avatar URL from Twitter/X handle
 */
export function getTwitterAvatar(handle: string, options: AvatarOptions = {}): string {
  const { size = 120, fallbackSeed = handle } = options;
  const cleanHandle = handle.replace('@', '');
  const fallback = encodeURIComponent(getBoringAvatarUrl(fallbackSeed, size));
  return `https://unavatar.io/twitter/${cleanHandle}?fallback=${fallback}`;
}

/**
 * Get avatar URL from email
 */
export function getEmailAvatar(email: string, options: AvatarOptions = {}): string {
  const { size = 120, fallbackSeed = email } = options;
  const fallback = encodeURIComponent(getBoringAvatarUrl(fallbackSeed, size));
  return `https://unavatar.io/${email}?fallback=${fallback}`;
}

/**
 * Get avatar URL from Instagram handle
 */
export function getInstagramAvatar(handle: string, options: AvatarOptions = {}): string {
  const { size = 120, fallbackSeed = handle } = options;
  const fallback = encodeURIComponent(getBoringAvatarUrl(fallbackSeed, size));
  return `https://unavatar.io/instagram/${handle}?fallback=${fallback}`;
}

/**
 * Get avatar URL from any custom URL or generate fallback
 */
export function getAvatarUrl(
  source: {
    customUrl?: string | null;
    githubHandle?: string | null;
    twitterHandle?: string | null;
    instagramHandle?: string | null;
    email?: string | null;
    name?: string | null;
    id?: string;
  },
  options: AvatarOptions = {}
): string {
  const { size = 120 } = options;

  // Priority order: custom URL > GitHub > Twitter > Instagram > Email > Generated

  if (source.customUrl) {
    return source.customUrl;
  }

  const fallbackSeed = source.name || source.email || source.id || 'default';

  if (source.githubHandle) {
    return getGitHubAvatar(source.githubHandle, { size, fallbackSeed });
  }

  if (source.twitterHandle) {
    return getTwitterAvatar(source.twitterHandle, { size, fallbackSeed });
  }

  if (source.instagramHandle) {
    return getInstagramAvatar(source.instagramHandle, { size, fallbackSeed });
  }

  if (source.email) {
    return getEmailAvatar(source.email, { size, fallbackSeed });
  }

  // Final fallback to boring avatars
  return getBoringAvatarUrl(fallbackSeed, size);
}

/**
 * Get startup logo URL with fallback
 */
export function getStartupLogoUrl(startup: {
  logo?: string | null;
  githubHandle?: string | null;
  twitterHandle?: string | null;
  name: string;
  slug: string;
}): string {
  return getAvatarUrl({
    customUrl: startup.logo,
    githubHandle: startup.githubHandle,
    twitterHandle: startup.twitterHandle,
    name: startup.name,
    id: startup.slug,
  });
}

/**
 * Get user avatar URL with fallback
 */
export function getUserAvatarUrl(user: {
  image?: string | null;
  email?: string | null;
  name?: string | null;
  id: string;
}): string {
  return getAvatarUrl({
    customUrl: user.image,
    email: user.email,
    name: user.name,
    id: user.id,
  });
}
