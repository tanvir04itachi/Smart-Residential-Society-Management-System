const REFRESH_TOKEN_COOKIE = 'rsms_refresh_token';
const REFRESH_TOKEN_MAX_AGE_DAYS = 7;

export function getRefreshToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${REFRESH_TOKEN_COOKIE}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function setRefreshToken(token: string): void {
  if (typeof document === 'undefined') return;
  const maxAge = REFRESH_TOKEN_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${REFRESH_TOKEN_COOKIE}=${encodeURIComponent(
    token,
  )}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearRefreshToken(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${REFRESH_TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function getLocaleFromPath(): string {
  if (typeof window === 'undefined') return 'en';
  const segment = window.location.pathname.split('/')[1];
  return segment === 'bn' ? 'bn' : 'en';
}
