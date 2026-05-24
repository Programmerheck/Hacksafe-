/** Derive wss:// from https:// when NEXT_PUBLIC_WS_URL is not set (Render/Railway). */
function httpToWsUrl(url: string): string {
  return url.replace(/^https:\/\//i, 'wss://').replace(/^http:\/\//i, 'ws://');
}

/** API base — uses env, or same LAN IP as the browser (for sharing with others on Wi‑Fi). */
export function getApiBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;

  if (typeof window !== 'undefined') {
    const { hostname, protocol } = window.location;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `${protocol}//${hostname}:5000`;
    }
  }

  return 'http://localhost:5000';
}

export function getWsUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_WS_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  return httpToWsUrl(getApiBase());
}

export const apiUrl = (path: string) => {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBase()}${normalized}`;
};

/** @deprecated use getWsUrl() — kept for imports that expect wsUrl */
export const wsUrl = typeof window !== 'undefined' ? getWsUrl() : 'ws://localhost:5000';
