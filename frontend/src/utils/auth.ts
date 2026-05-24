import { jwtDecode } from 'jwt-decode';

export interface UserDecoded {
  id: string;
  username: string;
  role: 'admin' | 'user';
  email: string;
  exp: number;
}

export const getDecodedToken = (token: string): UserDecoded | null => {
  try {
    return jwtDecode<UserDecoded>(token);
  } catch (error) {
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const decoded = getDecodedToken(token);
  if (!decoded) return true;
  
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};
