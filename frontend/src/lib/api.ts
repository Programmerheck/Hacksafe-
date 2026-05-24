const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:5000';

/** Derive wss:// from https:// when NEXT_PUBLIC_WS_URL is not set (Render/Railway). */
function httpToWsUrl(url: string): string {
  return url.replace(/^https:\/\//i, 'wss://').replace(/^http:\/\//i, 'ws://');
}

const WS_BASE =
  process.env.NEXT_PUBLIC_WS_URL?.replace(/\/$/, '') || httpToWsUrl(API_BASE);

export const apiUrl = (path: string) => {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
};

export const wsUrl = WS_BASE;
